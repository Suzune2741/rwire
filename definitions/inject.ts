import { Inject } from "../types/nodes/inject.ts";
import { NodeOutput } from "../types/output.ts";

export class InjectNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly config: Inject;
  private readonly propsName: string[];
  private readonly propsData: (string | number | boolean | JSON)[];
  private readonly isRepeat: boolean;
  private NODE_NAME = "inject";

  constructor(node: Inject, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.config = node;
    this.propsName = node.props
      .filter((prop) => prop.v !== undefined)
      .map((prop) => prop.p);
    this.propsData = node.props
      .filter((prop) => prop.v !== undefined)
      .map((prop) => prop.v) as string[] | number[] | boolean[] | JSON[];
    this.isRepeat = node.repeat !== "" ? true : false;
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
${this.propsName
  .map((name, index) => `sendData("msg_${name}", "${this.propsData[index]}")`)
  .join("\n")}

${this.isRepeat && `data = 0`}
while true
  print ""
${
  this.isRepeat
    ? this.nextNodes
        .map((n) => `  sendData("${n.getNodeID()}", data)`)
        .join("\n") +
      "\n" +
      `  data = (data + 1)%2`
    : this.nextNodes.map((n) => `sendData("${n.getNodeID()}", 1)`).join("\n")
}

  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n  ")}
  sleep ${this.config.repeat}
end
`;
  }
  /*  used = memory_stats()
  puts "Used bytes: #{used}"
  */
  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [];
  }
}
