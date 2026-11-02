import { NodeOutput } from "../types/output.ts";
import { Switch } from "../types/nodes/switch.ts";

type SwitchRule = {
  t: string;
  v: string;
  vt: string;
  v2?: string;
  v2t?: string;
};

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
    nextNodesByPort: NodeOutput[][],
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

  // ルール1件分の条件式(Rubyのif条件)を組み立てる
  private buildCondition(lhs: string, rule: SwitchRule): string {
    //まだあるので対応を増やす
    const simpleOps = new Map([
      ["eq", "=="],
      ["neq", "!="],
      ["lt", "<"],
      ["lte", "<="],
      ["gt", ">"],
      ["gte", ">="],
      ["true", "== true"],
      ["false", "== false"],
      ["null", ".nil?"],
      ["empty", ".empty?"],
    ]);

    switch (rule.t) {
      case "btwn": {
        const lo = this.formatValue(rule.v, rule.vt);
        const hi = this.formatValue(rule.v2 ?? "", rule.v2t ?? rule.vt);
        return `(${lhs} >= ${lo} && ${lhs} <= ${hi}) || (${lhs} <= ${lo} && ${lhs} >= ${hi})`;
      }
      case "nnull":
        return `!${lhs}.nil?`;
      default: {
        const op = simpleOps.get(rule.t) ?? "";
        return `${lhs} ${op} ${this.formatValue(rule.v, rule.vt)}`;
      }
    }
  }

  getRules(nodeRules: SwitchRule[]) {
    // プロパティがpayloadの場合は前のノードから送られてくるデータを取得する
    // それ以外はmsg_を前に付けてgetDataで取得
    // trueなら1 falseなら0を送る
    const lhs = this.property == "payload"
      ? `getData("${this.nodeID}")`
      : `getData("msg_${this.property}")`;

    return nodeRules.map((rule, index) => {
      const portNodes = this.nextNodesByPort[index] || [];
      const condition = this.buildCondition(lhs, rule);

      return `if ${condition}
${portNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
${this.checkAll ? "" : "Task.suspend\nnext"}
else
${portNodes.map((n) => `sendData("${n.getNodeID()}",0)`).join("\n")}
${portNodes.map((n) => n.getCallCodes()).join("\n")}
end`;
    });
  }

  getNodeCodeOutput(): string {
    return `
Task.suspend
while true
${this.rules.map((n) => n).join("\n")}
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
