import { NodeOutput } from "../types/output.ts";

export class InjectNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private NODE_NAME = "inject";

  constructor(nodeID: string, nextNodes: NodeOutput[]) {
    this.nodeID = nodeID;
    this.nextNodes = nextNodes;
  }

  getNodeID(): string {
    return this.nodeID;
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
  ${this.nextNodes.map((n) => `sendData(${n.getNodeID()}, 0)`).join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes())}

  sleep 2
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
