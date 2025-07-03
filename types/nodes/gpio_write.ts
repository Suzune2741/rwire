export interface MrubyGPIOWRITE {
    id:string;
    //GPIO-Write-1
    type:string;
    z:string;
    name:string;
    // PWM or digital_write
    WriteType:string;
    GPIOType:string;
    targetPort_digital:string;
    targetPort_mode:string;
    targetPort_PWM:string;
    PWM_num:string;
    cycle:string;
    double:string;
    time:string;
    rate:string;
    x:number;
    y:number;
    wires:string[];
}
