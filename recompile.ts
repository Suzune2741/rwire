import { decodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { build } from "./build.ts";
import { dataPass } from "./data-pass.ts";

type TaskInfo = {
  id: string;
  nodeName: string;
  code: string;
};

type Metadata = {
  version: string;
  tasks: TaskInfo[];
  uniqueInitialisationCodes: string[];
  initialisationCode: string[];
  callCodes: string[];
  nodeTypes: Record<string, string>;
};

type NodeCode = {
  id: string;
  code: string; 
};

type Request = {
  version: string;
  nodeCodes: NodeCode[];
};

type Change = {
  id: string;
  editedCode: string;
  originalCode: string | null;
};

const exists = (p: string) =>
  Deno.stat(p).then(
    () => true,
    () => false,
  );

const run = async () => {
  const request: Request = JSON.parse(
    await Deno.readTextFile("recompile-request.json"),
  );
  const metadata: Metadata = JSON.parse(
    await Deno.readTextFile("recompile-meta.json"),
  );

  if (request.version !== metadata.version) {
    throw new Error(
      "Compiler version differs from the original conversion. Run convert first.",
    );
  }

  const taskMap = new Map(metadata.tasks.map((task) => [task.id, task]));

  const changes: Change[] = [];
  for (const node of request.nodeCodes) {
    if (!taskMap.has(node.id)) {
      throw new Error(`Unknown node ID: ${node.id}`);
    }

    const editedCode = new TextDecoder().decode(decodeBase64(node.code));
    const originalCode = await Deno.readTextFile(`build/${node.id}.rb`).catch(
      () => null,
    );

    if (originalCode === editedCode && (await exists(`build/${node.id}.mrb`))) {
      continue;
    }
    changes.push({ id: node.id, editedCode, originalCode });
  }

  const attempted: Change[] = [];
  try {
    for (const ch of changes) {
      attempted.push(ch); 
      await build(ch.id, ch.editedCode, request.version);
    }
  } catch (e) {
    for (const ch of attempted) {
      if (ch.originalCode !== null) {
        await build(ch.id, ch.originalCode, request.version).catch(() => {});
      }
    }
    throw e;
  }

  const taskCodes: string[] = [];
  for (const task of metadata.tasks) {
    const mrb = await Deno.readFile(`build/${task.id}.mrb`);
    const byteCode = [...mrb]
      .map((v) => `\\x${v.toString(16).padStart(2, "0")}`)
      .join("");
    taskCodes.push(`$${task.nodeName} = Task.create("${byteCode}")`);
  }

  const finalOutput = [
    metadata.uniqueInitialisationCodes.join("\n"),
    taskCodes.join("\n"),
    "",
    metadata.initialisationCode.join("\n"),
    "",
    metadata.callCodes.join("\n"),
  ].join("\n");

  await Deno.writeTextFile("main.rb", `${dataPass}\n${finalOutput}\n`);
  console.log("Recompile completed");
};

try {
  await run();
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  Deno.exit(1);
}
