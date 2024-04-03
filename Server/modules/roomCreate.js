const room = require("./room.js");
const fileSystem = require("./roomFile.js");

express.get("/api/room/create", function(req, res) {
    const [id, password] = room.createRoom();

    // TEST file
    fileSystem.createFile(id, "domi.js", `console.log("hello domi!");`);
    fileSystem.createDirectory(id, "testFolder");
    fileSystem.createFile(id, "testFolder/domi.lua", `print("hello domi!")`);

    res.json({
        result: true,
        id,
        password
    });
});

