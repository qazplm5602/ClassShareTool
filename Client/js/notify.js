const notify = {
    callback: {},
    waitHandler: undefined,
    show: function(title, content, buttons) {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".notify_window").show();
        this.waitHandler = setTimeout(() => {
            $(".notify_window").removeClass("hide");
        }, 10);
    },
    close: function() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".notify_window").addClass("hide");
        this.waitHandler = setTimeout(() => {
            $(".notify_window").hide();
        }, 250);
    }
}