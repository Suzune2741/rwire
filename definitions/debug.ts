import { NodeOutput } from "../types/output.ts";

export class DebugNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "debug";

  constructor(nodeID: string) {
    this.nodeID = nodeID;
  }

  private getTaskName(): string {
    return `${this.NODE_NAME}_${this.nodeID}`;
  }

  getNodeID(): string {
    return this.nodeID;
  }

  getNextConnectedNodes(): NodeOutput[] {
    return [];
  }

  getNodeInitialisationCode(): string {
    return `$${this.nodeID}.run`;
  }

  getNodeCodeOutput(): string {
    return `
Task.name = "${this.getTaskName()}"
Task.suspend

while true
  data = getData("${this.nodeID}")
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
