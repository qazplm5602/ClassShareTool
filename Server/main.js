const express = require("express");
const websocket = require("websocket");

global.TriggerEvent = {};
const app = global.express = express();

require("./modules/roomCreate.js");

const server = app.listen(3000, () => console.log("server on port 3000"));


const wsServer = new websocket.server({
    httpServer: server
});

const roomManager = require("./modules/room.js");
wsServer.on("request", (req) => {
    const connection = req.accept(null, req.origin);
    const authTimer = setTimeout(() => {
        // connection.close();
    }, 1000 * 30);

    // events
    const onMessage = function(message) {
        if (message.type !== "utf8") {
            connection.close();
            return;
        }
        
        const [code, password] = message.utf8Data.split("|");
        if (isNaN(Number(code))) {
            connection.close();
            return;
        }

        const roomID = Number(code);
        if (!roomManager.existRoom(roomID)) {
            connection.close();
            return;
        }

        clearTimeout(authTimer);
        connection.off("message", onMessage);
        connection.off("close", onClose);

        RegisterUser(connection, roomID, password);
    }

    const onClose = function() {
        clearTimeout(authTimer);
    }

    connection.on("message", onMessage);
    connection.on("close", onClose);
});

function RegisterUser(connection, roomID, pass) {
    const room = roomManager.getRoom(roomID);
    const playerID = roomManager.addPlayer(roomID, connection, room.password !== undefined && room.password === pass);
    if (playerID === false) {
        connection.close();
        return;
    }

    connection.on("message", (msg) => {
        if (msg.type !== "utf8") return;
        let data;
        
        try {
            data = JSON.parse(msg.utf8Data);
        } catch {
            return;
        }

        if (data.type === undefined) return;
        const callback = global.TriggerEvent[data.type];
        if (typeof callback !== "function") {
            console.error(`not found event: ${data.type}`);
            return;   
        }
        
        callback(roomID, playerID, data);
    });

    connection.on("close", (resCode, desc) => {
        roomManager.removePlayer(roomID, playerID);
        console.log("connection closed", resCode, desc);
    });
}