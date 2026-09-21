export interface thermistor {
  id: string;
  type: "thermistor";
  z: string;
  name: string;
  bConst: number;
  toTemp: number;
  vcc: number;
  rRef: number;
  x: number;
  y: number;
  wires: string[];
}
