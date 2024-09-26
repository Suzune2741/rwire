import { Debug } from "./types/nodes/debug.ts";
import { Flow } from "./types/nodes/flow.ts";
import { Inject } from "./types/nodes/inject.ts";
import { MrubyLED } from "./types/nodes/mruby-led.ts";
import { Trigger } from "./types/nodes/trigger.ts";

type flows = (Flow | Debug | Inject | MrubyLED | Trigger)[]

export const parseJSON = (json: string):flows => {
    return JSON.parse(json) as flows;
}