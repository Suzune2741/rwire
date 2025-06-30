export interface Switch{
    id: string;
    type: "switch";
    z:string;
    name: string;
    /*デフォルトはpayload*/
    property: string;
    propertyType: string;
    rules:[
        {
            t: string; // 比較の種類
            v: string; // 比較する値
            vt: string; // 比較する値の型
        }
    ];
    /*true:すべての条件を適用させるか*/
    checkall: string;
    repair: boolean;
    outputs: number;
    x: number;
    y: number;
    wires: string[];

}
