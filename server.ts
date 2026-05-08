import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.12.0/middleware.ts";
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { v4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";
import {
  join,
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.208.0/path/mod.ts";

const PROJECT_ROOT = dirname(fromFileUrl(import.meta.url));
const FILES_BASE_DIR = join(PROJECT_ROOT, "files");
const TIMEOUT_MS = 10000;

const getWorkDir = (id: string) => join(FILES_BASE_DIR, id);
const exist = async (path: string) => {
  try {
    await Deno.stat(path);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return false;
    throw e;
  }
};

const ok = <T>(data: T) => ({ status: "ok" as const, data });
const error = (code: string, message: string, details?: string) => ({
  status: "error" as const,
  error: { code, message, details },
});

const validateId = (id: string) => v4.validate(id);

const CORS_ORIGIN = Deno.env.get("CORS_ORIGIN") ?? "*";
const app = new Hono();
app.use("/*", cors({ origin: CORS_ORIGIN }));

await Deno.mkdir(FILES_BASE_DIR, { recursive: true });

/**
 * プロジェクト作成
 */
app.post("/project", async (c) => {
  try {
    const body = await c.req.json();
    if (!body?.flows || !Array.isArray(body.flows)) {
      return c.json(error("INVALID_REQUEST", "flows must be array"), 400);
    }

    const projectId = crypto.randomUUID();
    const workDir = getWorkDir(projectId);

    await Deno.mkdir(workDir, { recursive: true });
    await Deno.writeTextFile(
      join(workDir, "flows.json"),
      JSON.stringify(body.flows),
    );

    return c.json(ok({ projectId }));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(error("INTERNAL_ERROR", "Server error", message), 500);
  }
});

/**
 * 変換実行
 */
app.post("/project/:id/convert", async (c) => {
  const projectId = c.req.param("id");
  if (!validateId(projectId))
    return c.json(error("INVALID_ID", "UUID v4 required"), 400);

  const workDir = getWorkDir(projectId);
  if (!(await exist(workDir)))
    return c.json(error("PROJECT_NOT_FOUND", "Project not found"), 404);

  try {
    await Deno.mkdir(join(workDir, "build"), { recursive: true });

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS);
    const cmd = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", join(PROJECT_ROOT, "parser.ts")],
      cwd: workDir,
      signal: abortController.signal,
    });

    const { code, stdout, stderr } = await cmd
      .output()
      .finally(() => clearTimeout(timeoutId));

    const decoder = new TextDecoder();

    if (code !== 0) {
      return c.json(
        error("COMPILE_FAILED", "Compilation failed", decoder.decode(stderr)),
        500,
      );
    }

    await Deno.writeFile(join(workDir, "main.rb"), stdout);

    const buildDir = join(workDir, "build");
    const binary = await (async () => {
      for await (const entry of Deno.readDir(buildDir)) {
        if (entry.isFile && entry.name.endsWith(".mrb")) {
          const content = await Deno.readFile(join(buildDir, entry.name));
          return encodeBase64(content);
        }
      }
      return null;
    })();

    if (!binary)
      return c.json(error("MRB_NOT_GENERATED", ".mrb not generated"), 500);

    return c.json(
      ok({
        mainCode: encodeBase64(stdout),
        binary,
      }),
    );
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return c.json(
        error("TIMEOUT", `Compilation timed out after ${TIMEOUT_MS}ms`),
        504,
      );
    }
    const message = e instanceof Error ? e.message : String(e);
    return c.json(error("INTERNAL_ERROR", "Server error", message), 500);
  }
});

/**
 * 情報取得
 */
app.get("/project/:id", async (c) => {
  const projectId = c.req.param("id");
  if (!validateId(projectId))
    return c.json(error("INVALID_ID", "UUID v4 required"), 400);

  const workDir = getWorkDir(projectId);
  if (!(await exist(workDir)))
    return c.json(error("PROJECT_NOT_FOUND", "Project not found"), 404);

  try {
    const nodesQuery = c.req.query("nodes");
    const requestedNodes = nodesQuery?.split(",").filter(validateId) ?? [];

    const [mainCode, nodeMap] = await Promise.all([
      Deno.readFile(join(workDir, "main.rb"))
        .then(encodeBase64)
        .catch(() => ""),

      Deno.readTextFile(join(workDir, "flows.json"))
        .then(
          (text) =>
            new Map<string, string>(
              (JSON.parse(text) as { id: string; type: string }[]).map((n) => [
                n.id,
                n.type,
              ]),
            ),
        )
        .catch(() => new Map<string, string>()),
    ]);

    const buildDir = join(workDir, "build");
    const nodeCodes = [];

    if (await exist(buildDir)) {
      for await (const entry of Deno.readDir(buildDir)) {
        if (!entry.isFile || !entry.name.endsWith(".rb")) continue;

        const id = entry.name.replace(/\.rb$/, "");
        if (requestedNodes.length && !requestedNodes.includes(id)) continue;

        const content = await Deno.readFile(join(buildDir, entry.name));
        nodeCodes.push({
          id,
          nodeType: nodeMap.get(id) ?? "",
          code: encodeBase64(content),
        });
      }
    }

    return c.json(ok({ mainCode, nodeCodes }));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(error("INTERNAL_ERROR", "Server error", message), 500);
  }
});

/**
 * 削除
 */
app.delete("/project/:id", async (c) => {
  const projectId = c.req.param("id");
  if (!validateId(projectId))
    return c.json(error("INVALID_ID", "UUID v4 required"), 400);

  const workDir = getWorkDir(projectId);
  if (!(await exist(workDir)))
    return c.json(error("PROJECT_NOT_FOUND", "Project not found"), 404);

  try {
    await Deno.remove(workDir, { recursive: true });
    return c.json(ok({ projectId }));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(error("DELETE_FAILED", "Delete failed", message), 500);
  }
});

Deno.serve(app.fetch);
