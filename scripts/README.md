# HTML to PDF Converter for Slides

16:9のスライドをHTMLからPDFに変換するスクリプトです。

## 必要な環境

- Node.js (v14以上)
- npm

## セットアップ

```bash
npm install
```

## 使用方法

### デフォルトの変換（推奨）

```bash
npm run convert
```

これは `artifacts/slides.html` を `artifacts/slides-output.pdf` に変換します。

### カスタムファイルの変換

```bash
node scripts/html-to-pdf.js <input.html> <output.pdf>
```

## 特徴

- **16:9のアスペクト比**: 1920x1080ピクセルで固定
- **ブラウザレイアウトの保持**: ブラウザで表示される通りのレイアウトでPDF生成
- **全ページ出力**: すべてのスライドが個別のPDFページとして出力される
- **背景色の保持**: CSSで定義された背景色も正しく出力される

## 技術仕様

- Puppeteerを使用したヘッドレスブラウザでのレンダリング
- CSSのページブレーク機能を活用した各スライドの分離
- printメディアクエリを使用した印刷用最適化