# rwire
nodered->mruby/c用変換プログラム

## 出力するコード

### データの受け渡し
グローバル変数(Map)を使う
中身こんな形式
```
to: 宛先
data: データ
```

データ取得用の関数を1つ定義しておく
こんな感じ:
```ruby
def getData |id|
  return $data.fetch(id)
end
```
送信もこんな感じ
```ruby
def sendData |id, data|
  return $data[id]= data
end
```

