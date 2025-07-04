# 初学者でも今すぐできる、Claude Codeの生産性を10倍にするTips

Oikon

2025/07/05

Claude Code 初学者 勉強会 2

## Who are you?

![icon](fig/icon.jpg)

Oikon

某外資IT企業, R&D, SW製品開発
エンジニア歴6年
趣味でツール弄りや個人開発してます
Claude Codeの発信多め（Zenn, 𝕏のハイライト）

𝕏:@gaishi_narou
![x_qr](fig/icon_qr.png)

## Claude Code歴

Anthropic推し
Claude 3.5から使用（ちょうど１年くらい）
Claude Codeは3月に初使用
Maxプラン開放後愛用（5/1~）

## 今回話すこと

### 対象: 初学者

Claude Codeを使ってみたい・使い始めた方

### 話す内容

X のポスト "CLAUDE CODE 10x productivity workflow" のアレンジ

1. IDE(VSCode, Cursor)統合
2. Planモード (Shift + Tab 2回)
3. CLAUDE.mdのメンテナンス
4. `/clear`によるコンテキストの浄化
5. `Think`の拡張
6. `permissions`の設定
7. 最新知識・ドキュメントのInput
8. Task (subagent) の活用
9. +α: Hooksの活用

![x_post](fig/ss%202025-07-03%2023.38.06.png)

## 1: IDE（VSCode, Cursor）統合

Claude Codeユーザーの多くはIDE統合して使用

メリット:

- 慣れているエディタが使える
- 変更履歴が見やすい
- Cursor, GitHub copilotとの併用

Claude CodeはCLIツールとしても活用できるが、まずはIDEで試すのがおすすめ
個人的には動作が軽いVSCodeを使用している

![ide](fig/ide.jpeg)

## 2: Plan モード (Shift + Tab 2 回)

Claude Codeのタスク実行前にプラン立ててくれる

メリット:

- いきなり実行しない
- 必要であればプラン修正可能

ワンショットのプロンプトエンジニアリングは手戻りも多い
コンテキストを大事にする観点でも Plan モードを実行推奨

（余談）settings.json で起動時のデフォルトを Plan モードにできる

```json
{
    "permissions": {
        "defaltMode": "plan" // "acceptEdits" | "bypassPermissions"
    }
}
```

## 3: CLAUDE.md のメンテナンス

Claude Code 起動時に読み込まれるドキュメント
Claude Code の守って欲しいルールを記載する（強制力はないので注意）

ポイント:

- プロジェクトの構造・機能を記載
- 定期的に更新する（`/init`でも可能）
- `#`で適宜新規の指示を追加

CLAUDE.mdは定期的にメンテナンスすることを推奨。

## 4: `/clear`によるコンテキストの浄化

Claude Code が期待通りの動作をするためには、**コンテキストウィンドウ**（作業メモリ）をいかに大事にするかが重要。
コンテキストウィンドウ = 200K

意識すること:

- 余計なコンテキストは入れない
- 具体的な指示で余計なファイルを読ませない
- 関係のないタスクは別のセッションで行う

タスクが終了したら、定期的な`/clear`をしてコンテキストウィンドウをクリーンにする

（個人的には`/compact`をあまり信用していない。必要ならドキュメントに起こしてもらう方がいい）

## 5: `Think`の拡張

Claude Code には思考トークン予算（Thinking Token Budget）が存在する

| Language | 31999 tokens              | 10,000 tokens          | 4000 tokens   |
| :------- | :----------------------- | :-------------------- | :----- |
| English  | **ultrathink**, think harder | **megathink**, think hard | **think**  |
| 日本語   | 深く考えて               | よく考えて            | 考えて |

環境変数`MAX_THINKING_TOKENS`の変更可能。
常に`ultrathink`したい場合 -> 31999

settings.json (settings.local.json):

```json
{
    "env": {
        "MAX_THINKING_TOKENS": "31999" // 1024 ~ 200000
    }
}
```

(ref)
<https://docs.anthropic.com/en/docs/claude-code/settings>
<https://zenn.dev/fbbp/articles/7aa9a46518a609>

## 6: `permissions`の設定

`permissions`はsettings.jsonで設定

`allow`と`deny`をそれぞれ設定できる。
`allow`はClaude Codeを使用中に逐次追加できるので、`deny`の設定をしておくことを推奨

