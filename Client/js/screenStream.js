const screenStream = {
    stream: undefined,
    _disableEvent: []
};

screenStream.request = async function() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always"
        },
        audio: false
    }).catch(err => err);

    if (stream instanceof Error) { // 오류임
        return false;
    }

    this.stream = stream;
    return true;
}

screenStream.addDisableEvent = function(event) {
    this._disableEvent.push(event);
}
screenStream.removeDisableEvent = function(event) {
    this._disableEvent = this._disableEvent.filter(ev => ev !== event);
}