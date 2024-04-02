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
    data: buffer
  }

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
  
  return true;
};

// TEST
(function() {
  const [id, password] = roomManager.createRoom();
  const room = roomManager.getRoom(id);

  console.log(exports.createFile(id, "test.txt", Buffer.from("test")));
  console.log(exports.createDirectory(id, "domiFolder"));
  console.log(exports.createFile(id, "domiFolder/hello.cs", Buffer.from("test!!!")));
  console.log(exports.createFile(id, "testFolder/hello.cs", Buffer.from("test!!!")));
  console.log(room.files, room.fileIndx);
})();