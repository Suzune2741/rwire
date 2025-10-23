import { MrubyADC } from "../types/nodes/mruby-adc.ts";
import { NodeOutput } from "../types/output.ts";

export class CompleteNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "complete";
  private readonly nextNodes: NodeOutput[];
  

  constructor(node: MrubyADC, nextNodes: NodeOutput[]) {
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
    return `Task.suspend
while true

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
