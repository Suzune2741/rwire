import { Delay } from "../types/nodes/delay.ts";
import { NodeOutput } from "../types/output.ts";
import { calculateTime } from "../utils/calculateTime.ts";

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
    this.waitTime = calculateTime(this.timeoutUnits, node.timeout);
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
  data = getData("${this.nodeID}")
  ${this.waitTime}
  ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",data)`).join("\n")}
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
