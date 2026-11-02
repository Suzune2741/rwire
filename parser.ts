import { build } from "./build.ts";
import { Debug } from "./types/nodes/debug.ts";
import { Inject } from "./types/nodes/inject.ts";
import { MrubyLED } from "./types/nodes/mruby-led.ts";
import { Trigger } from "./types/nodes/trigger.ts";
import { NodeOutput } from "./types/output.ts";
import { MrubyGPIOREAD } from "./types/nodes/gpio_read.ts";
import { MrubyPWM } from "./types/nodes/mruby-pwm.ts";
import { Delay } from "./types/nodes/delay.ts";
import { Switch } from "./types/nodes/switch.ts";
import { MrubyGPIOWRITE } from "./types/nodes/gpio_write.ts";
import { MrubyADC } from "./types/nodes/mruby-adc.ts";
import { MrubyConstant } from "./types/nodes/mruby-constant.ts";
import { MrubyFunctionRuby } from "./types/nodes/mruby-function-ruby.ts";
import { MrubyBUTTON } from "./types/nodes/mruby-button.ts";
import { MrubyI2C } from "./types/nodes/mruby-i2c.ts";
import { Complete } from "./types/nodes/complete.ts";
import { HTTPRequest } from "./types/nodes/http-request.ts";
import { InitWlan } from "./types/nodes/mruby-init-wlan.ts";
import { thermistor } from "./types/nodes/thermistor.ts";
import { dataPass } from "./dataPass.ts";
import { NTPTimestamp } from "./types/nodes/ntpTimestamp.ts";
import { nodeRegistry } from "./nodeRegistry.ts";
type flow =
  | Debug
  | Inject
  | MrubyLED
  | Trigger
  | MrubyGPIOREAD
  | MrubyPWM
  | Delay
  | Switch
  | MrubyGPIOWRITE
  | MrubyADC
  | MrubyConstant
  | MrubyFunctionRuby
  | MrubyBUTTON
  | MrubyI2C
  | Complete
  | InitWlan
  | HTTPRequest
  | thermistor
  | NTPTimestamp;
type flows = flow[];

export const parseJSON = (json: string): flows => {
  const parsed = JSON.parse(json) as flows;
  return parsed.filter((n) => Object.hasOwn(nodeRegistry, n.type));
};

type InputNode = {
  id: string;
  type: string;
  data: flow;
  wires: string[] | string[][];
};
export const completeNodeTarget = {
  completeNodeId: "",
  targetNodeId: [""],
};
const parsed = parseJSON(Deno.readTextFileSync("flows.json"));
const input: InputNode[] = parsed.map((n) => {
  return {
    id: n.id,
    type: n.type,
    data: n,
    wires: n.wires,
  };
});

type Node = {
  id: string;
  type: string;
  data: flow;
  wires: Node[][];
};

// wires配列を正規化する
function normalizeWires(wires: string[] | string[][]): string[][] {
  if (wires.length === 0) return [];

  // 最初の要素が文字列なら一次元配列として扱う
  if (typeof wires[0] === "string") {
    return [wires as string[]];
  }

  // 既に二次元配列の場合はそのまま返す
  return wires as string[][];
}

function transformToNode(inputNodes: InputNode[]): Node[] {
  // 入力データを検索しやすいようにマップに変換
  const nodeMap = new Map<string, InputNode>();
  inputNodes.forEach((node) => nodeMap.set(node.id, node));

  /**
   * 再帰的にノードを構築
   */
  const buildNode = (id: string): Node => {
    const inputNode = nodeMap.get(id);
    if (inputNode === undefined) {
      throw new Error(`Node with id ${id} not found`);
    }

    const normalizedWires = normalizeWires(inputNode.wires);
    // 各出力ポートの接続先ノードを構築
    const wireNodes: Node[][] = normalizedWires.map((outputWires) =>
      outputWires.map(buildNode),
    );

    return {
      id: inputNode.id,
      type: inputNode.type,
      wires: wireNodes,
      data: inputNode.data,
    };
  };

  const isRootNode = (node: InputNode): boolean => {
    const nodeId = node.id;
    if (node.type === "complete") {
      completeNodeTarget.targetNodeId = (node.data as Complete).scope;
      completeNodeTarget.completeNodeId = node.id;
    }
    return !inputNodes.some((otherNode) => {
      const normalizedWires = normalizeWires(otherNode.wires);
      return normalizedWires.some((outputWires) =>
        outputWires.includes(nodeId),
      );
    });
  };

  // 入力データのルートノードを処理
  return inputNodes
    .filter(isRootNode)
    .map((rootNode) => buildNode(rootNode.id));
}