注意：必ず守ってくれるという過信は厳禁。`rm -fr`はすり抜ける報告もあり。

```json
{
  "permissions": {
    "allow": [
    ],
    "deny": [
      "Bash(sudo:*)",
      "Bash(rm:*)",
      "Bash(rm -rf:*)",
      "Bash(git push:*)",
      "Bash(git commit:*)",
      "Bash(git reset:*)",
      "Bash(git rebase:*)",
      "Read(.env.*)",
      "Read(id_rsa)",
      "Read(id_ed25519)",
      "Read(**/*token*)",
      "Read(**/*key*)",
      "Write(.env*)",
      "Write(**/secrets/**)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(nc:*)",
      "Bash(npm uninstall:*)",
      "Bash(npm remove:*)",
      "Bash(psql:*)",
      "Bash(mysql:*)",
      "Bash(mongod:*)",
      "mcp__supabase__execute_sql"
    ]
  },
}
```
(引用元: <https://zenn.dev/watany/articles/df6f3b0d3af825>)

(ref)
<https://izanami.dev/post/d6f25eec-71aa-4746-8c0d-80c67a1459be>
<https://zenn.dev/watany/articles/df6f3b0d3af825>

## 7: 最新知識・ドキュメントのInput

LLMは最新の知識を持っていないため、追加で知識を与えてあげる必要がある

知識を追加する方法：
1. pdf, mdなどドキュメントを直接与える
2. 最新情報をWebSearchで検索してもらう
3. MCPサーバーを活用する（Context7, Brave-Search）

Context7：代表的なライブラリから最新情報を取得してくれる

導入方法:

```sh
claude mcp add context7 -s project -- npx -y @upstash/context7-mcp
```

-s : スコープ（user, project, local）

(ref)
<https://zenn.dev/karaage0703/articles/3bd2957807f311>

## 8: Task (subagent) の活用

Claude Codeの**Task**はSubagentが実行している

- 軽量
- 並列起動可能
- 親agentで使用可能なツールを使える
- subagentは独自のContext Windowを持つ
- 単独のタスクで動作し完了すると解放される

単発タスクは積極的にSubagentに任せることがおすすめ

![subagents](fig/subagents.png)

## +α: Hooks の活用

7月1日に追加された新機能！
Claude Codeのアクションを検知して、事前に決められた動作を、指定のタイミングで行う機能。

導入のメリット:

- 必ず実行してくれる（=ルールを守らせる）
- コンテキストサイズの縮小
- 拡張性の向上

すぐ導入できる例：

**タスク終了時に音を鳴らしてくれる**

```sh
afplay /System/Library/Sounds/Sosumi.aiff
```

![hooks](fig/hooks.png)

## さらに使いこなすためのキーワードたち

- Slash Command
- カスタム Slash Command
- MCP サーバーの追加: Figma, Playwright, Context7, etc.
- [Git Worktree] (https://docs.anthropic.com/en/docs/claude-code/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)
- `--dengerously-skip-permissions`
- CodeRabbit + `/pr-comments`
- 音声入力（Aqua Voice）
- 著名なエンジニアによるコンテキストの明示（t_wada, Kent Beck, Fowler...）
- [ccusage](https://zenn.dev/ryoppippi/articles/6c9a8fe6629cd6)

## おすすめ資料

- Anthropic - Claude の紹介: https://docs.anthropic.com/ja/docs/welcome
- Anthropic - Claude Code: Best practices for agentic coding: https://www.anthropic.com/engineering/claude-code-best-practices
- spiess.dev - How I Use Claude Code: https://spiess.dev/blog/how-i-use-claude-code
- Claude Code: Best Practices and Pro Tips: https://htdocs.dev/posts/claude-code-best-practices-and-pro-tips/
- ClaudeLog: https://claudelog.com/
- Claude Code を初めて使う人向けの実践ガイド: https://zenn.dev/hokuto_tech/articles/86d1edb33da61a
- Claude Code 逆引きコマンド事典: https://zenn.dev/ml_bear/articles/84e92429698177
- claude_code_deep_dive: https://www.youtube.com/live/HqXg2vfGX3c
- Claude Code にコマンド一発で MCP サーバを簡単設定: https://zenn.dev/karaage0703/articles/3bd2957807f311
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
