export interface MrubyConstant {
    id:string;
    type: "Constant";
    z:string;
    name: string;
    //送信する定数
    C:string;
    x: number;
    y:number;
    wires: string[]
  }
  