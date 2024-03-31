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
    this.ws.onmessage = function(event) {
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
        
        callback(data);
    }

    this.ws.onclose = function() {
        console.log("socket closed");
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