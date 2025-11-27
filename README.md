# AI Banner Resizer

**AI Banner Resizer** は、Google Gemini API (Gemini 3 Pro Image) を活用して、1枚の画像から複数のアスペクト比（YouTube, Instagram, TikTokなど）に最適化されたバナー画像を自動生成するWebアプリケーションです。

アップロードされた画像のコンテンツ（人物や雰囲気）を維持しつつ、AIが背景の拡張やレイアウトの調整を行い、指定されたサイズにリサイズします。

![App Screenshot](https://placehold.co/1200x675/1a1a1a/2eb6aa?text=AI+Banner+Resizer+Preview)

## ✨ 特徴

*   **マルチサイズ一括生成**: 16:9, 4:3, 1:1, 9:16, 21:9 など、主要なSNS・Web用サイズを一度に生成。
*   **Gemini 3 Pro Image 採用**: 最新の画像生成モデルを使用し、高品質なリサイズ・Outpaintingを実現。
*   **直感的なUI**: ドラッグ＆ドロップで画像をアップロードし、チェックボックスでサイズを選ぶだけの簡単操作。
*   **モダンなデザイン**: 黒とターコイズブルーを基調とした、集中しやすいダークモードUI。

## 🛠️ 前提条件

このプロジェクトを実行するには、以下が必要です。

*   **Node.js**: v18.0.0 以上推奨
*   **Google Gemini API Key**:
    *   Google AI Studio ( https://aistudio.google.com/ ) でAPIキーを取得してください。
    *   **注意**: 使用するモデル `gemini-3-pro-image-preview` はプレビュー版です。利用可能なアカウントまたはプロジェクトである必要があります。

## 🚀 インストールと起動方法

1.  **リポジトリをクローンします**
    ```bash
    git clone https://github.com/maruchacro/banner-resizer.git
    cd banner-resizer
    ```

2.  **依存パッケージをインストールします**
    ```bash
    npm install
    ```

3.  **開発サーバーを起動します**
    ```bash
    npm run dev
    ```

4.  **ブラウザでアクセスします**
    *   通常は `http://localhost:5173` で起動します。
    *   画面左下の「Gemini API Key」入力欄に、取得したAPIキーを入力してください。

## 📖 使い方

1.  **APIキーの設定**: サイドバー下部の入力欄にAPIキーを入力します。
2.  **画像のアップロード**: 中央のエリアに画像をドラッグ＆ドロップするか、クリックしてファイルを選択します（PNG/JPG）。
3.  **プロンプトの調整**: 必要に応じて、上部のテキストエリアでAIへの指示を調整します（デフォルトのままでも動作します）。
4.  **サイズの選択**: 生成したいアスペクト比にチェックを入れます。
5.  **生成開始**: 「一括生成する」ボタンをクリックします。
    *   *Note*: APIのレート制限（429エラー）を回避するため、画像は1枚ずつ順番に生成されます（各5秒程度の間隔があります）。
6.  **保存**: 生成された画像にカーソルを合わせ、「保存する」ボタン（または右クリック）で画像を保存します。

## ⚠️ 注意事項

*   **API利用枠 (Quota)**: `gemini-3-pro-image-preview` モデルは利用制限が厳しい場合があります。連続して大量に生成すると `429 Too Many Requests` エラーが発生することがあります。その場合は時間を置いて再試行してください。
*   **生成精度**: AIによる生成のため、文字やロゴが崩れたり、意図しない要素が追加される場合があります。プロンプトで「文字を変えないで」等と指示することで改善する場合がありますが、完璧ではありません。

## 💻 技術スタック

*   [React](https://react.dev/) (Vite)
*   [Tailwind CSS](https://tailwindcss.com/) (v4)
*   [Lucide React](https://lucide.dev/) (Icons)
*   [Google Generative AI SDK / API](https://ai.google.dev/)

## 📄 ライセンス

[MIT License](LICENSE)
