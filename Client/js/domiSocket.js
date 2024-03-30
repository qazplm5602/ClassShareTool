const domiSocket = {
    ws: undefined,
    _events: {},
}

// 이벤트
domiSocket.addEvent = function(type, cb) {
    this._events[type] = cb;
}

domiSocket.connect = async function(id, password) {
    
}