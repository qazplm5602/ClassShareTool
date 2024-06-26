const domiSocket = {
    ws: undefined,
    _events: {},
}

// 이벤트
domiSocket.addEvent = function(type, cb) {
    this._events[type] = cb;
}

domiSocket.connect = function(id, password) {
    return new Promise(reslove => {
        this.ws = new WebSocket(`${_CONFIG.ws}`);

        this.ws.onopen = () => {
            // reslove({result: true});
            this.ws.send(`${id}|${(password || '')}`);
        }

        this.ws.onmessage = (event) => {
            if (event.data === 'success') {
                this.eventInit();
                reslove({result: true});
            } else {
                this.ws.close();
                reslove({result: false});
            }
        }

        this.ws.onerror = function() {
            reslove({result: false});
        }
        
        this.ws.onclose = function(event) {
            reslove({result: false, code: event.code, reason: event.reason});
        }
    });
}

domiSocket.eventInit = function() {
    this.ws.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch {
            return;
        }

        if (data.type === undefined) return;
        const callback = this._events[data.type];
        if (typeof callback !== "function") {
            console.error(`not found event: ${data.type}`);
            return;   
        }
        
        callback(data.data);
    }

    this.ws.onclose = function(event) {
        console.log("socket closed");

        mainScreen.reset();

        let reason = "서버와 연결이 끊어졌습니다.";
        if (event.code === 1000)
            reason = event.reason === "Normal connection closure" ? "서버가 연결을 끊었습니다." : event.reason;
    
        $("#main-error-text").text(reason);

        // classScreen 초기화
        classScreen.reset();

        $(".class_screen").hide();
        mainScreen.show();
    }

    this.ws.onerror = function() {
        console.log("socket error");
    }

    this.ws.onopen = function() {
        console.log("socket open");
    }

    // this.ws.send = function(type, data) {
    //     this.send(JSON.stringify(type, data));
    // }
}

domiSocket.send = function(type, data) {
    if (this.ws === undefined) throw new Error("socket이 연결되어 있지 않습니다.");
    
    this.ws.send(JSON.stringify({type, data}));
}

domiSocket.close = function() {
    if (this.ws === undefined) throw new Error("socket이 연결되어 있지 않습니다.");
    
    this.ws.close();
    this.ws = undefined;
}