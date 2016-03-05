import {Observable} from "rxjs";
import ServiceConnection = require("./ServiceConnection");

class TSService {
	seq = 0;
	static connect(driverName: string, onReady: (service: TSService) => any) {
		let driver: IDriver;
		switch (driverName) {
			case "websocket": {
				var WebSocketDriver = require("./driver/WebSocketDriver");
				driver = new WebSocketDriver();
				break;
			}
			// case "stdio": {
			// 	var StdIODriver = require("./driver/StdIODriver");
			// 	driver = new StdIODriver();
			// 	break;
			// }
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

	completionEntryDetails(file: string, line: number, offset: number, entryNames: string[]): Promise<ts.server.protocol.CompletionEntryDetails[]> {
		let completionDetailsRequest: ts.server.protocol.CompletionDetailsRequest = {
			command: "completionEntryDetails",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset,
				entryNames: entryNames
			}
		};

		return this.connection.sendRequestResp(completionDetailsRequest);
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

	navto(file: string, searchValue: string, maxResultCount?: number): Promise<ts.server.protocol.NavtoItem[]> {
		let navtoRequest: ts.server.protocol.NavtoRequest = {
			command: "navto",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				searchValue: searchValue,
				maxResultCount: maxResultCount
			}
		};

		return this.connection.sendRequestResp(navtoRequest);
	}

	definition(file: string, line: number, offset: number): Promise<ts.server.protocol.FileSpan[]> {
		let definitionRequest: ts.server.protocol.DefinitionRequest = {
			command: "definition",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(definitionRequest);
	}

	definitionType(file: string, line: number, offset: number): Promise<ts.server.protocol.FileSpan[]> {
		let typeDefinitionRequest: ts.server.protocol.TypeDefinitionRequest = {
			command: "typeDefinition",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(typeDefinitionRequest);
	}

	rename(file: string, line: number, offset: number, findInComments?: boolean, findInStrings?: boolean): Promise<ts.server.protocol.RenameResponseBody> {
		let typeDefinitionRequest: ts.server.protocol.RenameRequest = {
			command: "rename",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset,
				findInComments: findInComments,
				findInStrings: findInStrings
			}
		};

		return this.connection.sendRequestResp(typeDefinitionRequest);
	}

	references(file: string, line: number, offset: number): Promise<ts.server.protocol.ReferencesResponseBody> {
		let referencesRequest: ts.server.protocol.ReferencesRequest = {
			command: "references",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(referencesRequest);
	}

	signatureHelp(file: string, line: number, offset: number): Promise<ts.server.protocol.SignatureHelpItems> {
		let signatureHelpRequest: ts.server.protocol.SignatureHelpRequest = {
			command: "signatureHelp",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(signatureHelpRequest);
	}

	quickinfo(file: string, line: number, offset: number): Promise<ts.server.protocol.QuickInfoResponseBody> {
		let referencesRequest: ts.server.protocol.QuickInfoRequest = {
			command: "quickinfo",
			type: "request",
			seq: this.increase_seq(),
			arguments: {
				file: file,
				line: line,
				offset: offset
			}
		};

		return this.connection.sendRequestResp(referencesRequest);
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

export = TSService;