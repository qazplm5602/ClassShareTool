const codeBlock = {
    waitHandler: undefined,
    path: undefined,

    show() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".code_window").show();
        this.waitHandler = setTimeout(() => {
            $(".code_window").removeClass("hide");
        }, 10);
    },

    hide() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".code_window").addClass("hide");
        this.waitHandler = setTimeout(() => {
            $(".code_window").hide();
        }, 250);
    }
}

$(function() {
    $(".code_window").click(function() {
        codeBlock.hide();
    }).find(".box").click(e => e.stopPropagation());
    $("#class-code-close").click(codeBlock.hide);

    $("#class-code-download").click(function() {
        domiSocket.send("file.request.download", codeBlock.path);
    });
});

domiSocket.addEvent("file.result.preview", function(data) {
    // console.log(data);
    codeBlock.path = data.path;
    
    let fileName = data.path;
    let fileExt;
    
    if (data.path.includes("/")) {
        fileName = data.path.substring(data.path.lastIndexOf("/") + 1);
    }
    
    if (fileName.includes("."))
        fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);

    console.log(fileName, fileExt);

    $(".code_window header .title").text(`파일: ${fileName}`);

    if (data.content == false) {
        $("#class-code-block").attr("class", "hljs").html("이 파일은 바이너리 입니다. (코드가 아닌데숭)");
    } else {
        $("#class-code-block").attr("class", fileExt ? `language-${fileExt}` : null).attr("data-highlighted", null).text(data.content);
        hljs.highlightElement($("#class-code-block")[0]);
    }
    codeBlock.show();
});

domiSocket.addEvent("file.result.download", function(data) {
    // console.log(data.buffer);
    console.log(data.buffer.data);
    const buffer = new Uint8Array(data.buffer.data).buffer;

    // const blob = new Blob([data.buffer], {type: "text/javascript"});
    const blob = new Blob([buffer]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = data.name; // 다운로드될 파일명 설정

    a.click();
});