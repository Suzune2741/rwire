import { thermistor } from "../types/nodes/thermistor.ts";
import { NodeOutput } from "../types/output.ts";

export class ThermistorNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "thermistor";
  private readonly nextNodes: NodeOutput[];
  private readonly device: string;
  private readonly bConst: number;
  private readonly toTemp: number;
  private readonly vcc: number;
  private readonly rRef: number;
  constructor(node: thermistor, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.device = node.device || "unknown";
    this.bConst = node.bConst;
    this.toTemp = node.toTemp;
    this.vcc = node.vcc;
    this.rRef = node.rRef;
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
    return `$thermistor_${this.nodeID}.run`;
  }
  getNodeCodeOutput(): string {
    return `Task.suspend
    B = ${this.bConst}
    To = ${this.toTemp}
    V = ${this.vcc}
    Rref = ${this.rRef}
    while true 
        voltage = getData("${this.nodeID}") * 1000.0
        temp = 1.0 / ( 1.0 / B * Math.log( (V - voltage) / (voltage/ Rref) / Rref) + 1.0 / (To + 273.0) ) - 273.0
        ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}", "temperature,device=${this.device} value=" + temp.to_s)`).join("\n        ")}
        ${this.nextNodes.map((n) => n.getCallCodes()).join("\n        ")}
        Task.suspend
    end
    `;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [``];
  }
}
