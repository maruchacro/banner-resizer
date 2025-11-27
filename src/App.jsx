import React, { useState, useEffect, useCallback } from 'react';
import { Upload, SlidersHorizontal, Image, Loader2, Save, Download, X } from 'lucide-react';

// グローバル変数からAPIキーを取得
// __initial_api_key が定義されていない場合は空文字列を使用
const API_KEY = typeof __initial_api_key !== 'undefined' ? __initial_api_key : '';

// -----------------------------------------------------------
// 1. API Call Logic (Nano Banana Pro Mock/Implementation)
// -----------------------------------------------------------
// -----------------------------------------------------------
// 1. API Call Logic (Gemini API via fetch)
// -----------------------------------------------------------
// -----------------------------------------------------------
// 1. API Call Logic (Gemini 3 Pro Image via fetch)
// -----------------------------------------------------------
const generateImages = async (uploadedImage, selectedRatios, apiKey, prompt) => {
  // Available model from user list: models/gemini-3-pro-image-preview
  const MODEL = "gemini-3-pro-image-preview";
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  if (!apiKey) {
    throw new Error("APIキーが設定されていません。");
  }
  if (!uploadedImage) {
    throw new Error("画像をアップロードしてください。");
  }

  // Parse Data URL to get MIME type and Base64 data
  const [header, base64Data] = uploadedImage.split(',');
  const mimeType = header.match(/:(.*?);/)[1];

  // Process requests sequentially
  const results = [];
  for (const ratio of selectedRatios) {
    try {
      // Construct the request body for Gemini 3 Pro Image
      const body = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          imageConfig: {
            aspectRatio: ratio,
            imageSize: "2K" // Options: "1K", "2K", "4K"
          }
        }
      };

      console.log(`Calling Gemini API (${MODEL}) for ${ratio}...`);
      console.log("Using Prompt:", prompt); // Log the prompt for verification

      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Details:", errorText);

        if (response.status === 404) {
          console.log("Model not found. Attempting to list available models...");
          try {
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
              headers: {
                "x-goog-api-key": apiKey
              }
            });
            const listData = await listResp.json();
            console.log("=== AVAILABLE MODELS ===", listData);
            throw new Error(`モデルが見つかりません。コンソールに利用可能なモデル一覧を出力しました。`);
          } catch (listErr) {
            console.error("Failed to list models:", listErr);
          }
        }

        if (response.status === 429) {
          throw new Error(`レート制限(429)を超過しました。しばらく待ってから再試行してください。`);
        }

        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Extract image from response
      const generatedPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

      if (!generatedPart || !generatedPart.inlineData) {
        // Fallback check for text if image generation failed silently or returned text
        const textPart = data.candidates?.[0]?.content?.parts?.find(p => p.text);
        if (textPart) {
          console.warn("Model returned text instead of image:", textPart.text);
          throw new Error("画像ではなくテキストが生成されました: " + textPart.text.substring(0, 50) + "...");
        }
        throw new Error("No image generated in response");
      }

      const generatedBase64 = generatedPart.inlineData.data;
      const generatedMimeType = generatedPart.inlineData.mimeType || "image/png";
      const generatedUrl = `data:${generatedMimeType};base64,${generatedBase64}`;

      results.push({
        id: Math.random().toString(36).substr(2, 9),
        url: generatedUrl,
        ratio: ratio,
      });

      // Add a significant delay between requests to avoid 429
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`Failed to generate for ${ratio}:`, error);
      results.push({
        id: Math.random().toString(36).substr(2, 9),
        url: uploadedImage,
        ratio: ratio,
        error: true,
        errorMessage: error.message
      });
    }
  }

  return results;
};

// -----------------------------------------------------------
// 2. Components
// -----------------------------------------------------------

