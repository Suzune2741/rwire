/**
 * ノードの出力定義
 */
export interface NodeOutput {
    /**
     * ノードのIDを取得
     * @example "debug_32ekjnsdf"
     */
    getNodeID(): string;

    /**
     * ノードが接続されている別のノードの配列を取得
     * @example [Debug, LED]
     */
    getNextConnectedNodes(): NodeOutput[];

    /**
     * ノードのコードを取得(この部分がタスクになる)
     * @example 
     * ```
     *  GPIO_1.write(1)
     *  sleep 1
     *  GPIO_1.write(0)
     * ```
     */
    getNodeCodeOutput(): string;

    /**
     * ノードを別のノードから呼び出すためのコードを取得
     * @example
     * ```ruby
     * debug_32ekjnsdf.resume
     * ```
     */
    getCallCodes(): string;

    /**
     * ノードを初期化するためのコードを取得(ノード内で使用する宣言ではない)
     * 
     * @example
     * ```ruby
     * debug_32ekjnsdf.run
     * ```
     */
    getNodeInitialisationCode(): string;
    
    /**
     * ノード内で利用する宣言を取得\
     * ToDo: ここが被らないようにする
     * @example
     * ```ruby
     * GPIO_1 = GPIO.new(1, GPIO::OUT)
     * ```
     */
    getInitialisationCodes(): string[];
}

