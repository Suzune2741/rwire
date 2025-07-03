import { MrubyGPIOWRITE } from "../types/nodes/gpio_write.ts";
import { NodeOutput } from "../types/output.ts";

export class GPIOWRITENode implements NodeOutput {
  private readonly nodeID: string;
  private readonly targetPort_digital: string;
  private readonly targetPort_PWM: string;
  private readonly freq: number;
  private readonly duty: number;
  private NODE_NAME = "GPIO_Write_1";
  private readonly writeType: string;

  constructor(node: MrubyGPIOWRITE) {
    this.nodeID = node.id;
    this.targetPort_digital = node.targetPort_digital;
    this.targetPort_PWM = node.targetPort_PWM;
    this.writeType = node.WriteType;
    this.freq = node.time != "" ? 1.0 / (parseFloat(node.time)/1000) : 0;
    this.duty = node.rate != "" ? parseFloat(node.rate) : 0;
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
    if (this.writeType == "PWM") {
      return `
Task.suspend
while true
  $pwm${this.targetPort_PWM}.freq(${this.freq})
  $pwm${this.targetPort_PWM}.duty(${this.duty})
  Task.suspend
end
    `;
    } else {
      return `
Task.suspend
while true
  data = $gpio${this.targetPort_digital}.write(getData("${this.nodeID}"))
  Task.suspend
end
    `;
    }
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return this.writeType == "PWM"
      ? [`$pwm${this.targetPort_PWM} = PWM.new(${this.targetPort_PWM})`]
      : [
          `$gpio${this.targetPort_digital} = GPIO.new(${this.targetPort_digital}, GPIO::OUT)`,
        ];
  }
}
