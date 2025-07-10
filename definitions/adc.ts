import { MrubyADC } from "../types/nodes/mruby-adc.ts";
import { NodeOutput } from "../types/output.ts";

export class ADCNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly pinNum: string;
  private NODE_NAME = "ADC";
  private readonly nextNodes: NodeOutput[];
  constructor(node: MrubyADC, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.pinNum = node.Pin_num;
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
    return `$ADC_${this.nodeID}.run`;
  }
  getNodeCodeOutput(): string {
    return `Task.suspend
while true
data = $adc${this.pinNum}.read()
${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",data)`).join("\n")}
${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [`$adc${this.pinNum} = ADC.new(${this.pinNum}) `];
  }
}
