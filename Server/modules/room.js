class RoomClass {
    id = undefined;
    password = undefined;
    
    playerCount = 0;
    players = {};

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
