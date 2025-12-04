export interface HTTPIn {
  id: string;
  type: "http_in";
  z: string;
  name: string;
  method:string;
  url:string;
  upload:string;
  x: number;
  y: number;
  wires: string[];
}
