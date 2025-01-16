import { parseJSON } from "./parser.ts";

const json = await Deno.readTextFile("flows.json");

const parsed = parseJSON(json);

for (const n of parsed) {
  if (n.type === "tab") continue;
  console.log(`${n.id}(${n.type}) ${n.wires}`)
  if (n.wires.length === 0) console.log("終端ノード")
}
