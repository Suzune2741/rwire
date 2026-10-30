export interface InitWlan {
  id: string;
  type: "wlan";
  z: string;
  name: string;
  mode: string;
  ssid: string;
  password: string;
  x: number;
  y: number;
  wires: string[];
}
