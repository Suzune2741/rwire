import { HTTPIn } from "../types/nodes/httpin.ts";
import { NodeOutput } from "../types/output.ts";

export class HTTPInNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "http_in";
  private readonly method: string;
  private readonly url: string;
  private readonly upload: string;
  private readonly nextNodes: NodeOutput[];

  constructor(node: HTTPIn, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.method = node.method;
    this.url = node.url;
    this.upload = node.upload;
    this.nextNodes = nextNodes;
  }

  getNodeID(): string {
    return this.nodeID;
  }

  getTaskName(): string {
    return `${this.NODE_NAME}_${this.nodeID}`;
  }

  getNextConnectedNodes(): NodeOutput[] {
    return [];
  }

  getNodeInitialisationCode(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.run`;
  }

  getMethodString(): string {
    switch (this.method) {
      case "get":
        return `get_data = HTTP.get("${this.url}")
puts get_data`;
      case "post":
        break;
      case "delete":
        break;
      case "out":
        break;
      case "patch":
        break;
    }
    return ``;
  }
  getNodeCodeOutput(): string {
    return `Task.suspend
while true
    ${this.getMethodString()}
    Task.suspend
end
    `;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [
      `$wlan = WLAN.new('STA')
#SSIDとPASSを入力してください
$wlan.connect("SSID","PASS")`,
    ];
  }
}
