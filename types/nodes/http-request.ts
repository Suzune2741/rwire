export interface HTTPRequest {
  id: string;
  type: "http-request";
  z: string;
  name: string;
  method: string;
  ret: string;
  paytoqs: string;
  url: string;
  tls: string;
  persist: boolean;
  proxy: string;
  insecureHTTPParser: boolean;
  authType: string;
  senderr: boolean;
  headers: {
    keyType:string;
    keyValue:string;
    valueType:string;
    valueValue:string;
  }[];
  x: number;
  y: number;
  wires: string[];
}
