const classScreen = {
    peer: undefined, // 방장과 연결된것
    peers: {} // 화면 보고있는사람들 (내가 방장일때)
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
    }

    $(".class_screen").fadeIn(300);
});