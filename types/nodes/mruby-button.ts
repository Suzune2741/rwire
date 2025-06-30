export interface MrubyBUTTON {
  id:string;
  type: "Button";
  z:string;
  name: string;
  /*0が入っている*/
  onBoardButton: string;
  /*空文字列が入っていた*/
  targetPort: string;
  /*0が入っている*/
  selectPull: string;
  x: number;
  y:number;
  wires: string[]
}
