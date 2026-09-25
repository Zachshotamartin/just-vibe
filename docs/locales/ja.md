# just-vibe の使い方

just-vibe は、コーディングエージェント向けのワークフローと実行ツールを提供します。Node.js 22 以降をインストールしてください。プロジェクト内で、利用するホストを選びます。

```sh
npx just-vibe@latest setup --target codex
npx just-vibe@latest setup --target claude
```

プロジェクト用のスキルアダプターを追加する場合:

```sh
npx just-vibe@latest setup --target cursor --root . --profile core
```

必要な結果と制約を伝えてください。コマンドに続けて入力した文脈は保持されます。ワークフローの自動提案は英語で書かれたタスクの説明を認識します。他の言語で依頼する場合は、`auto` ワークフローまたは特定のワークフローを直接選んでください。インストールだけでは、外部サービスへの認証、権限の付与、ワーカーの起動は行われません。サービスが必要な場合は、ホストで利用できるツールを確認してください。

インストールの確認には `npx just-vibe@latest doctor --target codex`、更新には `npx just-vibe@latest update --target codex` を使います。ソースコード上で Unreleased と記載された機能は、別途公開されるまでレジストリでは利用できません。

詳しい英語の説明は、[インストール](../../README.md)と[実行ツール](../../plugins/just-vibe/references/runtime-expansion.md)を参照してください。この翻訳は使い始めるためのページのみを対象とし、カタログ全体の翻訳ではありません。
