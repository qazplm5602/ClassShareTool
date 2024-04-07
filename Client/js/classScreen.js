const classScreen = {
    peer: undefined, // 방장과 연결된것
    peers: {}, // 화면 보고있는사람들 (내가 방장일때)
    peerConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
    roomID: -1,
    password: undefined,
    
    reset: function() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = undefined;
        }
        Object.values(this.peers).forEach(peer => peer.destroy());
        this.peers = {};
        this.roomID = -1;
        this.password = undefined;

        explorer.path = undefined;
        explorer.hide();
        codeBlock.hide();
    }
}

$(function() {
    $("#class-exit-button").click(function() {
        domiSocket.close();
    });
});

domiSocket.addEvent("class.init.result", function(data) {
    console.log("class.init.result", data);
    $("#class-code").text(data.room);

    
    // 주인이면 peer 만들 필요 없음
    if (data.owner) {
        console.log("my owner!", $("#class-video")[0].srcObject, screenStream.stream);
        $("#class-video")[0].srcObject = screenStream.stream;
        $("#class-video")[0].play();
    } else { // 방장이랑 연결 ㄱㄱ
        const peer = classScreen.peer = new SimplePeer({ initiator: true, config: classScreen.peerConfig, });
        peer.on("signal", data => {
            domiSocket.send("webrtc.owner.signal", data);
        });
        peer.on("stream", stream => {
            $("#class-video")[0].srcObject = stream;
            $("#class-video")[0].play();
        });
    }
    $("#class-explorer-button").toggle(data.owner);

    domiSocket.send("file.request.directory", "/");
    $(".class_screen").fadeIn(300, function() {
        $("#main_screen").hide();
    });
});

// 보는사람 -> owner
domiSocket.addEvent("webrtc.request.call", function(data) {
    let peer = classScreen.peers[data.id];
    if (peer === undefined) {
        peer = classScreen.peers[data.id] = new SimplePeer({
            stream: screenStream.stream,
            config: classScreen.peerConfig
        });
        
        peer.on("signal", signal => {
            domiSocket.send("webrtc.caller.signal", {id: data.id, signal});
        });
    }

    peer.signal(data.signal);
});

// owner -> 보는사람 한명
domiSocket.addEvent("webrtc.request.owner", function(signal) {
    classScreen.peer.signal(signal);
});

domiSocket.addEvent("webrtc.disconnect.player", function(id) {
    classScreen.peers[id]?.destroy();
    delete classScreen.peers[id];
});