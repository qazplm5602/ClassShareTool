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