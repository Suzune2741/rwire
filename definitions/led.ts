import { MrubyLED } from "../types/nodes/mruby-led.ts";
import { NodeOutput } from "../types/output.ts";

export class LEDNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "led";

  constructor(node: MrubyLED) {
    this.nodeID = node.id;
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

  getNodeCodeOutput(): string {
    return `
Task.suspend

while true
    data = getData("${this.nodeID}")
    if data == 1
      $led13.write(1)
    else
      $led13.write(0)
    end
    Task.suspend
end
`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [`$led13 = GPIO.new(13, GPIO::OUT)`];
  }
}
