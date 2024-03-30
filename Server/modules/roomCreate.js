const room = require("./room.js");

express.get("/api/room/create", function(req, res) {
    const [id, password] = room.createRoom();

    res.json({
        result: true,
        id,
        password
    });
});

