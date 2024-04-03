const fs = require("fs");
const path = require("path");
const roomManager = require("./room.js");

exports.createFile = function(roomID, path /* 이 경로는 파일이름까지 포함하고 있음 */, buffer) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined) return false;

  let fileName = path;
  let filePath;

  // 파일이름이랑 경로 분리
  if (path.lastIndexOf("/") !== -1) {
    filePath = path.substring(0, path.lastIndexOf("/"));
    fileName = path.substring(path.lastIndexOf("/") + 1);
  }

  //폴더가 없음
  if (filePath !== undefined && room.fileIndx[filePath] !== 1) return false;

  // 이미 파일이 있음 (아니면 폴더거나)
  if (room.fileIndx[path] !== undefined) return false;

  room.fileIndx[path] = 0;
  
  let rootAddress = room.files;

  if (filePath !== undefined) {
    filePath.split("/").forEach(folder => rootAddress = rootAddress[folder]);
  }
  
  rootAddress[fileName] = {
    // data: buffer
  }
  fs.writeFileSync(`./temp/${roomID}/${path}`, buffer);

  return true;
};

exports.createDirectory = function(roomID, path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined) return false;

  let folderName = path;
  let lastFolder;

  if (path.lastIndexOf("/") !== -1) {
    lastFolder = path.substring(path.lastIndexOf("/"));
  }

  // 폴더가 없음
  if (lastFolder !== undefined && room.fileIndx[lastFolder] !== 1) return false;

  // 이미 폴더가 있음 (아니면 파일이거나)
  if (room.fileIndx[path] !== undefined) return false;

  room.fileIndx[path] = 1;
  
  let rootAddress = room.files;
  if (lastFolder !== undefined)
    lastFolder.split("/").forEach(folder => rootAddress = rootAddress[folder]);

  rootAddress[folderName] = {};
  fs.mkdirSync(`./temp/${roomID}/${path}`);
  
  return true;
};

exports.existDirectory = function(path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined) return false;

  return room.fileIndx[path] === 1;
};

exports.getFile = function(roomID, path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined || room.fileIndx[path] !== 0) return;

  let lastFolder;
  let fileName = path;

  if (path.lastIndexOf("/") !== -1) {
    lastFolder = path.substring(0, path.lastIndexOf("/"));
    fileName = path.substring(path.lastIndexOf("/") + 1);
  }

  // let rootAddress = room.files;
  // if (lastFolder !== undefined)
  //   lastFolder.split("/").forEach(folder => rootAddress = rootAddress[folder]);

  const buffer = fs.readFileSync(`./temp/${roomID}/${path}`);

  return buffer;
};

// path '/' 이면 root임
exports.getDirectory = function(roomID, path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined || (path !== "/" && room.fileIndx[path] !== 1)) return false;

  let rootAddress = room.files;
  if (path !== "/")
    path.split("/").forEach(folder => rootAddress = rootAddress[folder]);

  const result = [];

  for (const name in rootAddress) {
    const state = room.fileIndx[`${path === "/" ? "" : `${path}/`}${name}`];
    if (state !== undefined)
      result.push({name, directory: state === 1});
  }

  return result;
}

exports.removeFile = function(roomID, path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined || room.fileIndx[path] !== 0) return false;

  let lastFolder;
  let fileName = path;

  if (path.lastIndexOf("/") !== -1) {
    lastFolder = path.substring(0, path.lastIndexOf("/"));
    fileName = path.substring(path.lastIndexOf("/") + 1);
  }

  delete room.fileIndx[path];

  let rootAddress = room.files;
  if (lastFolder !== undefined)
    lastFolder.split("/").forEach(folder => rootAddress = rootAddress[folder]);

  delete rootAddress[fileName];
  fs.unlinkSync(`./temp/${roomID}/${path}`);

  return true;
};

exports.removeDirectory = function(roomID, path) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined || room.fileIndx[path] !== 1) return false;

  let lastFolder;
  let folderName = path;

  if (path.lastIndexOf("/") !== -1) {
    lastFolder = path.substring(0, path.lastIndexOf("/"));
    folderName = path.substring(path.lastIndexOf("/") + 1);
  }

  let rootAddress = room.files;
  if (lastFolder !== undefined)
    lastFolder.split("/").forEach(folder => rootAddress = rootAddress[folder]);

  for (const key in rootAddress[folderName]) {
    const myPath = lastFolder ? `${lastFolder}/${folderName}/${key}` : `${folderName}/${key}`;
    const myState = room.fileIndx[myPath];
    
    if (myState === 1) {
      exports.removeDirectory(roomID, myPath); // 그 안에 있는 파일들도 다 삭제해 ㄹㅇ
    } else {
      delete room.fileIndx[myPath]; // 인덱싱된거 삭제
    }
    // if (exports.removeDirectory(roomID, `${lastFolder}/${folderName}/`))
  }

  delete rootAddress[folderName];
  delete room.fileIndx[lastFolder ? `${lastFolder}/${folderName}` : folderName];
  fs.rmSync(`./temp/${roomID}/${path}`, { recursive: true, force: true });

  return true;
};

// TEST
// const { isBinary } = require('istextorbinary');
(function() {
  // temp폴더 비우기
  // fs.readdir("./temp", (err, files) => {
  //   if (err) throw err;
  
  //   for (const file of files) {
  //     fs.unlink(path.join("./temp", file), (err) => {
  //       if (err) throw err;
  //     });
  //   }
  // });

  const [id, password] = roomManager.createRoom();
  const room = roomManager.getRoom(id);

  console.log(exports.createFile(id, "test.txt", Buffer.from("test")));
  console.log(exports.createDirectory(id, "domiFolder"));
  console.log(exports.createFile(id, "domiFolder/hello.cs", Buffer.from("test!!!")));
  console.log(exports.createDirectory(id, "testFolder"));
  console.log(exports.createFile(id, "testFolder/hello.cs", Buffer.from("test!!!")));
  console.log(exports.createFile(id, "testFolder/hello222.cs", Buffer.from("test!!!")));

  console.log("---------------");
  console.log(exports.getFile(id, "test.txt"));
  console.log(exports.getFile(id, "domiFolder/hello.cs"));
  console.log(exports.getFile(id, "domiFolder/hdello.cs"));
  console.log(exports.getFile(id, "hdello.cs"));

  console.log("---------------");
  // console.log(exports.removeFile(id, "testFolder/hello222.cs"));
  // console.log(exports.removeDirectory(id, "testFolder"));

  console.log(exports.getDirectory(id, "/"));
  console.log(exports.getDirectory(id, "testFolder"));
  console.log(exports.getDirectory(id, "testFolder/helloooo"));
  console.log(exports.getDirectory(id, "testFolder/hellooooasdad"));

  // console.log(room.files, room.fileIndx);

  // const fileBuffer = exports.getFile(id, "domiFolder/hello.cs");
  //   console.log(fileBuffer, isBinary(null, fileBuffer), fileBuffer.byteLength);
})();