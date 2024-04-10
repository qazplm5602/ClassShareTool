const explorer = {
    path: undefined,
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
            this.callback = [];
        },
        click: function(idx) {
            this.callback[idx]();
            this.hide();
        }
    },

    show() {
        console.log(this);
        if (this.path === undefined) domiSocket.send("explorer.directory.request", "/");
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
    },

    createFolder: function() {
        const currentPath = explorer.path; // 바뀔지도

        notify.show("폴더 생성", `<section style="display: flex; flex-direction: column; padding: 20px 0;">
        <span>폴더 이름을 입력하세요.</span>
        <input id="folder-name-input" type="text" placeholder="폴더 이름" />
        </section>`, [
            ["생성", () => {
                const name = $("#folder-name-input").val();

                notify.close();
                domiSocket.send("explorer.directory.create", { path: currentPath, name });
            }],
            ["취소", notify.close]
        ]);
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
            ["새 폴더", explorer.createFolder]
        ]);
    });

    const eventDisabled = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    $(".explorer_window > .box > main").on("dragenter", function(e) {
        eventDisabled(e);
        $(".explorer_window main").addClass("draged");
    }).on("dragleave", function(e) {
        eventDisabled(e);
        $(".explorer_window main").removeClass("draged");
    }).on("dragover", eventDisabled).on("drop", function(e) {
        eventDisabled(e);
        $(".explorer_window main").removeClass("draged");

        explorer.fileUpload(e.originalEvent.dataTransfer.files);
    });

    $("#explorer-upload").click(function() {
        $("#explorer-file-input").trigger("click");
    });

    $("#explorer-file-input").change(function(e) {
        explorer.fileUpload(e.target.files);
    });

    $("#class-explorer-button").click(() => explorer.show());
    $("#explorer-close").click(() => explorer.hide());
});

$(document).on("contextmenu", ".explorer_window > .box > main > .box", function(e) {
    const name = $(this).data("name");
    
    e.preventDefault();
    e.stopPropagation();
    if (name === "../") return;

    const currnetPath = explorer.path;
    explorer.contextMenu.show({x: e.pageX, y: e.pageY}, [
        ["이름 변경", function() {
            let backPath = `${currnetPath}/`;
            if (backPath === "//") backPath = "";

            notify.show("이름 변경", `<section style="display: flex; flex-direction: column; padding: 20px 0;">
            <span>변경할 파일이름을 입력하세요.</span>
            <input id="folder-name-input" type="text" placeholder="새로운 파일 이름" />
            </section>`, [
                ["변경", () => {
                    const changeName = $("#folder-name-input").val();
    
                    notify.close();
                    domiSocket.send("explorer.file.rename", {
                        path: `${backPath}${name}`,
                        name: changeName
                    });
                }],
                ["취소", notify.close]
            ]);
        }],
        ["삭제", function() {
            let backPath = `${currnetPath}/`;
            if (backPath === "//") backPath = "";

            domiSocket.send("explorer.file.delete", `${backPath}${name}`);
        }],
    ]);
}).on("click", ".explorer_window > .box > main > .box", function() {
    const name = $(this).data("name");
    const directory = $(this).data("directory");

    if (!directory) return; // 일단 폴더만 지원

    let path = (explorer.path === "/") ? name : `${explorer.path}/${name}`;
    if (name === "../") {
        if (explorer.path.includes("/")) {
            const split = explorer.path.split("/");
            path = split.splice(0, split.length - 1).join("/");
        } else path = "/";
    }

    domiSocket.send("explorer.directory.request", path);
});

domiSocket.addEvent("explorer.directory.result", function(data) {
    $(".explorer_window .path").empty();
    
    explorer.path = data.path;

    const pathSplit = data.path.split("/");
    pathSplit.forEach((v, i) => $(".explorer_window .path").append(`<span>${v}</span>${(pathSplit.length - 1 === i ? "" : "<span class='slash'>/</span>")}`));

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

    data.files = data.files.sort((a, b) => {
        if (a.directory && !b.directory) return -1;
        if (!a.directory && b.directory) return 1;
        return a.name.localeCompare(b.name);
    });

    if (data.path !== "/") {
        $(".explorer_window main").append(`
            <section data-name="../" data-directory=true class="box">
                <div class="nametag">
                    <img src="./assets/extIco/b_folder.svg">
                    <span>../</span>
                </div>
            </section>
        `);
    }

    $.each(data.files, function(_, v) {
        let fileIcon = "b_folder";

        $(".explorer_window main").append(`
            <section data-name="${v.name}" data-directory=${v.directory} class="box">
                <div class="nametag">
                    <img src="./assets/extIco/${fileIcon}.svg">
                    <span>${v.name}</span>
                </div>
    
                <span class="size">${v.size}${(v.directory ? "개" : "MB")}</span>
            </section>
        `);
    });
});

domiSocket.addEvent("explorer.upload.success", function(handle) {
    $(`#explorer-upload-progress-${handle}`).remove();
});