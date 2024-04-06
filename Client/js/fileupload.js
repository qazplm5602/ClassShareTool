explorer.fileUpload = function(files) {
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 크기 검사
        // 이미 있는 파일인지 검사

        this.fileUploadStart(file);
    }
}

explorer.getPercent = function(min, max) {
    return Math.floor((min / max) * 100);
}

explorer.fileUploadStart = async function(file) {
    const query = {
        room: classScreen.roomID,
        password: classScreen.password,
        file: file.name,
        size: file.size,
        path: this.path
    }

    const savePath = this.path;

    const uploadHandle = await fetch(`${_CONFIG.api}api/file/create?${new URLSearchParams(query)}`).then(v => v.text());
    const reader = new FileReader();
    
    $(".explorer_window .upload_main > .window").append(`
        <div class="box" id="explorer-upload-progress-${uploadHandle}">
            <div class="left">
                <span>${file.name}</span>
                <span>${savePath}</span>
            </div>

            <div class="right">
                <span>파일 읽는중...</span>
                <button><img src="./assets/cancel.svg"></button>
            </div>
        </div>
    `);
    const $element = $(`#explorer-upload-progress-${uploadHandle}`);

    reader.onload = function(event) {
        const buffer = event.target.result;
        const max = Math.ceil(file.size / _CONFIG.upload_size);
        let success = 0;

        $element.find(".right > span").text("0%");

        for (let i = 0; i < max; i++) {
            fetch(`${_CONFIG.api}api/file/upload?id=${i}&token=${uploadHandle}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: buffer.slice(_CONFIG.upload_size * i, Math.min((_CONFIG.upload_size * i) + _CONFIG.upload_size, file.size))
            }).then(response => {
                if (response.ok) {
                    success ++;
                    $element.find(".right > span").text(`${explorer.getPercent(success, max)}%`);
                }
            });
        }
    }
    reader.readAsArrayBuffer(file);
}