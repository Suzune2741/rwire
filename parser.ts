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
import { Switch } from "./types/nodes/switch.ts";
import { SwitchNode } from "./definitions/switch.ts";
import { MrubyGPIOWRITE } from "./types/nodes/gpio_write.ts";
import { GPIOWRITENode } from "./definitions/gpio_write.ts";
import { MrubyADC } from "./types/nodes/mruby-adc.ts";
import { ADCNode } from "./definitions/adc.ts";
import { MrubyConstant } from "./types/nodes/mruby-constant.ts";
import { ConstantNode } from "./definitions/constant.ts";
import { MrubyFunctionRuby } from "./types/nodes/mruby-function-ruby.ts";
import { FunctionRubyNode } from "./definitions/function_ruby.ts";
import { MrubyBUTTON } from "./types/nodes/mruby-button.ts";
import { BUTTONNode } from "./definitions/button.ts";
import { MrubyI2C } from "./types/nodes/mruby-i2c.ts";
import { I2CNode } from "./definitions/i2c.ts";
import { CompleteNode } from "./definitions/complete.ts";
import { Complete } from "./types/nodes/complete.ts";

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
  | Complete;
type flows = flow[];

export const parseJSON = (json: string): flows => {
  const parsed = JSON.parse(json) as flows;
  return parsed.filter((n) => {
    const nodeType = [
      "debug",
      "inject",
      "LED",
      "trigger",
      "GPIO-Read",
      "PWM",
      "delay",
      "switch",
      "GPIO-Write-1",
      "ADC",
      "Constant",
      "function-Code",
      "Button",
      "initLCD",
      "I2C",
      "complete",
    ];
    return nodeType.includes(n.type);
  });
};

type InputNode = {
  id: string;
  type: string;
  data: flow;
  wires: string[] | string[][];
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
      outputWires.map(buildNode)
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
    return !inputNodes.some((otherNode) => {
      const normalizedWires = normalizeWires(otherNode.wires);
      return normalizedWires.some((outputWires) =>
        outputWires.includes(nodeId)
      );
    });
  };

  // 入力データのルートノードを処理
  return inputNodes
    .filter(isRootNode)
    .map((rootNode) => buildNode(rootNode.id));
}

const toNodeOutput = (
  node: Node
):
  | InjectNode
  | TriggerNode
  | LEDNode
  | DebugNode
  | GPIOREADNode
  | PWMNode
  | DelayNode
  | SwitchNode
  | GPIOWRITENode
  | ADCNode
  | ConstantNode
  | FunctionRubyNode
  | BUTTONNode
  | I2CNode
  | CompleteNode => {
  const allConnectedNodes = node.wires.flat().map(toNodeOutput);

  switch (node.type) {
    case "inject":
      return new InjectNode(node.data as Inject, allConnectedNodes);
    case "trigger":
      return new TriggerNode(node.data as Trigger, allConnectedNodes);
    case "LED":
      return new LEDNode(node.data as MrubyLED);
    case "debug":
      return new DebugNode(node.data as Debug);
    case "GPIO-Read":
      return new GPIOREADNode(node.data as MrubyGPIOREAD, allConnectedNodes);
    case "PWM":
      return new PWMNode(node.data as MrubyPWM, allConnectedNodes);
    case "delay":
      return new DelayNode(node.data as Delay, allConnectedNodes);
    case "switch": {
      const portNodes = node.wires.map((outputWires) =>
        outputWires.map(toNodeOutput)
      );
      return new SwitchNode(node.data as Switch, allConnectedNodes, portNodes);
    }
    case "GPIO-Write-1":
      return new GPIOWRITENode(node.data as MrubyGPIOWRITE);
    case "ADC":
      return new ADCNode(node.data as MrubyADC, allConnectedNodes);
    case "Constant":
      return new ConstantNode(node.data as MrubyConstant, allConnectedNodes);
    case "function-Code":
      return new FunctionRubyNode(
        node.data as MrubyFunctionRuby,
        allConnectedNodes
      );
    case "Button":
      return new BUTTONNode(node.data as MrubyBUTTON, allConnectedNodes);
    case "initLCD":
      return new I2CNode(node.data as MrubyI2C, allConnectedNodes);
    case "I2C":
      return new I2CNode(node.data as MrubyI2C, allConnectedNodes);
    case "complete":
      return new CompleteNode(node.data as Complete, allConnectedNodes);
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

// TODO: injectノードのrunタイミングを同時にする必要がありそう.
// 実行
const result = transformToNode(input);
// ノードのデータ受け渡しに必要な関数を生成
const dataPass = `
$data = {}
def getData (id)
  a = $data[id]
  return a
end
def sendData(id, data)
  return $data[id]= data
end
    `;
console.log(dataPass);
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
