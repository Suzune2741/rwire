import { Complete } from "../types/nodes/complete.ts";
import { NodeOutput } from "../types/output.ts";

export class CompleteNode implements NodeOutput {
  private readonly nodeID: string;
  private NODE_NAME = "complete";
  private readonly nextNodes: NodeOutput[];
  private readonly scope: string[];

  constructor(node: Complete, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.nextNodes = nextNodes;
    this.scope = node.scope;
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
    return `p "List:#{Task.name_list}"
while true
  target_task =Task.get("${this.scope[0].slice(0, 15)}")
  break if target_task 
  sleep 1
end
last_status = target_task.status
while true
  status = target_task.status
  puts "status:#{status} last:#{last_status}"
  if status != last_status && status == "SUSPENDED"
    puts "scope is end"
    ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}",1)`).join("\n")}
    ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
  end
  last_status = status
  sleep 0.1
end`;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }
  getInitialisationCodes(): string[] {
    return [];
  }
}
