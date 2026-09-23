import { completeNodeTarget } from "../parser.ts";
import { HTTPRequest } from "../types/nodes/http-request.ts";
import { NodeOutput } from "../types/output.ts";
import { checkCompleteTarget } from "../utils/checkCompleteTarget.ts";

export class HTTPRequestNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "HTTP_Request";
  private readonly nextNodes: NodeOutput[];
  private readonly method: HTTPRequest["method"];
  private readonly url: string;
  private readonly hasFixedUrl: boolean;
  private readonly isBasicAuth: boolean;

  constructor(node: HTTPRequest, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.method = node.method;
    this.hasFixedUrl = node.url !== "";
    this.url = node.url;
    this.isBasicAuth = node.authType === "basic";

    if (this.method !== "GET" && this.method !== "POST") {
      throw new Error(
        `HTTP method "${this.method}" (node ${this.nodeID}) is not supported by mrubyc-esp32's HTTP class. Only GET/POST are available.`,
      );
    }
  }

  getNodeID(): string {
    return this.nodeID;
  }
  getTaskName(): string {
    return `${this.NODE_NAME}_${this.nodeID}`;
  }
  getNextConnectedNodes(): NodeOutput[] {
    return this.nextNodes;
  }
  getNodeInitialisationCode(): string {
    return `$${this.getTaskName()}.run`;
  }

  // BASIC認証情報はflows.jsonに含まれない(flows_cred.json側)ため、
  // ここでは事前にグローバル変数を用意しておく
  private authArgs(): string {
    if (!this.isBasicAuth) return "";
    return `, user:$${this.getTaskName()}_user, passwd:$${this.getTaskName()}_passwd`;
  }

  private urlExpr(): string {
    return this.hasFixedUrl ? `"${this.url}"` : `getData("${this.nodeID}")`;
  }

  getNodeCodeOutput(): string {
    const requestLine =
      this.method === "POST"
        ? `res = HTTP.post(${this.urlExpr()}, payload,headers ${this.authArgs()})`
        : `res = HTTP.get(${this.urlExpr()}${this.authArgs()})`;
    //headerを変えられるようにする
    return `
Task.suspend
while true
headers = {
    "Content-Type" => "text/plain"
}
payload = getData("${this.nodeID}")
  ${requestLine}
${this.nextNodes.map((n) => `  sendData("${n.getNodeID()}", res)`).join("\n")}
${this.nextNodes.map((n) => `  ${n.getCallCodes()}`).join("\n")}

  ${checkCompleteTarget(this.nodeID, completeNodeTarget)}
  Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.getTaskName()}.resume`;
  }
  getInitialisationCodes(): string[] {
    if (!this.isBasicAuth) return [];
    return [
      `$${this.getTaskName()}_user = ""    # TODO: BASIC認証のユーザー名を設定`,
      `$${this.getTaskName()}_passwd = ""  # TODO: BASIC認証のパスワードを設定`,
    ];
  }
}
