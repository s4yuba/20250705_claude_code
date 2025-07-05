# mdの更新を検知してスライドに反映する

## 手順

- step1: mdの変更を検知
- step2: mdをyamlに変換（なければyamlを作成）
- step3: 既存のartifacts/slides.htmlをmdとyamlを参考に更新
- step4: スライドPDFをscript/html-to-pdf.jsで生成

## 注意点

- 更新は内容のみ
- レイアウトは変更しないように
