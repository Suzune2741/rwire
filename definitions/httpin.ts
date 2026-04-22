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

  getNodeCodeOutput(): string {
    return `Task.suspend
$path = "${this.url.split(":")[0]}"
$port = "${this.url.split(":")[1]}"
${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
    `;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [``];
  }
}
