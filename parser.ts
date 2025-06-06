import { build } from "./build.ts";
import { DebugNode } from "./definitions/debug.ts";
import { InjectNode } from "./definitions/inject.ts";
import { LEDNode } from "./definitions/led.ts";
import { TriggerNode } from "./definitions/trigger.ts";
import { Debug } from "./types/nodes/debug.ts";
import { Inject } from "./types/nodes/inject.ts";
import { MrubyLED } from "./types/nodes/mruby-led.ts";
import { Trigger } from "./types/nodes/trigger.ts";
import { NodeOutput } from "./types/output.ts";
import { MrubyGPIOREAD } from "./types/nodes/gpio_read.ts";
import { GPIOREADNode } from "./definitions/gpio_read.ts";
import { MrubyPWM } from "./types/nodes/mruby-pwm.ts";
import { PWMNode } from "./definitions/pwm.ts";
import { Delay } from "./types/nodes/delay.ts";
import { DelayNode } from "./definitions/delay.ts";

type flow = Debug | Inject | MrubyLED | Trigger | MrubyGPIOREAD | MrubyPWM | Delay;
type flows = flow[];

export const parseJSON = (json: string): flows => {
  const parsed = JSON.parse(json) as flows;
  return parsed.filter((n) => {
    const nodeType = ["debug", "inject", "LED", "trigger", "GPIO-Read","PWM","delay"];
    return nodeType.includes(n.type);
  });
};

type InputNode = {
  id: string;
  type: string;
  data: flow;
  wires: string[];
};

const parsed = parseJSON(Deno.readTextFileSync("flows.json"));
const input: InputNode[] = parsed.map((n) => {
  return {
    id: n.id,
    type: n.type,
    data: n,
    wires: n.wires.flat(),
  };
});

type Node = {
  id: string;
  type: string;
  data: flow;
  wires: Node[];
};

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

    // `wires` を再帰的に展開
    return {
      id: inputNode.id,
      type: inputNode.type,
      wires: inputNode.wires.map(buildNode), // 子ノードを再帰的に処理
      data: inputNode.data,
    };
  };

  // 入力データのルートノードを処理（全体をループ処理）
  return inputNodes
    .filter(
      (node) =>
        !inputNodes.some((otherNode) => otherNode.wires.includes(node.id))
    ) // ルートノードの判定
    .map((rootNode) => buildNode(rootNode.id));
}

const toNodeOutput = (
  node: Node 
): InjectNode | TriggerNode | LEDNode | DebugNode | GPIOREADNode | PWMNode | DelayNode => {
  switch (node.type) {
    case "inject":
      return new InjectNode(node.data as Inject, node.wires.map(toNodeOutput));
    case "trigger":
      return new TriggerNode(
        node.data as Trigger,
        node.wires.map(toNodeOutput)
      );
    case "LED":
      return new LEDNode(node.data as MrubyLED);
    case "debug":
      return new DebugNode(node.data as Debug);
    case "GPIO-Read":
      return new GPIOREADNode(node.data as MrubyGPIOREAD,node.wires.map(toNodeOutput));
    case "PWM":
      return new PWMNode(node.data as MrubyPWM,node.wires.map(toNodeOutput));
    case "delay":
      return new DelayNode(node.data as Delay,node.wires.map(toNodeOutput));
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
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

// 実行
const result = transformToNode(input);

// それぞれのノードに対して、getNodeCodeOutput()を呼び出し、コードを生成
for (let i = 0; i < result.length; i++) {
  const res = toNodeOutput(result[i]);
  const codes = collectCode(res);

  const taskCode = async (id: string, nodeName: string, code: string) => {
    return `$${nodeName} = Task.create("${await build(id, code)}")`;
  };

  const buildTaskCodes = async (codes: codeOutput[]) => {
    const res: string[] = [];
    for (const code of codes) {
      res.push(await taskCode(code.nodeID, code.nodeName, code.code));
    }
    return res;
  };

  const c = await buildTaskCodes(codes);
  // 初期宣言コードを集めて重複を削除
  const initialisationCodes = codes.map((v) => v.initialisationCodes).flat();
  const uniqueinits: string[] = Array.from(new Set(initialisationCodes));

  const output = [
    `
$data = {}
def getData (id)
  a = $data[id]
  return a
end
def sendData(id, data)
  return $data[id]= data
end
    `,
    uniqueinits.join("\n"),
    "",
    c.join("\n"),
    "",
    codes.map((v) => v.initialisationCode).join("\n"),
    "",
    res.getCallCodes(),
  ].join("\n");
  console.log(output);
}
