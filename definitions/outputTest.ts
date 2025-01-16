import { build } from "../build.ts";
import { DebugNode } from "./debug.ts";
import { InjectNode } from "./inject.ts";
import { LEDNode } from "./led.ts";
import { TriggerNode } from "./trigger.ts";

const createTaskCode = (name: string, code: string) => {
  return `$${name} = Task.create("${code}")`;
};

const debug = new DebugNode("debug1");
const led = new LEDNode("led1");
const trigger = new TriggerNode("trigger1", [debug,led]);
const inject = new InjectNode("inject", [trigger]);

const nodes = [debug, led, trigger, inject];
console.log(nodes.map(v => v.getNodeInitialisationCode()).join("\n"));


