const roomManager = require("./room.js");
const fileQueue = {};

const SPLIT_SIZE = 1024 * 1024 * 5

function randomStr(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

express.get("/api/file/create", function(req, res) {
    const { 
        room: roomID,
        password,
        file,
        path,
        size
    } = req.query;

    if (roomID === undefined || isNaN(Number(roomID)) || password === undefined || file === undefined || path === undefined || isNaN(Number(size))) {
        res.sendStatus(400);
        return;
    }

    const room = roomManager.getRoom(roomID);
    if (room === undefined || room.password !== password) {
        res.sendStatus(401);
        return;
    }

    if (path !== "/" && room.fileIndx[path] !== 1) {
        res.sendStatus(400);
        return;
    }

    const token = randomStr(15);
    fileQueue[token] = {
        room: roomID,
        name: file,
        path,
        size,
        process: {}
    }

    for (let i = 1; i <= Math.ceil(size / SPLIT_SIZE); i++) {
        fileQueue[token].process[i] = false;
    }

    res.send(token);
});

express.post("/api/file/upload", function(req, res) {

});