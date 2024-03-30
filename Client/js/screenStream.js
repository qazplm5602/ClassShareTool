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

    // 비활 이벤트
    stream.getVideoTracks()[0].onended = () => {
        this._disableEvent.forEach(event => event());
        this.stream = undefined;
    }

    this.stream = stream;
    return true;
}

screenStream.destory = function() {
    if (this.stream === undefined) return;
    this.stream.getTracks().forEach(track => track.stop());
    this._disableEvent.forEach(event => event());
    this.stream = undefined;
}

screenStream.addDisableEvent = function(event) {
    this._disableEvent.push(event);
}
screenStream.removeDisableEvent = function(event) {
    this._disableEvent = this._disableEvent.filter(ev => ev !== event);
}