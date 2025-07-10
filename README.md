# rwire
nodered->mruby/c用変換プログラム

## 実行に必要なもの
- Deno(最新版)
- Node-REDの出力
## 実行方法
1. /buildをプロジェクトのルートに作成
2. flows.jsonを作成し、Node-REDの出力を貼る
3. 以下のコマンドを実行
```sh 
deno run -A ./parser.ts
```
もしくは
```sh 
deno run -A ./parser.ts -> parse.rb
```

## 現在の対応状況
### Node-REDの標準ノード
- Inject
- debug
- trigger
### mruby RBoard Nodes
- LED
- GPIO-Read
- ADC
- GPIO-write
- PWM
- Constant
- function ruby
