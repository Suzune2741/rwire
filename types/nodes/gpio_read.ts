export interface MrubyGPIOREAD {
    id:string;
    type: "GPIO-Read";
    z:string;
    name: string;
    /*digitalRead もしくは analogRead*/
    ReadType: string;
    /*Readが入っていた*/
    GPIOtype: string;
    targetPort_digital: string;
    targetPort_ADC: string;
    x: number;
    y:number;
    wires: string[]
  }
  