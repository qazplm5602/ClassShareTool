const explorer = {
    path: "/",
    
    contextMenu: {
        callback: [],
        show: function({x,y}, buttons) {
            $(".explorer_window .context_menu").empty();
            this.callback = [];
            $.each(buttons, (i, v) => {
                this.callback[i] = v[1];
                $(".explorer_window .context_menu").append(`<button onclick="explorer.contextMenu.click(${i})">${v[0]}</button>`);
            });
            $(".explorer_window .context_menu").css({
                left: x,
                top: y
            }).show();
        },
        hide: function() {
            $(".explorer_window .context_menu").hide();
        },
        click: function(idx) {
            this.hide();
            this.callback[idx]();
        }
    }
}

$(function() {
    $(".explorer_window > .box").click(explorer.contextMenu.hide);
    $(".explorer_window .context_menu").click(function(e) {
        e.stopPropagation();
    });

    $(".explorer_window > .box > main").contextmenu(function(e) {
        e.preventDefault();
        explorer.contextMenu.show({x: e.pageX, y: e.pageY}, [
            ["새 폴더", () => {}]
        ]);
    });
});

$(document).on("contextmenu", ".explorer_window > .box > main > .box", function(e) {
    e.preventDefault();

    explorer.contextMenu.show({x: e.pageX, y: e.pageY}, [
        ["이름 변경", function() {
            
        }],
        ["삭제", function() {

        }],
    ]);
});