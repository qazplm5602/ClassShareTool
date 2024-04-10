const notify = {
    callback: {},
    waitHandler: undefined,
    show: function(title, content, buttons) {
        if (this.waitHandler) clearTimeout(this.waitHandler);

        $(".notify_window .title").text(title);
        $(".notify_window main").html(content);
        
        $(".notify_window .buttons").empty();
        buttons.forEach((button, i) => {
            $(".notify_window .buttons").append(`<button data-id=${i}>${button[0]}</button>`);
            this.callback[i] = button[1];
        });
        
        $(".notify_window").show();
        this.waitHandler = setTimeout(() => {
            $(".notify_window").removeClass("hide");
        }, 10);
    },
    close: function() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        this.callback = {};
        
        $(".notify_window").addClass("hide");
        this.waitHandler = setTimeout(() => {
            $(".notify_window").hide();
        }, 250);
    },
    click: function(idx) {
        this.callback[idx]();
    }
}

$(document).on("click", ".notify_window .buttons > button", function() {
    const idx = $(this).data("id");
    notify.click(idx);
});