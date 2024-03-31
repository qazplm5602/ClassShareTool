const roomManager = require("./room.js");

TriggerEvent["class.init"] = function(roomID, playerID) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined) return;
    
    player.ws.send("class.init.result", {
        owner: player.owner,
        files: []
    });
}