const classScreen = {
    peer: undefined, // 방장과 연결된것
    peers: {}, // 화면 보고있는사람들 (내가 방장일때)
}

domiSocket.addEvent("class.init.result", function(data) {
    console.log("class.init.result", data);
    $("#class-code").text(data.room);

    
    // 주인이면 peer 만들 필요 없음
    if (data.owner) {
        console.log("my owner!", $("#class-video")[0].srcObject, screenStream.stream);
        $("#class-video")[0].srcObject = screenStream.stream;
        $("#class-video")[0].play();
    } else { // 방장이랑 연결 ㄱㄱ
        const peer = classScreen.peer = new SimplePeer({ initiator: true });
        peer.on("signal", data => {
            domiSocket.send("webrtc.owner.signal", data);
        });
        peer.on("stream", stream => {
            $("#class-video")[0].srcObject = stream;
            $("#class-video")[0].play();
        });
    }

    domiSocket.send("file.request.directory", "");
    $(".class_screen").fadeIn(300);
});

// 보는사람 -> owner
domiSocket.addEvent("webrtc.request.call", function(data) {
    let peer = classScreen.peers[data.id];
    if (peer === undefined) {
        peer = classScreen.peers[data.id] = new SimplePeer({
            stream: screenStream.stream
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