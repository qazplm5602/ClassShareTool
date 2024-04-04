const explorer = {
    path: "/",
    waitHandler: undefined,
    
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
    },

    show() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".explorer_window").show();
        this.waitHandler = setTimeout(() => {
            $(".explorer_window").removeClass("hide");
        }, 10);
    },

    hide() {
        if (this.waitHandler) clearTimeout(this.waitHandler);
        
        $(".explorer_window").addClass("hide");
        this.waitHandler = setTimeout(() => {
            $(".explorer_window").hide();
        }, 250);
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

domiSocket.addEvent("explorer.directory.request", function(data) {
    $(".explorer_window .path").empty();
    
    explorer.path = data.path;

    const pathSplit = data.path.split("/");
    pathSplit.forEach((v, i) => $(".explorer_window .path").append(`<span>${v}</span>${(pathSplit.length - 1 === i ? "" : "<span>/</span>")}`));

    $(".explorer_window > .box > main").empty();

    ////////////////////////////////
    /*
        {
            name: "domi.js",
            directory: false,
            size: 12345,
        }
        {
            name: "testFolder",
            directory: true,
            size: 10, // 폴더일때는 파일 갯수
        }
    */

    
});