explorer.fileUpload = function(files) {
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 크기 검사
        // 이미 있는 파일인지 검사

        this.fileUploadStart(file);
    }
}

explorer.fileUploadStart = async function(file) {
    const query = {
        room: classScreen.roomID,
        password: classScreen.password,
        file: file.name,
        size: file.size,
        path: this.path
    }

    const uploadHandle = await fetch(`${_CONFIG.api}api/file/create?${new URLSearchParams(query)}`).then(v => v.text());
    const reader = new FileReader();

    reader.onload = function(event) {
        const buffer = event.target.result;
        console.log(buffer);
        for (let i = 0; i < Math.ceil(file.size / _CONFIG.upload_size); i++) {
            const idx = i;

            fetch(`${_CONFIG.api}api/file/upload?id=${i}&token=${uploadHandle}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: buffer.slice(_CONFIG.upload_size * i, Math.min((_CONFIG.upload_size * i) + _CONFIG.upload_size, file.size))
            }).then(response => {
                console.log(response);
            });
        }
    }
    reader.readAsArrayBuffer(file);
}