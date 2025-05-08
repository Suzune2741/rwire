export interface Delay {
    id: string,
    type: "delay",
    z: string,
    name: string,
    pauseType: string,
    timeout: string,
    /*milliseconds,seconds,minutes,hour,daysのいずれか*/
    timeoutUnits: string,
    rate: string,
    nbRateUnits: string,
    rateUnits: string,
    randomFirst: string,
    randomLast: string,
    randomUnits: string,
    drop: boolean,
    allowrate: boolean,
    outputs: 1,
    x: number,
    y: number,
    wires: string[]
  }
  