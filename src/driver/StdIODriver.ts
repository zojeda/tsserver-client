import proc = require("child_process");

class StdIODriver implements IDriver {
	tssserver: proc.ChildProcess;
	connect(done) {
		this.tssserver = proc.spawn("tsserver");
        this.tssserver.on("error", console.error)
        setTimeout(done, 100);
	}
	setMessageHandler(onMessage: (message: string) => any): any {
		this.tssserver.stdout.on("data", (message)=> {
            // console.log(message.toString());
			onMessage(message.toString());
		});
	}
	send(message: string) {
		this.tssserver.stdin.write(message);
	}
}

export = StdIODriver;