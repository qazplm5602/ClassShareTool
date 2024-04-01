const codeBlock = {
    waitHandler: undefined,

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