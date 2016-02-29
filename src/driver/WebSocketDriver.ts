export default class WebSocketDriver implements IDriver {
	ws: WebSocket;
	connect(done) {
		this.ws = new WebSocket("ws://localhost:8001");
		this.ws.onopen = () => done();
	}
	setMessageHandler(onMessage: (message: string) => any): any {
		this.ws.onmessage = (ev) => onMessage(ev.data);
	}
	send(message) {
		this.ws.send(message);
	}
}
