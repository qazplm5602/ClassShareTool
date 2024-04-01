const roomManager = require("./room.js");

exports.createFile = function(roomID, path /* 이 경로는 파일이름까지 포함하고 있음 */, buffer) {
  const room = roomManager.getRoom(roomID);
  if (room === undefined) return false;

  let fileName = path;
  let filePath;

  // 파일이름이랑 경로 분리
  if (path.lastIndexOf("/") !== -1) {
    filePath = path.substring(0, path.lastIndexOf("/") + 1);
    fileName = path.substring(path.lastIndexOf("/") + 1);
  }

  //폴더가 없음
  if (filePath !== undefined && room.fileIndx[filePath] === 1) return false;

  // 이미 파일이 있음 (아니면 폴더거나)
  if (room.fileIndx[path] !== undefined) return false;

  fileIndx[path] = 0;
  
  let rootAddress = room.files;

  if (filePath !== undefined)
    filePath.split("/").forEach(folder => rootAddress = rootAddress[folder]);
  
  rootAddress[fileName] = {
    data: buffer
  }

  return true;
}