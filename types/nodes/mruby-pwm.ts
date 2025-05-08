export interface MrubyPWM {
    id: string;
    type: "PWM";
    z: string;
    name: string;
    /*ピン番号*/ 
    Pin_num: string;
    /*PWMの周波数*/
    frequency: string;
    /*Duty比*/
    duty_rate: string;
    x: number,
    y:  number,
    wires: string[]
  }
  