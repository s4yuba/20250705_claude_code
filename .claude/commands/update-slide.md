# mdの更新を検知してスライドに反映する

## 手順

- step1: mdの変更を検知
- step2: mdをyamlに変換（なければyamlを作成）
- step3: 既存のslides.htmlをmdとyamlを参考に更新
- step4: スライドPDFをscript/html-to-pdf.jsで生成

## 注意点

- 更新は内容のみ
- レイアウトは変更しないように

## PDF生成手順

1. 依存関係のインストール（初回のみ）:
```bash
npm install
```

2. HTMLからPDFスライドを生成:
```bash
node html-to-pdf.js slides.html slides.pdf
```

- 16:9のアスペクト比（1920x1080）で自動生成
- 背景画像やCSSスタイルも含めて出力
