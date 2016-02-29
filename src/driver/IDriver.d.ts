interface IDriver {
	connect(done: ()=>any);
	setMessageHandler(done: (string) => any): any;
	send(string): void;
}

