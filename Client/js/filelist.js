const filelist = {
    currentPath: "/",
    fileExts: { // 지원하는 언어 (여기에 등록되어 있으면 아이콘이 바뀜)
      "js": true,
      "html": true,
      "css": true,
      "json": true,
      "lua": true
    }
}

$(() => {
    filelist["$list"] = $(".file_container > .list");
    
    $(document).on("click", ".file_container > .list > .box", function() {
        const directory = $(this).data("directory");
        let name = $(this).data("name");
    
        /// 전으로 가라
        if (directory) {
            if (name === "../") {
                const findSlash = filelist.currentPath.lastIndexOf('/');
                name = findSlash === -1 ? "/" : filelist.currentPath.substring(0, findSlash);
            } else {
                name = `${filelist.currentPath === "" ? "" :  `${filelist.currentPath}/`}${name}`;
            }
            
            domiSocket.send("file.request.directory", name);
            return;
        }

        domiSocket.send("file.request.preview", `${filelist.currentPath === "" ? "" :  `${filelist.currentPath}/`}${name}`);
    });
});

domiSocket.addEvent("file.directory.result", function(data) {
    const $list = filelist.$list;

    if (data.path === "/") data.path = "";
    filelist.currentPath = data.path;
    $list.empty();

    // 정렬
    data.files = data.files.sort(function(a, b) {
        if (a.directory !== b.directory) { // 폴더가 우선순위
            return a.directory ? -1 : 1;
        }

        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        } else return 0;
    });

    // 해당 폴더 뒤로 갈 수 있음
    if (data.path !== "")
      $list.append(`<div data-directory=true data-name="../" class="box folder">
          <img src="./assets/extIco/folder.svg">
          <span>../</span>
      </div>`);

    $.each(data.files, function(i, v) {
      let ext;
      let logo = v.directory ? "folder" : "file";
      if (!v.directory && v.name.lastIndexOf('.') !== -1) {
        ext = v.name.substring(v.name.lastIndexOf('.') + 1);
        
        if (filelist.fileExts[ext])
          logo = ext;
      }
    
      $list.append(`<div data-directory=${v.directory} data-name="${v.name}" class="box ${v.directory ? "folder" : "file"}">
          <img src="./assets/extIco/${logo}.svg">
          <span>${v.name}</span>
      </div>`);
    });
});

// 변경사항
domiSocket.addEvent("file.directory.update", function(path) {
    if (typeof path === "object" && path[1]) {
        const deletedFolder = path[2]; // 만약 path[0]이 root면 사용가능
        path = path[0];
        
        // if (path !== "/") { // 이건 그냥 루트자너
            let updateFolders = path.split("/");
            const nowFolders = filelist.currentPath.split("/");

            if (path === "/")
                updateFolders = [deletedFolder];
    
            console.log("nowFolders", filelist.currentPath, nowFolders);
            console.log("updateFolders", path, updateFolders);

            if (nowFolders.length > updateFolders.length || path === "/") {
                let both = true;
                updateFolders.forEach((folder, i) => {
                    if (folder !== nowFolders[i]) {
                        both = false;
                        return false;
                    }
                });

                if (both) // 삭제된 경로 뒤로
                    domiSocket.send("file.request.directory", path);
            }
        // }
    }

    if (filelist.currentPath === (path === "/" ? "" : path)) {
        domiSocket.send("file.request.directory", path);
    }
    if (explorer.path === path) {
        domiSocket.send("explorer.directory.request", explorer.path);
    }
});