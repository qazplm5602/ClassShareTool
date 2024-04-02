const filelist = {
    currentPath: "/"
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

    $.each(data.files, function(i, v) {
        
    });
});