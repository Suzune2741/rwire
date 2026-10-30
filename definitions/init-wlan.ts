import { completeNodeTarget } from "../parser.ts";
import { InitWlan } from "../types/nodes/mruby-init-wlan.ts";
import { NodeOutput } from "../types/output.ts";
import { checkCompleteTarget } from "../utils/checkCompleteTarget.ts";

export class InitWlanNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly mode: string;
  private readonly ssid: string;
  private readonly password: string;
  private NODE_NAME = "wlan";

  constructor(node: InitWlan) {
    this.nodeID = node.id;
    this.mode = node.mode;
    this.ssid = node.ssid;
    this.password = node.password;
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
    return `Task.name = "${this.nodeID}"
Task.suspend
$wlan.connect('${this.ssid}','${this.password}')
while true
    if $wlan.connected?
        puts $wlan.ifconfig('ip')
        ${checkCompleteTarget(this.nodeID, completeNodeTarget)}
        break
    end 
    
end
    `;
  }

  getCallCodes(): string {
    return `$${this.NODE_NAME}_${this.nodeID}.resume`;
  }

  getInitialisationCodes(): string[] {
    return [`$wlan = WLAN.new('${this.mode}')`];
  }
}
