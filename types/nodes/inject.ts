export interface Inject {
    id: string
    type: "inject"
    /* 関係なさそう */
    z: string
    /* Inject固定？ */
    name: string
    props: [
        {
            /* payload固定かも*/
            p: string
        }
    ],
    /* 不明 */
    repeat: number,
    crontab: "",
    /* 1度だけ実行するか */
    once: boolean
    /* 1回分の待ち時間 */
    onceDelay: number
    /* 空文字列だった */
    topic: string
    /* 送るデータ */
    payload: string
    /* テスト用のデータでは num だった*/
    payloadType: string
    /* 関係なさそう */
    x: number
    y: number
    /* 繋がっている別のノード */
    wires: string[]
}
