const roomManager = require("./room.js");

TriggerEvent["webrtc.owner.signal"] = function(roomID, playerID, signal) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];

    if (player === undefined || player.owner) return;
    
    const owner = room.players[room.ownerId];
    owner.ws.send("webrtc.request.call", {
        id: playerID,
        signal
    });
}

TriggerEvent["webrtc.caller.signal"] = function(roomID, playerID, data) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];

    if (player === undefined || !player.owner) return;

    const target = room.players[data.id];
    if (target === undefined || target.owner) return;

    target.ws.send("webrtc.request.owner", data.signal);
}