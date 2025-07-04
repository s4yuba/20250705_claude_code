# MAX_THINKING_TOKENS システム解析

## 概要
Claude Code の思考トークンシステムは、ユーザーの入力内容を解析し、適切な思考トークン数を自動的に割り当てる機能です。

## トークンレベル定義

```javascript
var Tw1 = {
  HIGHEST: 31999,  // 最高レベル: 31,999 トークン
  MIDDLE: 1e4,     // 中レベル: 10,000 トークン
  BASIC: 4000,     // 基本レベル: 4,000 トークン
  NONE: 0          // なし: 0 トークン
};
```

## 多言語パターン検出

### English (英語)
```javascript
HIGHEST: [
  {pattern: "think harder", needsWordBoundary: true},
  {pattern: "think intensely", needsWordBoundary: true},
  {pattern: "think longer", needsWordBoundary: true},
  {pattern: "think really hard", needsWordBoundary: true},
  {pattern: "think super hard", needsWordBoundary: true},
  {pattern: "think very hard", needsWordBoundary: true},
  {pattern: "ultrathink", needsWordBoundary: true}
],
MIDDLE: [
  {pattern: "think about it", needsWordBoundary: true},
  {pattern: "think a lot", needsWordBoundary: true},
  {pattern: "think deeply", needsWordBoundary: true},
  {pattern: "think hard", needsWordBoundary: true},
  {pattern: "think more", needsWordBoundary: true},
  {pattern: "megathink", needsWordBoundary: true}
],
BASIC: [
  {pattern: "think", needsWordBoundary: true}
]
```

### Japanese (日本語)
```javascript
HIGHEST: [
  {pattern: "熟考"},
  {pattern: "深く考えて"},
  {pattern: "しっかり考えて"}
],
MIDDLE: [
  {pattern: "もっと考えて"},
  {pattern: "たくさん考えて"},
  {pattern: "よく考えて"},
  {pattern: "長考"}
],
BASIC: [
  {pattern: "考えて"}
]
```

### Chinese (中国語)
```javascript
HIGHEST: [
  {pattern: "多想一会"},
  {pattern: "深思"},
  {pattern: "仔细思考"}
],
MIDDLE: [
  {pattern: "多想想"},
  {pattern: "好好想"}
],
BASIC: [
  {pattern: "想"},
  {pattern: "思考"}
]
```

### 他の対応言語
- **Spanish**: "piensa profundamente", "piensa más"
- **French**: "réfléchis profondément", "réfléchis plus"
- **German**: "denk gründlich", "denk tief"
- **Korean**: "심사숙고", "깊이 생각", "곰곰이 생각"
- **Italian**: "rifletti a fondo", "pensa profondamente"

## 核心機能

### 1. 環境変数チェック
```javascript
function y$(A, B) {
  if (process.env.MAX_THINKING_TOKENS) {
    let Q = parseInt(process.env.MAX_THINKING_TOKENS, 10);
    if (Q > 0) {
      E1("tengu_thinking", {provider: bH(), tokenCount: Q});
      return Q;
    }
  }
  return Math.max(...A.filter((Q) => Q.type === "user" && !Q.isMeta).map(Qk6), B ?? 0);
}
```

### 2. パターンマッチング
```javascript
function Gk6(A, B) {
  for (let Q of Object.values(Bk6)) {
    let D = Q[B];
    for (let {pattern: I, needsWordBoundary: G} of D) {
      if ((G ? new RegExp(`\\b${I}\\b`) : new RegExp(I)).test(A)) {
        return true;
      }
    }
  }
  return false;
}
```

### 3. トークン判定ロジック
```javascript
function Ik6(A) {
  let B = [
    ["HIGHEST", Tw1.HIGHEST],
    ["MIDDLE", Tw1.MIDDLE], 
    ["BASIC", Tw1.BASIC]
  ];
  
  for (let [Q, D] of B) {
    if (Gk6(A, Q)) return D;
  }
  return Tw1.NONE;
}
```

## 処理フロー

### 1. 入力解析
1. ユーザーメッセージの内容を小文字に変換
2. テキストコンテンツを抽出
3. 各言語のパターンと照合

### 2. パターンマッチング
1. HIGHEST レベルのパターンを最初にチェック
2. 見つからない場合は MIDDLE レベルをチェック
3. 最後に BASIC レベルをチェック
4. どれも該当しない場合は NONE (0トークン)

### 3. トークン配分
1. 環境変数 `MAX_THINKING_TOKENS` が設定されている場合は優先使用
2. パターンマッチングの結果に基づいてトークン数を決定
3. テレメトリーでトークン使用量を記録

## 特徴的な機能

### 単語境界検出
- 英語系言語では `needsWordBoundary: true` を使用
- 単語の一部ではなく完全な単語として検出
- 正規表現 `\\b` を使用した正確なマッチング

### "ultrathink" キーワード
- 最高レベル (31,999トークン) を要求する特別なキーワード
- 英語の HIGHEST パターンに含まれる
- 最も高度な思考処理を要求する場合に使用

### テレメトリー統合
```javascript
E1("tengu_thinking", {provider: bH(), tokenCount: Q});
```
- 思考トークンの使用量を記録
- プロバイダー情報と共に送信
- 使用パターンの分析に活用

## 実際の使用例

### 高度な思考が必要な場合
```
ユーザー: "ultrathink about this complex algorithm"
→ 31,999 トークン割り当て
```

### 中程度の思考が必要な場合
```
ユーザー: "think deeply about the solution"
→ 10,000 トークン割り当て
```

### 基本的な思考が必要な場合
```
ユーザー: "think about it"
→ 4,000 トークン割り当て
```

## 設定方法

環境変数で固定値を設定可能：
```bash
export MAX_THINKING_TOKENS=50000
```

この設定により、パターンマッチングを無視して固定のトークン数を使用できます。