class RoomClass {
    id = undefined;
    password = undefined;
    
    playerCount = 0;
    ownerId = -1;
    players = {};

    files = {
        "domi.js" : {
            data: new ArrayBuffer(2)
        },
        "testFolder" : {
            "README.md": {
                data: new ArrayBuffer(2)
            },
            "helloooo": {
                "c안녕.txt": { data: Buffer.from("testtest") },
                "b하세요.txt": { data: Buffer.from("testtest") },
                "adomi.lua": { data: Buffer.from("testtest") },
                "btestfolder": { },
                "ctestfolder": { },
            }
        }
    };
    fileIndx = { // 0: 파일 1: 폴더
        "domi.js": 0,
        "testFolder": 1,
        "testFolder/README.md": 0,
        "testFolder/helloooo": 1,
        "testFolder/helloooo/c안녕.txt": 0,
        "testFolder/helloooo/b하세요.txt": 0,
        "testFolder/helloooo/adomi.lua": 0,
        "testFolder/helloooo/btestfolder": 1,
        "testFolder/helloooo/ctestfolder": 1,
    };

    constructor(id) {
        this.id = id;
    }
}

const rooms = exports.rooms = {};

exports.createRoom = function() {
    const id = randomNum(100000, 999999);
    const room = rooms[id] = new RoomClass(id);

    // 비밀번호 지정
    room.password = randomStr(10);

    return [id, room.password];
}

exports.getRoom = function(id) {
    return rooms[id];
}

exports.existRoom = function(id) {
    return exports.getRoom(id) !== undefined;
}

exports.addPlayer = function(roomID, connection, perm) {
    const room = exports.getRoom(roomID);
    if (room === undefined) return false;

    const myIdx = room.playerCount++;
    room.players[myIdx] = { ws: connection, owner: perm };

    if (perm) // 주인장 아이디 저장
        room.ownerId = myIdx;

    return myIdx;
}

exports.removePlayer = function(roomID, playerID) {
    const room = exports.getRoom(roomID);
    if (room === undefined) return false;

    delete room.players[playerID];
    return true;
}

function randomNum(min, max) {
    const ran = Math.floor(Math.random() * (max - min + 1)) + min;
    if (exports.existRoom(ran)) return randomNum(min, max); // 다시 돌려

    return ran;
}

function randomStr(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
