import { Delay } from "../types/nodes/delay.ts";
import { NodeOutput } from "../types/output.ts";

export class DelayNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly waitTime: string;
  private readonly timeoutUnits: string;
  private NODE_NAME = "delay";

  constructor(node: Delay, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.timeoutUnits = node.timeoutUnits;
    this.waitTime = this.getTimeoutValue(this.timeoutUnits, node.timeout);
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
  getTimeoutValue(timeoutUnits:string,timeout:string): string {
    const timeoutValue = Number(timeout);
    switch (timeoutUnits) {
      case "seconds": 
        return `sleep ${timeoutValue}`;
      case "milliseconds":
        return  `sleep_ms ${timeoutValue}`;
      case "minutes":
        return  `sleep ${timeoutValue} * 60`;
      case "hours":
        return  `sleep ${timeoutValue} * 60 * 60`;
      case "days":
        return  `sleep ${timeoutValue} * 60 * 60 * 24`;
      default:
        throw new Error("Invalid timeout unit");
    }
  }
  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
  ${this.waitTime}
  ${this.nextNodes.map((n) => n.getCallCodes())}
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
