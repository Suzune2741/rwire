import { Complete } from "../types/nodes/complete.ts";
import { NodeOutput } from "../types/output.ts";

export class CompleteNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "complete";
  private readonly nextNodes: NodeOutput[];

  constructor(node: Complete, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
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
    return `Task.name = "${this.NODE_NAME}_${this.nodeID}"
Task.suspend
while true
  ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
  sleep 0.1
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
