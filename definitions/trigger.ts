import { Trigger } from "../types/nodes/trigger.ts";
import { NodeOutput } from "../types/output.ts";

export class TriggerNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly config: Trigger;
  private NODE_NAME = "trigger";

  constructor(node: Trigger, nextNodes: NodeOutput[]) {
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
  ${this.nextNodes
    .map((n) => `sendData("${n.getNodeID()}", ${this.config.op1})`)
    .join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}

  sleep ${Number(this.config.duration)}

  ${this.nextNodes
    .map((n) => `sendData("${n.getNodeID()}", ${this.config.op2})`)
    .join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
  
  Task.suspend
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
