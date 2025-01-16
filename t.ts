const file = Deno.readFileSync("task.mrb");

console.log(
  [...new Uint8Array(file)].map((v) => `\\x${v.toString(16).padStart(2, "0")}`).join("")
);
