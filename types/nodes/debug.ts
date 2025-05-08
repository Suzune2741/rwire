export interface Debug {
  id: string;
  type: "debug";
  z: string;
  name: string;
  /*
  * 出力されるか
  * falseだったらrubyを出力しなくても良さそう？
  *  */
  active: boolean;
  /* 関係ない */
  tosidebar: boolean;
  /* 関係ない */
  console: boolean;
  /* 関係ない? */
  tostatus: boolean;
  /* 指定したmsgの対象 */
  complete: string;
  /* msgだった */
  targetType: string;
  /* 空文字列 */
  statusVal: string;
  /* autoだった */
  statusType: string;
  x: number;
  y: number;
  wires: string[];
}



