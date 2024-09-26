import { parseJSON } from "./parser.ts";

const json = await Deno.readTextFile("flows.json");

const parsed = parseJSON(json);

for (const n of parsed) {
  if (n.type === "tab") continue;
  console.log(n);
}

