const roomManager = require("./room.js");
const fileManager = require("./roomFile.js");
const fs = require("fs");

const fileQueue = {};

// 사이즈 제한
// 사이즈 변경할때 app.use(express.raw({limit: '5mb'})); 코드도 같이 변경 바람
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
        currentSize: 0,
        process: {}
    }

    room.fileUploads.add(token);

    for (let i = 0; i < Math.ceil(size / SPLIT_SIZE); i++) {
        fileQueue[token].process[i] = false;
    }

    res.send(token);
});

// fileQueue["domi"] = {
//     room: 0,
//     name: "domi.js",
//     path: "/",
//     size: (1024 * 1024 * 5),
//     currentSize: 0,
//     process: {
//         0: false
//     }
// }

express.post("/api/file/upload", function(req, res) {
    const { token, id } = req.query;
    if (token === undefined) {
        return res.sendStatus(400);
    }
    
    const info = fileQueue[token];
    if (info === undefined) {
        return res.sendStatus(401);
    }
    if (info.process[id] !== false) { // 이미 완료되었거나 아님 없는 순서?
        return res.sendStatus(400);
    }

    if ((info.currentSize + req.body.length) > info.size) {
        return res.sendStatus(413);
    }

    info.currentSize += req.body.length;

    info.process[id] = true;
    fs.writeFile(`./temp/uploads/${token}-${id}`, req.body, function(err) {
        res.end();

        //////////////////// 다 되었는지 검사
        let finish = true;
        Object.values(info.process).forEach(ok => {
            if (!ok) {
                finish = false;
                return false;
            }
        });

        if (finish)
            SuccessUpload(token);
    });
});

async function FilesLoads(token) {
    const info = fileQueue[token];
    const buffers = []; // 합쳐질 버퍼들
    const loop = Math.ceil(info.size / SPLIT_SIZE);
    let ok = 0;

    return new Promise((reslove, reject) => {
        for (let i = 0; i < loop; i++) {
            const idx = i;
            fs.readFile(`./temp/uploads/${token}-${i}`, function(err, data) {
                fs.unlink(`./temp/uploads/${token}-${i}`, () => {}); // 파일 삭제 (이제 필요없음)
                buffers[idx] = data;
                ok ++;

                if (loop == ok) {
                    reslove(buffers);
                }
            });
        }
    });
}

async function SuccessUpload(token) {
    let info = fileQueue[token];
    if (info === undefined) return;

    let buffers = await FilesLoads(token);

    info = fileQueue[token];
    if (info === undefined) return;
    
    if (buffers.length > 1) {
        Buffer.concat(buffers);
    } else buffers = buffers[0];

    fileManager.createFile(info.room, (info.path === "/" ? info.name : `${info.path}/${info.name}`), buffers);
    
    delete fileQueue[token];

    const room = roomManager.getRoom(info.room);
    if (room === undefined) return;

    room.fileUploads.delete(token);
}

