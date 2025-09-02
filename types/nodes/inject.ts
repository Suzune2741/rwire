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
            v?: string | number | boolean | JSON 
        }
    ],
    /* 繰り返して動かす場合に入力した時間間隔*/
    repeat: string,
    crontab: "",
    /* 1度だけ実行するか.「Node-RED起動後の[]秒後以下を行う」にチェックを入れた場合にtrueになる*/
    once: boolean
    /* 1回分の待ち時間 */
    onceDelay: number
    /* 空文字列だった.msg.topicに入力した値が格納される. */
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
