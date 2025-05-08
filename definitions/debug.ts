import { Debug } from "../types/nodes/debug.ts";
import { NodeOutput } from "../types/output.ts";

export class DebugNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly target: string;
  private NODE_NAME = "debug";

  constructor(node: Debug) {
    this.nodeID = node.id;
    this.target = (node.complete === "payload") ? this.nodeID : "msg_" + node.complete;
  }

  getTaskName(): string {
    return `${this.NODE_NAME}_${this.nodeID}`;
  }

  getNodeID(): string {
    return this.nodeID;
  }

  getNextConnectedNodes(): NodeOutput[] {
    return [];
  }

  getNodeInitialisationCode(): string {
    return `$${this.getTaskName()}.run`;
  }
  
  getNodeCodeOutput(): string {
    return `
Task.name = "${this.getTaskName()}"
Task.suspend

while true
  data = getData("${this.target}")
  puts data

  Task.suspend
end
    `;
  }

  getCallCodes(): string {
    return `$${this.getTaskName()}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [];
  }
}
