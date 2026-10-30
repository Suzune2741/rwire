export interface NTPTimestamp {
  id: string;
  type: "timestamp";
  z: string;
  name: string;
  server: string;
  timezone: number;
  varname: string;
  dataname:string;
  format: "date_only" | "time_only" | "full_compact";
  x: number;
  y: number;
  wires: string[];
}
