import type { NodeOutput } from "./types/output.ts";
import { InjectNode } from "./definitions/inject.ts";
import { TriggerNode } from "./definitions/trigger.ts";
import { LEDNode } from "./definitions/led.ts";
import { DebugNode } from "./definitions/debug.ts";
import { GPIOREADNode } from "./definitions/gpio_read.ts";
import { PWMNode } from "./definitions/pwm.ts";
import { DelayNode } from "./definitions/delay.ts";
import { SwitchNode } from "./definitions/switch.ts";
import { GPIOWRITENode } from "./definitions/gpio_write.ts";
import { ADCNode } from "./definitions/adc.ts";
import { ConstantNode } from "./definitions/constant.ts";
import { FunctionRubyNode } from "./definitions/function_ruby.ts";
import { BUTTONNode } from "./definitions/button.ts";
import { I2CNode } from "./definitions/i2c.ts";
import { CompleteNode } from "./definitions/complete.ts";
import { InitWlanNode } from "./definitions/init-wlan.ts";
import { HTTPRequestNode } from "./definitions/http-request.ts";
import { ThermistorNode } from "./definitions/thermistor.ts";
import { NTPTimestampNode } from "./definitions/ntpTimestamp.ts";

type NodeFactory = (
  data: any,
  connected: NodeOutput[],
  ports: NodeOutput[][],
) => NodeOutput;

export const nodeRegistry: Record<string, NodeFactory> = {
  inject: (data, connected) => new InjectNode(data, connected),
  trigger: (data, connected) => new TriggerNode(data, connected),
  LED: (data) => new LEDNode(data),
  debug: (data) => new DebugNode(data),
  "GPIO-Read": (data, connected) => new GPIOREADNode(data, connected),
  PWM: (data, connected) => new PWMNode(data, connected),
  delay: (data, connected) => new DelayNode(data, connected),
  switch: (data, connected, ports) => new SwitchNode(data, connected, ports),
  "GPIO-Write-1": (data) => new GPIOWRITENode(data),
  ADC: (data, connected) => new ADCNode(data, connected),
  Constant: (data, connected) => new ConstantNode(data, connected),
  "function-Code": (data, connected) => new FunctionRubyNode(data, connected),
  Button: (data, connected) => new BUTTONNode(data, connected),
  initLCD: (data, connected) => new I2CNode(data, connected),
  I2C: (data, connected) => new I2CNode(data, connected),
  complete: (data, connected) => new CompleteNode(data, connected),
  wlan: (data) => new InitWlanNode(data),
  "http request": (data, connected) => new HTTPRequestNode(data, connected),
  thermistor: (data, connected) => new ThermistorNode(data, connected),
  timestamp: (data, connected) => new NTPTimestampNode(data, connected),
};
