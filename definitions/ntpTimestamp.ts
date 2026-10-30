import { NTPTimestamp } from "../types/nodes/ntpTimestamp.ts";
import { NodeOutput } from "../types/output.ts";

export class NTPTimestampNode implements NodeOutput {
  private readonly nodeID: string;
  private readonly nextNodes: NodeOutput[];
  private readonly server: string;
  private readonly timezone: number;
  private readonly varname: string;
  private readonly dataname: string;
  private readonly format: "date_only" | "time_only" | "full_compact";

  private NODE_NAME = "ntpTimestamp";
  constructor(node: NTPTimestamp, nextNodes: NodeOutput[]) {
    this.nodeID = node.id;
    this.server = node.server;
    this.timezone = node.timezone;
    this.varname = node.varname;
    this.format = node.format;
    this.dataname = node.dataname;
    this.nextNodes = nextNodes;
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

  formatTimestamp(): string {
    if (this.format === "date_only") {
      return `${this.varname} = sprintf("%02d-%02d-%02d", time.year, time.mon, time.mday)`;
    } else if (this.format === "time_only") {
      return `${this.varname} = sprintf("%02d:%02d:%02d", time.hour, time.min, time.sec)`;
    } else {
      return `${this.varname} =sprintf("20%02d%02d%02d%02d%02d%02d",time.year,time.mon,time.mday,time.hour,time.min,time.sec)`;
    }
  }
  getNodeCodeOutput(): string {
    const formattedTimestamp = this.formatTimestamp();

    return `
Task.suspend
Time.sync_ntp("${this.server}")
while true
    data = getData("${this.nodeID}")
    time = Time.now
    ${formattedTimestamp}
    timestampedData = "${this.dataname}=" + data.to_s + "&time=" + ${this.varname}
    puts timestampedData
    ${this.nextNodes.map((n) => `sendData("${n.getNodeID()}", timestampedData)`).join("\n")}
    ${this.nextNodes.map((n) => n.getCallCodes()).join("\n")}
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
