import {Observable, Subject} from "rxjs";


require("es6-promise").Promise;
interface PromiseExecutor<T> {
  resolver: (resp: T)=>void;
  reject: (error: Error)=>void;
}


class ServiceConnection {

  constructor(private driver: IDriver, onReady: (ServiceConnection) => any) {
    this.driver.connect(() => {
      let partialMessage = "";
      let expectedBodyLenght = 0;
      let headerLength = 0;
      this.driver.setMessageHandler((message: string) => {
        if (partialMessage.length === 0) {
          //header content expected
          let matches = message.match(/Content-Length: (\d+)\s*/);
          expectedBodyLenght = parseInt(matches[1]);
          headerLength = matches[0].length;
        }
        console.log("message[%d] | partialMessage[%d] | headerLength[%d] | bodylength[%d]",
          message.length, partialMessage.length, headerLength, expectedBodyLenght);
        if ((message.length + partialMessage.length) == (expectedBodyLenght + headerLength)) {
          try {
            let completeMsg = (partialMessage + message).substring(headerLength);
            let msg: ts.server.protocol.Message = JSON.parse(completeMsg);
            switch (msg.type) {
              case "response": {
                let response = msg as ts.server.protocol.Response;
                let promiseExecutor = this.callbacks[response.request_seq];
                if(response.success) {
                  promiseExecutor.resolver(response.body);
                } else {
                  promiseExecutor.reject(new Error(response.message));
                }
                break;
              }
              case "event": {
                let event = msg as ts.server.protocol.Event;
                if(event.event==="semanticDiag" || event.event==="syntaxDiag"){
                  this.diagnosticSuject.next((event as ts.server.protocol.DiagnosticEvent).body.diagnostics);
                }
                break;
              }
            }
            partialMessage = "";
          } catch (error) {
            console.log(error);
          }
        } else {
          partialMessage = partialMessage + message;
        }
      });
      onReady(this);
    });
  }

	sendRequest<Resp extends ts.server.protocol.Response>(request: ts.server.protocol.Request) {
		this.driver.send(JSON.stringify(request)+"\n");
	}

	sendRequestResp<Resp>(request: ts.server.protocol.Request) : Promise<Resp> {
		let executor = (resolve, reject) => {
			this.callbacks[request.seq] = {
        resolver: (response)=>{
                    resolve(response);
                    this.clear(request.seq);
                  },
        reject: reject //passing the reject callback in case an error informed by the server
		  };
			setTimeout(()=>{
				reject("Timeout");
				this.clear(request.seq);}
			, 2000);
    };
		this.driver.send(JSON.stringify(request)+"\n");
		return new Promise<Resp>(executor);
	}


  private clear(seq: number) {
    delete this.callbacks[seq];
  }

  private callbacks: {[seq: number] : PromiseExecutor<ts.server.protocol.Response>} = {};
  diagnosticSuject = new Subject<ts.server.protocol.Diagnostic[]>() ;
	
}

export default ServiceConnection;