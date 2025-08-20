import { MrubyFunctionRuby } from "../types/nodes/mruby-function-ruby.ts";
import { NodeOutput } from "../types/output.ts";

export class FunctionRubyNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly functionData: string;
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
  private convertReturnToSendData(
    functionData: string,
    nodeId: string
  ): string {
    return functionData
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("return ")) {
          // return文の返す値を取得
          const returnValue = trimmedLine
            .replace(/^return\s+/, "")
            .replace(/;$/, "");
          const indentation = line.match(/^\s*/)?.[0] || "";
          return `${indentation}sendData("${nodeId}",${returnValue})`;
        }

        return line;
      })
      .join("\n");
  }
  getNodeCodeOutput(): string {
    const convertedFunctionData = this.convertReturnToSendData(
      this.functionData,
      this.getNodeID()
    );
    return `
Task.suspend
while true
data = getData("${this.nodeID}")
${convertedFunctionData}
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
