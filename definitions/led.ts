import { MrubyLED } from "../types/nodes/mruby-led.ts";
import { NodeOutput } from "../types/output.ts";

export class LEDNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly targetPort: string;
  private readonly targetPort_mode: string;
  private NODE_NAME = "led";
  constructor(node: MrubyLED) {
    this.nodeID = node.id;
    this.targetPort = node.targetPort;
    this.targetPort_mode = node.targetPort_mode;
  }

  getNodeID(): string {
    return this.nodeID;
  }

  getTaskName(): string {
    return `${this.NODE_NAME}_${this.nodeID}`;
  }

  getNextConnectedNodes(): NodeOutput[] {
    return [];
  }

  getNodeInitialisationCode(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.run`;
  }
  getNodeTargetPort(): string {
    return this.targetPort;
  }

  getNodeCodeOutput(): string {
    if (this.targetPort_mode == "2") {
      return `
Task.suspend
while true
    data = getData("${this.nodeID}")
    if data == 1
      $led${this.targetPort}.write(1)
    else
      $led${this.targetPort}.write(0)
    end
    Task.suspend
end
`;
    } else {
      return `
Task.suspend
while true
    $led${this.targetPort}.write(${this.targetPort_mode})
    Task.suspend
end
`;
    }
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [`$led${this.targetPort} = GPIO.new(${this.targetPort}, GPIO::OUT)`];
  }
}
