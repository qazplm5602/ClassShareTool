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

$(() => filelist["$list"] = $(".file_container > .list"));

domiSocket.addEvent("file.directory.result", function(data) {
    const $list = filelist.$list;
    filelist.currentPath = data.path;
    $list.empty();

    console.log(data.files);

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
    if (data.path !== "/")
      $list.append(`<div class="box folder">
          <img src="./assets/extIco/folder.svg">
          <span>../</span>
      </div>`);

    $.each(data.files, function(i, v) {
      let ext;
      let logo = v.directory ? "folder" : "file";
      if (!v.directory && v.name.lastIndexOf('.') !== -1) {
        ext = v.name.substring(v.name.lastIndexOf('.'));

        if (filelist.fileExts[ext])
          logo = ext;
      }
    
      $list.append(`<div class="box ${v.directory ? "folder" : "file"}">
          <img src="./assets/extIco/${logo}.svg">
          <span>${v.name}</span>
      </div>`);
    });
});