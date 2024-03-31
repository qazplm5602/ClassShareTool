$(function() {




    //////////////////////////////////////////// 방 생성
    let cameraViewWiat;
    $("#main-create-class").click(function() {
        if (cameraViewWiat) clearTimeout(cameraViewWiat);

        $("#main-camera-view-create").attr("disabled", true);
        $("#main-camera-view > .box").addClass("hide");
        $("#main-camera-view").fadeIn(250, 'swing');
        cameraViewWiat = setTimeout(() => {
            cameraViewWiat = undefined;
            $("#main-camera-view > .box").removeClass("hide");
        }, 10);

        screenStream.addDisableEvent(onScreenDisable);
        RequestScreen();
    });
    $("#main-camera-view-close").click(function() {
        if (cameraViewWiat) clearTimeout(cameraViewWiat);
        cameraViewWiat = undefined;

        $("#main-camera-view > .box").addClass("hide");
        $("#main-camera-view").fadeOut(250, 'swing');
        screenStream.destory();
        screenStream.removeDisableEvent(onScreenDisable);
    });
    $("#main-camera-view-create").click(function() {
        if (screenStream.stream === undefined) return;

        $("#main-loading").fadeIn(250, 'swing');
        screenStream.removeDisableEvent(onScreenDisable);

        $.get(`${_CONFIG.api}api/room/create`).
        done(function(data) {
            roomJoin(data.id, data.password);
        })
        .fail(function() {
            console.log("error");
        });
    });
    $("#main-camera-view .screen-error").click(RequestScreen);

    function RequestScreen() {
        const $screenContainer = $("#main-camera-view > .box > .screen-container");
        screenStream.request().then(result => {
            if (!result) return;

            $screenContainer.find(".screen-error").hide();
            $screenContainer.find("video")[0].srcObject = screenStream.stream;
            $screenContainer.find("video")[0].play();
            $("#main-camera-view-create").attr("disabled", false);
        });
    }
    function onScreenDisable() {
        $("#main-camera-view video")[0].srcObject = null;
        $("#main-camera-view .screen-error").show();
        $("#main-camera-view-create").attr("disabled", true);
    }


    //////////////////////////////////////////// 방 입장
    async function roomJoin(id, password) {
        $("#main-loading").fadeIn(250, 'swing');
    
        const response = await domiSocket.connect(id, password);

        if (!response.result) {
            $("#main-error-text").text("서버에 연결할 수 없습니다.");
            return;
        }

                
    }
});
