import { MrubyBUTTON } from "../types/nodes/mruby-button.ts";
import { NodeOutput } from "../types/output.ts";

export class BUTTONNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "Button";
  private readonly nextNodes: NodeOutput[];
  private targetPort: string;
  private selectPull: string;
  constructor(node: MrubyBUTTON, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.targetPort = node.targetPort;
    this.nextNodes = nextNodes;
    this.selectPull = this.selectPullValue(node.selectPull);
  }
  private selectPullValue(type: string): string {
    //0の時は何もない.デフォルトは内部抵抗がない場合
    switch (type) {
      case "0":
        return "";
      case "1":
        return "| GPIO::PULL_UP";
      case "2":
        return "| GPIO::PULL_DOWN";
      default:
        return "";
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
  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
data = $gpio${this.targetPort}.read
${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",data)`).join("\n")}
${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [`$gpio${this.targetPort} = GPIO.new(${this.targetPort}, GPIO::IN ${this.selectPull})`];
  }
}
