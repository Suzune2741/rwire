export interface Trigger {
  id: string
  type: "trigger"
  z: string
  name: string
  /* ? */
  op1: string
  /* ? */
  op2: string
  /* num */
  op1type: string
  /* num */
  op2type: string
  /* n秒おきに実行 */
  duration: string
  /* ? */
  extend: boolean
  /* ? */
  overrideDelay: boolean
  /* "s"が入っていた 単位時間の設定？ */
  units: string
  /* ? */
  reset: string
  /* allが入っていた 詳細不明 */
  bytopic: string
  /* topicが入っていた */
  topic: string
  /* 1が入る */
  outputs: number
  x: number
  y: number
  wires: string[]
}
