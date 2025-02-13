import { Inject } from "../types/nodes/inject.ts";
import { NodeOutput } from "../types/output.ts";

export class InjectNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly config: Inject;
  private NODE_NAME = "inject";

  constructor(node: Inject, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.config = node;
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
Task.suspend

while true
  print ""
  ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}", 0)`).join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes())}

  sleep ${this.config.repeat}
end
`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [];
  }
}
