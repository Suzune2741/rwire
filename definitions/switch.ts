import { NodeOutput } from "../types/output.ts";
import { Switch } from "../types/nodes/switch.ts";
export class SwitchNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private nextNodesByPort: NodeOutput[][];
  private NODE_NAME = "switch";
  private readonly rules: string[];
  private readonly property;
  private readonly checkAll: boolean;
  private readonly propertyType: string;
  constructor(
    node: Switch,
    nextNodes: NodeOutput[],
    nextNodesByPort: NodeOutput[][]
  ) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.property = node.property;
    this.nextNodesByPort = nextNodesByPort;
    this.propertyType = node.propertyType;
    this.rules = this.getRules(node.rules);
    this.checkAll = node.checkall === "true" ? true : false;
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
  private formatValue(value: string, valueType: string): string {
    switch (valueType) {
      case "str":
        return `"${value}"`;
      case "num":
        return value;
      default:
        return "";
    }
  }
  getRules(nodeRules: { t: string; v: string; vt: string }[]) {
    //まだあるので対応を増やす
    const rulesMap = new Map([
      ["eq", "=="],
      ["neq", "!="],
      ["lt", "<"],
      ["lte", "<="],
      ["gt", ">"],
      ["gte", ">="],
      ["true", "== true"],
      ["false", "== false"],
      ["null", ".nil?"],
      ["nnull", ""],
      ["empty", ".empty?"],
    ]);

    // プロパティがpayloadの場合は前のノードから送られてくるデータを取得する
    // それ以外はmsgを前に付けてgetDataで取得
    // trueなら1 falseなら0を返す
    if (this.property == "payload") {
      const ruleText = nodeRules.map((rule, index) => {
        const portNodes = this.nextNodesByPort[index] || [];
        const formattedValue = this.formatValue(rule.v, rule.vt);

        return `if getData("${this.nodeID}") ${rulesMap.get(
          rule.t
        )} ${formattedValue}
${portNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
${!this.checkAll && `next`}
else
${portNodes.map((n) => `sendData("${n.getNodeID()}",0)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
end`;
      });
      return ruleText;
    } else {
      const ruleText = nodeRules.map((rule, index) => {
        const portNodes = this.nextNodesByPort[index] || [];
        const formattedValue = this.formatValue(rule.v, rule.vt);

        return `if getData("msg_${this.property}") ${rulesMap.get(
          rule.t
        )} ${formattedValue}
${portNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
${this.checkAll && `next`}
else
${portNodes.map((n) => `sendData("${n.getNodeID()}",0)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
end`;
      });
      return ruleText;
    }
  }
  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
${this.rules.map((n) => n).join("\n")}
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
