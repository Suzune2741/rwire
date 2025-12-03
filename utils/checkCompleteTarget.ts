/**
 * コンプリートノードの監視ターゲットか確認する
 * @param nodeId 確認するノードのID
 * @param targetId 監視ターゲットのID
 * @returns  trueかfalse
 */
export const checkCompleteTarget = (
  nodeId: string,
  targetId: string[]
): string => {
  return targetId.includes(nodeId) ? `$complete_${nodeId}.resume` : "";
};
