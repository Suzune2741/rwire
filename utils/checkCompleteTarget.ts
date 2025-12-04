/**
 * コンプリートノードの監視ターゲットか確認する
 * @param nodeId 確認するノードのID
 * @param completeNodeTarget ターゲットのIDと自分のIDが格納されている
 * @returns  trueかfalse
 */
export const checkCompleteTarget = (
  nodeId: string,
  completeNodeTarget: {
    completeNodeId: string;
    targetNodeId: string[];
  }
): string => {
  return completeNodeTarget.targetNodeId.includes(nodeId)
    ? `$complete_${completeNodeTarget.completeNodeId}.resume`
    : "";
};
