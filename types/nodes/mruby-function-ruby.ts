export interface MrubyFunctionRuby {
  id: string;
  type: "function-Code";
  z: string;
  name: string;
  //Node-REDで作成したrubyコード
  func: string[];
  x: number;
  y: number;
  wires: string[];
}
