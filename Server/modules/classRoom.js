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

TriggerEvent["file.request.download"] = function(roomID, playerID, path) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined) return;
    
    const fileBuffer = fileSystem.getFile(roomID, path);
    if (fileBuffer === undefined) return;

    let fileName = path;
    if (path.includes("/")) {
        fileName = path.substring(path.lastIndexOf('/') + 1);
    }

    player.ws.send("file.result.download", {
        name: fileName,
        buffer: fileBuffer
    });
}

//////// admin 파일
TriggerEvent["explorer.directory.request"] = function(roomID, playerID, path) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined || room.ownerId !== playerID) return;

    const files = fileSystem.getDirectory(roomID, path);
    if (files === false) return; // 머임

    files.map(value => {
        let file = 0;
        let directory = 0;
        const file_path = (path === "/" ? value.name : `${path}/${value.name}`);

        if (value.directory) {
            const list = fileSystem.getDirectory(roomID, file_path);
            if (list)
                list.forEach(({directory: isFolder}) => {
                    if (isFolder) directory++;
                    else file++;
                });

            value.size = [file,directory];
        } else {
            const data = fileSystem.getFileData(roomID, file_path);
            value.size = Math.ceil(data.size / 1024);
        }

        return value;
    });

    player.ws.send("explorer.directory.result", {path, files});
}

TriggerEvent["explorer.directory.create"] = function(roomID, playerID, data) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];
    
    if (player === undefined || room.ownerId !== playerID || typeof(data) !== "object" || data.path === undefined || typeof(data.name) !== "string" || data.name.length === 0) return;

    fileSystem.createDirectory(roomID, `${(data.path === '/' ? '' : `${data.path}/`)}${data.name}`);
}

TriggerEvent["explorer.file.delete"] = function(roomID, playerID, path) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];

    if (player === undefined || room.ownerId !== playerID || typeof(path) !== "string") return;

    const isDirectory = room.fileIndx[path];
    if (isDirectory === undefined) return; // 그냥 파일이 없음

    if (isDirectory) {
        fileSystem.removeDirectory(roomID, path);

        // 전체에게 변경사항 알림 ( removeDirectory는 재귀함수라 여러번 호출 방지 )
        let lastFolder;
        if (path.includes("/"))
            lastFolder = path.substring(0, path.lastIndexOf('/'));

        Object.values(room.players).forEach(({ws}) => ws.send("file.directory.update", [lastFolder || "/", true /* 경로 추적 */, path]));
    } else fileSystem.removeFile(roomID, path);
}

TriggerEvent["explorer.file.rename"] = function(roomID, playerID, data) {
    const room = roomManager.getRoom(roomID);
    const player = room.players[playerID];

    if (player === undefined || room.ownerId !== playerID || typeof(data) !== "object" || data.path === undefined || data.name === undefined) return;

    const isDirectory = room.fileIndx[data.path];
    if (isDirectory === undefined) return; // 그냥 파일이 없음

    if (isDirectory) {
        
    } else {
        fileSystem.renameFile(roomID, data.path, data.name);
    }
}