import { MrubyConstant } from "../types/nodes/mruby-constant.ts";
import { NodeOutput } from "../types/output.ts";

export class ConstantNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "Constant";
  private readonly constant:string;
  private readonly nextNodes: NodeOutput[];
  constructor(node: MrubyConstant, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.constant = node.C;
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
    return `$${this.NODE_NAME}_${this.nodeID}.run`;
  }
  getNodeCodeOutput(): string {
    return `Task.suspend
while true
${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",${this.constant})`).join("\n")}
${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [];
  }
}
