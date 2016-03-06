import {Observable, Subject} from "rxjs";


require("es6-promise").Promise;


class ServiceConnection {

  constructor(private driver: IDriver, onReady: (connection: ServiceConnection) => any) {
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
        if ((message.length + partialMessage.length) == (expectedBodyLenght + headerLength)) {
          let completeMsg = (partialMessage + message).substring(headerLength);
          let msg: ts.server.protocol.Message = JSON.parse(completeMsg);
          switch (msg.type) {
            case "response": {
              let response = msg as ts.server.protocol.Response;
              let responseSubject = this.reqResponseSubjects[response.request_seq];
              if (responseSubject) {
                if (response.success) {
                  responseSubject.next(response.body);
                  responseSubject.complete();
                  delete this.reqResponseSubjects[response.request_seq];
                } else {
                  responseSubject.error(response.message);
                }
                break;
              } else {
                console.error("not found executor for : ", completeMsg);
              }
            }
            case "event": {
              let event = msg as ts.server.protocol.Event;
              if (event.event === "semanticDiag") {
                let diagEvent = event as ts.server.protocol.DiagnosticEvent;
                this.semanticEventsSuject.next((diagEvent.body.diagnostics as ts.server.protocol.Diagnostic[]));
              }
              break;
            }
          }
          partialMessage = "";
        } else {
          partialMessage = partialMessage + message;
        }
      });
      onReady(this);
    });
  }

  sendRequest(request: ts.server.protocol.Request) {
    this.driver.send(JSON.stringify(request) + "\n");
  }

  subscribe(request: ts.server.protocol.Request) {
    this.driver.send(JSON.stringify(request) + "\n");
    return this.semanticEventsSuject.asObservable();
  }


  sendRequestResp<Resp>(request: ts.server.protocol.Request): Observable<Resp> {
    let responseSubject = new Subject<Resp>();
    this.reqResponseSubjects[request.seq] = responseSubject;
    this.driver.send(JSON.stringify(request) + "\n");
    return responseSubject.asObservable();
  }



  private reqResponseSubjects : {[sec: number]:  Subject<any>} = {};

  private semanticEventsSuject = new Subject<ts.server.protocol.Diagnostic[]>();
}

export = ServiceConnection;
