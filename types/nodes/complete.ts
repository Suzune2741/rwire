export interface Complete {
  id: string;
  type: "complete";
  z: string;
  name: string;
  //監視するノード(これが終了したら実行)
  scope:string[];
  uncaught:boolean;
  x: number;
  y: number;
  wires: string[];
}



