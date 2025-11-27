import { Complete } from "../types/nodes/complete.ts";
import { NodeOutput } from "../types/output.ts";

export class CompleteNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "complete";
  private readonly nextNodes: NodeOutput[];
  private readonly scope: string[];

  constructor(node: Complete, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.scope = node.scope;
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
    return `
while true
  if NodeState.check_complete("${this.scope}")
    ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
    ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
  end
  sleep 0.1
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [];
  }
}
