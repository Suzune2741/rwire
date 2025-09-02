import { MrubyI2C } from "../types/nodes/mruby-i2c.ts";
import { NodeOutput } from "../types/output.ts";

export class I2CNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "I2C";
  private readonly nextNodes: NodeOutput[];
  private readonly nodeName: string;
  private readonly slaveAddress: string;
  private readonly rules: {
    t: string;
    v: string;
    c?: string;
    b?: string;
    de: string;
  }[];
  constructor(node: MrubyI2C, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.nodeName = node.name;
    this.slaveAddress = node.ad;
    this.rules = node.rules;
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
    return `$${this.getTaskName()}.run`;
  }
  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
${this.rules
  .map((rule) => {
    if (rule.t == "R") {
      return `data = $i2c.read(${this.slaveAddress},${rule.b},${rule.v})
${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",data)`).join("\n")}
${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
sleep ${rule.de}
`;
    } else if (rule.t == "W") {
      return `  $i2c.write(${this.slaveAddress},[${rule.v},${rule.c}]) 
  sleep ${rule.de}`;
    }
  })
  .join("\n")}
Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  //本来はnodeNameに入れるべきではないのでI2Cノードに初期化ポートを指定できるプロパティが実装された場合には変更が必要
  getInitialisationCodes(): string[] {
    return [`$i2c = I2C.new(${this.nodeName})`];
  }
}
