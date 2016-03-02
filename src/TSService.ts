import {Observable} from "rxjs";

import WebSocketDriver from "./driver/WebSocketDriver";
import StdIODriver from "./driver/StdIODriver";

import ServiceConnection from "./ServiceConnection";

class TSService {
	seq = 0;
	static connect(driverName: string, onReady: (service: TSService) => any) {
		let driver: IDriver;
		switch (driverName) {
			case "websocket": driver = new WebSocketDriver();
			case "stdio": driver = new StdIODriver();
		}
		let connection = new ServiceConnection(driver, connection => {
			let service = new TSService(connection);
			onReady(service);
		});
	}
	constructor(private connection: ServiceConnection) { }

	open(file: string, fileContent?: string) {
		let openRequest: ts.server.protocol.OpenRequest = {
			command: "open",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				fileContent: fileContent
			}
		};
		this.connection.sendRequest(openRequest);
	}
	projectInfo(file: string, needFileNameList: boolean): Promise<ts.server.protocol.ProjectInfo> {
		let projectInfoRequest: ts.server.protocol.ProjectInfoRequest = {
			command: "projectInfo",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				needFileNameList: needFileNameList
			}
		};

		return this.connection.sendRequestResp(projectInfoRequest);
	}

	completions(file: string, line: number, offset: number): Promise<ts.server.protocol.CompletionEntry[]> {
		let completionsRequest: ts.server.protocol.CompletionsRequest = {
			command: "completions",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(completionsRequest);
	}

	geterr(files: string[], delay: number) : Observable<ts.server.protocol.Diagnostic[]> {
		let geterrRequest: ts.server.protocol.GeterrRequest = {
			command: "geterr",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				files: files,
				delay: delay
			}
		};

		this.connection.sendRequest(geterrRequest);
		return this.connection.semanticEventsSuject.asObservable();
	}

	exit() {
		let exitRequest: ts.server.protocol.ExitRequest = {
			command: "exit",
			type: "request",
			seq: this.increase_seq()
		};
	}

	private increase_seq() {
		let temp = this.seq;
		this.seq += 1;
		return temp;
	}

}

export default TSService;