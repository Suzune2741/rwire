export interface MrubyI2C {
  id: string;
  type: "I2C";
  z: string;
  name: string;
  //slaveAddress
  ad: string;
  rules: [
    {
      //W:書き込み,R:読み込み
      t: "W" | "R";
      //開始アドレス?
      v: string;
      //読み込みの場合に用いられる.読み込むバイト数
      b?: string;
      //書き込みの場合に用いられる.コマンドの指定
      c?:string;
      //待ち時間
      de: string;
    }
  ];
  x: number;
  y: number;
  wires: string[];
}