const RatioCheckboxes = ({ selectedRatios, toggleRatio }) => {
  const ratios = [
    { ratio: '16:9', label: '横長 (16:9) - YouTubeなど' },
    { ratio: '4:3', label: '標準 (4:3) - プレゼンなど' },
    { ratio: '1:1', label: '正方形 (1:1) - Instagramなど' },
    { ratio: '9:16', label: '縦長 (9:16) - TikTok/Reels' },
    { ratio: '3:4', label: '縦長 (3:4) - スマホ閲覧' },
    { ratio: '21:9', label: 'ウルトラワイド (21:9)' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">サイズ展開（複数選択可）</label>
      <div className="space-y-2">
        {ratios.map(({ ratio, label }) => (
          <div key={ratio} className="flex items-center">
            <input
              id={`ratio-${ratio}`}
              type="checkbox"
              checked={selectedRatios.includes(ratio)}
              onChange={() => toggleRatio(ratio)}
              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor={`ratio-${ratio}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({
  prompt, setPrompt, uploadedImage, handleImageUpload,
  selectedRatios, toggleRatio, onGenerate, isGenerating, generatedImages,
  apiKey, setApiKey
}) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isDownloadable = generatedImages.length > 0 && generatedImages.every(img => !img.error);

  return (
    <div className="flex flex-col w-full h-full p-6 space-y-6 overflow-y-auto bg-gray-900 md:w-80 lg:w-96">

      {/* Header */}
      <div className="flex items-center space-x-2 text-2xl font-bold text-white">
        <SlidersHorizontal className="w-6 h-6 text-primary" />
        <span>BANNER RESIZE APP</span>
      </div>

      {/* Prompt Area */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-semibold text-gray-300">プロンプト（編集指示）</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="4"
          className="w-full p-3 text-sm text-gray-100 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="コンテンツの調整方法などを入力..."
        ></textarea>
      </div>

      {/* Original Image Preview */}
      {uploadedImage && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">元画像 (プレビュー)</label>
          <div className="relative p-2 border border-gray-700 rounded-lg">
            <img
              src={uploadedImage}
              alt="Uploaded Original"
              className="object-contain w-full max-h-40 rounded"
            />
            <button
              onClick={() => handleImageUpload(null)}
              className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-80 transition"
              title="画像を削除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="flex flex-col items-center justify-center p-6 space-y-3 transition duration-200 border-2 border-dashed rounded-lg cursor-pointer border-gray-600/70 hover:border-primary"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Upload className="w-6 h-6 text-primary" />
        <p className="text-sm font-medium text-gray-400">ファイルをアップロード またはドラッグ＆ドロップ</p>
        <p className="text-xs text-gray-500">PNG, JPG (最大10MB)</p>
        <input
          id="file-upload"
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
      </div>

      {/* Size Selection */}
      <RatioCheckboxes selectedRatios={selectedRatios} toggleRatio={toggleRatio} />

      {/* API Key Input */}
      <div className="space-y-2">
        <label htmlFor="api-key" className="text-sm font-semibold text-gray-300">Gemini API Key</label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-3 text-sm text-gray-100 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="AI Studioキーを入力"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !uploadedImage || selectedRatios.length === 0 || !apiKey}
        className={`flex items-center justify-center w-full px-4 py-3 font-bold rounded-lg shadow-lg transition duration-300 
          ${isGenerating || !uploadedImage || selectedRatios.length === 0 || !apiKey
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80'
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <span>一括生成する</span>
        )}
      </button>

      {!apiKey && (
        <p className="p-2 text-xs text-center text-red-400 bg-red-900 rounded-md">
          APIキーが未設定のため、生成できません。
        </p>
      )}

      {/* Download Link */}
      <div className="flex-grow"></div>
      <button
        onClick={() => alert("ダウンロード機能は実装されていません。各画像を右クリックで保存してください。")}
        disabled={!isDownloadable}
        className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg transition duration-200 
          ${isDownloadable
            ? 'text-primary border border-primary hover:bg-primary/20'
            : 'text-gray-600 border border-gray-700 cursor-not-allowed'
          }`}
      >
        <Download className="w-4 h-4 mr-2" />
        結果をダウンロード
      </button>

    </div>
  );
};

const ImageCard = ({ image, uploadedImage }) => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isPlaceholderLoaded, setIsPlaceholderLoaded] = useState(false);

  // 画像のロードが成功したかをチェック
  useEffect(() => {
    if (image.url && image.url !== uploadedImage) {
      const img = new window.Image();
      img.onload = () => setIsPlaceholderLoaded(true);
      img.onerror = () => setIsPlaceholderLoaded(false);
      img.src = image.url;
    } else if (image.url === uploadedImage) {
      // 元画像の場合はロード成功とみなす
      setIsPlaceholderLoaded(true);
    }
  }, [image.url, uploadedImage]);

  return (
    <div className="relative overflow-hidden bg-gray-900 rounded-xl shadow-2xl transition duration-300 hover:shadow-primary/30">

      {/* Aspect Ratio Tag */}
      <span className={`absolute top-0 left-0 px-3 py-1 text-xs font-bold text-white rounded-br-lg 
        ${image.error ? 'bg-red-600' : 'bg-primary'}`}
      >
        {image.ratio}
      </span>

      <div className="flex items-center justify-center p-2"
        style={{ aspectRatio: image.ratio.replace(':', '/') }}
      >
        {image.error ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-red-900/50">
            <X className="w-8 h-8 text-red-400" />
            <p className="mt-2 text-sm font-bold text-red-400">生成失敗</p>
            <button
              onClick={() => setIsErrorModalOpen(true)}
              className="mt-1 text-xs text-red-300 underline"
            >
              詳細を表示
            </button>
            {isErrorModalOpen && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 p-4">
                <div className="bg-gray-800 p-6 rounded-lg max-w-sm">
                  <h3 className="text-lg font-bold text-red-400 mb-3">エラー詳細</h3>
                  <p className="text-sm text-gray-200 break-words">{image.errorMessage || "不明なエラーが発生しました。"}</p>
                  <button
                    onClick={() => setIsErrorModalOpen(false)}
                    className="mt-4 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={image.url}
            alt={`Generated banner for ${image.ratio}`}
            className={`object-cover w-full h-full transition duration-500 ease-in-out ${isPlaceholderLoaded ? 'opacity-100' : 'opacity-0'}`}
            // プレースホルダーとしてローディング中に表示する画像
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400/374151/FFFFFF?text=Image+Load+Error";
              setIsPlaceholderLoaded(true);
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between p-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">p:ineal (モック)</p>
        <button className="flex items-center px-3 py-1 text-xs font-semibold text-gray-100 transition duration-150 bg-gray-700 rounded-md hover:bg-gray-600">
          <Save className="w-3 h-3 mr-1" />
          保存する
        </button>
      </div>
    </div>
  );
};

const MainContent = ({ generatedImages, isGenerating }) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto bg-black md:p-8">
      {generatedImages.length === 0 && !isGenerating ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <Image className="w-12 h-12 mb-4" />
          <p className="text-lg">左のパネルから画像とサイズを選び、生成を開始してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {generatedImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      )}

      {/* Loading Indicator for ongoing generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-lg font-semibold text-white">画像を生成中...</p>
          <p className="mt-2 text-sm text-gray-300">Nano Banana Pro APIを呼び出しています</p>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------
// 3. Main App Component
// -----------------------------------------------------------

const App = () => {
  const [prompt, setPrompt] = useState('コンテンツは絶対に変えないでください。人物・物や色味もそのまま。レイアウトはいい感じに調整して配置してください。');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedRatios, setSelectedRatios] = useState(['16:9', '4:3', '1:1', '9:16']); // 初期選択
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const [apiKey, setApiKey] = useState(API_KEY);

  // APIキーが定義されているかどうかのチェック
  const hasApiKey = !!apiKey;

  const handleImageUpload = (file) => {
    if (!file) {
      setUploadedImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file); // Data URLとして読み込む
  };

  const toggleRatio = (ratio) => {
    setSelectedRatios((prev) =>
      prev.includes(ratio)
        ? prev.filter((r) => r !== ratio)
        : [...prev, ratio]
    );
  };

  const handleGenerate = async () => {
    if (!uploadedImage || selectedRatios.length === 0) return;
    if (!hasApiKey) {
      alert("APIキーが設定されていません。サイドバーでAPIキーを入力してください。");
      return;
    }

    setIsGenerating(true);
    // 既存の結果をクリアしないことで、新しい生成を追記していくことも可能だが、
    // 今回は一括生成ツールとして毎回クリア
    setGeneratedImages([]);

    try {
      // generateImages 関数に apiKey を渡す
      const images = await generateImages(uploadedImage, selectedRatios, apiKey, prompt);

      // 成功した画像とエラー画像をまとめてセット
      setGeneratedImages(images);

      const failed = images.filter(img => img.error);
      if (failed.length > 0) {
        console.warn("Some images failed to generate", failed);
        // APIエラーの場合は、APIキーとエンドポイントの設定を確認するよう促す
      }

    } catch (error) {
      console.error("Generation failed", error);
      alert(`致命的なエラーが発生しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-inter">
      <Sidebar
        prompt={prompt}
        setPrompt={setPrompt}
        uploadedImage={uploadedImage}
        handleImageUpload={handleImageUpload}
        selectedRatios={selectedRatios}
        toggleRatio={toggleRatio}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        apiKey={apiKey}
        setApiKey={setApiKey}
        generatedImages={generatedImages}
      />
      <MainContent generatedImages={generatedImages} isGenerating={isGenerating} />
    </div>
  );
};

export default App;