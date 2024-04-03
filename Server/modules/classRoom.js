const { isBinary } = require('istextorbinary');
const roomManager = require("./room.js");
const fileSystem = require("./roomFile.js");

TriggerEvent["class.init"] = function(roomID, playerID) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined) return;
    
    player.ws.send("class.init.result", {
        room: roomID,
        owner: player.owner,
        files: []
    });
}

//////// 파일
TriggerEvent["file.request.directory"] = function(roomID, playerID, path) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined) return;

    const files = fileSystem.getDirectory(roomID, path);
    if (files === false) return; // 머임
    player.ws.send("file.directory.result", {path, files});
}

TriggerEvent["file.request.preview"] = function(roomID, playerID, path) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined) return;

    const fileBuffer = fileSystem.getFile(roomID, path);
    if (fileBuffer === undefined) return; // 파일이 없음

    player.ws.send("file.result.preview", {
        path,
        content: isBinary(null, fileBuffer) ? false : fileBuffer.toString()
    });

    // console.log(fileBuffer.byteLength);
}