// 重複する宣言を消去する
function extractUniqueInitCodes(codes: string[]): string[] {
  const initMap = new Map<string, string>();

  codes.forEach((code) => {
    const match = code.match(/^(\$\w+)/);
    if (match) {
      const name = match[1];
      const existCode = initMap.get(name);

      if (!existCode || code.length > existCode.length) {
        initMap.set(name, code);
      }
    } else {
      initMap.set(code, code);
    }
  });
  return Array.from(initMap.values());
}

const toNodeOutput = (node: Node): NodeOutput => {
  const factory = nodeRegistry[node.type];
  if (!factory) {
    throw new Error(`Unknown node type: ${node.type}`);
  }
  const ports = node.wires.map((outputWires) => outputWires.map(toNodeOutput));
  const connected = ports.flat();
  return factory(node.data, connected, ports);
};

type codeOutput = {
  nodeID: string;
  code: string;
  initialisationCode: string;
  initialisationCodes: string[];
  nodeName: string;
};

const collectCode = (node: NodeOutput): codeOutput[] => {
  const code: codeOutput[] = [
    {
      code: node.getNodeCodeOutput(),
      nodeID: node.getNodeID(),
      initialisationCode: node.getNodeInitialisationCode(),
      initialisationCodes: node.getInitialisationCodes(),
      nodeName: node.getTaskName(),
    },
  ];

  for (const child of node.getNextConnectedNodes()) {
    code.push(...collectCode(child));
  }

  return code;
};

// TODO: injectノードのrunタイミングを同時にする必要がありそう.
// 実行
const result = transformToNode(input);
// ノードのデータ受け渡しに必要な関数を出力
console.log(dataPass);

const version = Deno.args[0];
const initialisationCodes: string[] = []; // GPIO.newなど
const taskCodes: string[] = []; // Task.createをまとめる
const callCodes: string[] = []; // runをまとめる
const initialisationCode: string[] = []; // resumeをまとめる

// 再コンパイル用のメタデータを保存する
const tasks: {
  id: string;
  nodeName: string;
  code: string;
}[] = [];

const buildTaskCode = async (
  id: string,
  nodeName: string,
  code: string,
  version: string,
) => {
  return `$${nodeName} = Task.create("${await build(id, code, version)}")`;
};

// それぞれのノードに対して、getNodeCodeOutput()を呼び出し、コードを生成
for (let i = 0; i < result.length; i++) {
  const res = toNodeOutput(result[i]);
  const codes = collectCode(res);

  for (const code of codes) {
    const taskStr = await buildTaskCode(
      code.nodeID,
      code.nodeName,
      code.code,
      version,
    );
    taskCodes.push(taskStr);
    tasks.push({
      id: code.nodeID,
      nodeName: code.nodeName,
      code: code.code,
    });
  }

  const executionCodes = codes.flatMap((v) => v.initialisationCodes);
  initialisationCodes.push(...executionCodes);

  const specificCodes = codes.map((v) => v.initialisationCode).filter(Boolean);
  initialisationCode.push(...specificCodes);

  callCodes.push(res.getCallCodes());
}
const uniqueInitialisationCodes = extractUniqueInitCodes(initialisationCodes);

const finalOutput = [
  uniqueInitialisationCodes.join("\n"),
  taskCodes.join("\n"),
  "",
  initialisationCode.join("\n"),
  "",
  callCodes.join("\n"),
].join("\n");

console.log(finalOutput);

const nodeTypes = Object.fromEntries(input.map((node) => [node.id, node.type]));

// 再コンパイルに必要な情報を保存
const metadata = {
  version,
  tasks,
  uniqueInitialisationCodes,
  initialisationCode,
  callCodes,
  nodeTypes,
};

await Deno.writeTextFile(
  "recompile-meta.json",
  JSON.stringify(metadata, null, 2),
);
