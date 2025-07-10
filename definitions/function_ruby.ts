import { MrubyFunctionRuby } from "../types/nodes/mruby-function-ruby.ts";
import { NodeOutput } from "../types/output.ts";

export class FunctionRubyNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly functionData: string[];
  private NODE_NAME = "function_Code";
  private readonly nextNodes: NodeOutput[];
  constructor(node: MrubyFunctionRuby, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.functionData = node.func;
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
    return `puts "TEST"
Task.suspend
while true
${this.functionData}
  ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
Task.suspend
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [];
  }
}
