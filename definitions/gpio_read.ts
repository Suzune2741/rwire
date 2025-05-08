import { MrubyGPIOREAD } from "../types/nodes/gpio_read.ts";
import { NodeOutput } from "../types/output.ts";

export class GPIOREADNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly targetPort_digital: string;
  private NODE_NAME = "GPIO_Read";

  constructor(node: MrubyGPIOREAD, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.targetPort_digital = node.targetPort_digital;
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
  data = $gpio${this.targetPort_digital}.read
  ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",data)`).join("\n")}
  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
  Task.suspend
end
    `;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [`$gpio${this.targetPort_digital} = GPIO.new(${this.targetPort_digital}, GPIO::IN,GPIO::PULL_UP)
      `];
  }
}
