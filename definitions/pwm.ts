import { MrubyPWM } from "../types/nodes/mruby-pwm.ts";
import { NodeOutput } from "../types/output.ts";

export class PWMNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly Pin_num: string;
  private readonly frequency: string;
  private readonly duty_rate: string;
  private readonly nextNodes: NodeOutput[];

  private NODE_NAME = "pwm";
  constructor(node: MrubyPWM, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.Pin_num = node.Pin_num;
    this.frequency = node.frequency;
    this.duty_rate = node.duty_rate;
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
  getNodeTargetPinNumber(): string {
    return this.Pin_num;
  }
  getNodeFrequency(): string {
    return this.frequency;
  }
  getNodeDutyRate(): string {
    return this.duty_rate;
  }

  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
    if getData("${this.nodeID}") == 1
      $pwm${this.Pin_num}.freq(${this.frequency})
      $pwm${this.Pin_num}.duty(${this.duty_rate})
      ${this.nextNodes.map((n) => n.getCallCodes())}
    end
    Task.suspend
end
`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [`$pwm${this.Pin_num} = PWM.new(${this.Pin_num})`];
  }
}
