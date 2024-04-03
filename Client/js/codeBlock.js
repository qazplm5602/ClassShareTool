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

domiSocket.addEvent("file.result.preview", function(data) {
    // console.log(data);
    codeBlock.path = data.path;

    if (data.content == false) {
        $("#class-code-block").html("이 파일은 바이너리 입니다. (코드가 아닌데숭)");
    } else {
        $("#class-code-block").text(data.content);
        hljs.highlight($("#class-code-block")[0]);
    }
    codeBlock.show();
});