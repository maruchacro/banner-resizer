import React from 'react';
import { Layers, Upload, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const ASPECT_RATIOS = [
    { id: '16:9', label: '横長 (16:9) - YouTubeなど', value: '16:9' },
    { id: '4:3', label: '標準 (4:3) - プレゼンなど', value: '4:3' },
    { id: '1:1', label: '正方形 (1:1) - Instagramなど', value: '1:1' },
    { id: '9:16', label: '縦長 (9:16) - TikTok/Reels', value: '9:16' },
    { id: '3:4', label: '縦長 (3:4) - スマホ閲覧', value: '3:4' },
    { id: '21:9', label: 'ウルトラワイド (21:9)', value: '21:9' },
];

export function Sidebar({
    prompt,
    setPrompt,
    uploadedImage,
    handleImageUpload,
    selectedRatios,
    toggleRatio,
    onGenerate,
    onGenerate,
    isGenerating,
    apiKey,
    setApiKey
}) {
    return (
        <aside className="w-80 bg-sidebar h-screen flex flex-col border-r border-white/10 text-white overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">BANNER RESIZE APP</h1>
                </div>
            </div>

            <div className="p-6 space-y-8 flex-1">
                {/* Prompt Area */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">プロンプト（編集指示）</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-24 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        placeholder="指示を入力してください..."
                    />
                </div>

                {/* Original Image Preview & Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">元画像</label>

                    {uploadedImage ? (
                        <div className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/50">
                            <img src={uploadedImage} alt="Original" className="w-full h-full object-contain" />
                            <button
                                onClick={() => handleImageUpload(null)}
                                className="absolute top-2 right-2 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    ) : null}

                    <div className="relative">
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                            <Upload className="w-6 h-6 text-primary mb-2" />
                            <p className="text-sm font-medium text-primary">ファイルをアップロード</p>
                            <p className="text-xs text-gray-500 mt-1">またはドラッグ＆ドロップ</p>
                            <p className="text-[10px] text-gray-600 mt-2">PNG, JPG (最大10MB)</p>
                        </div>
                    </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">サイズ展開（複数選択可）</label>
                    <div className="space-y-2">
                        {ASPECT_RATIOS.map((ratio) => (
                            <label key={ratio.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                    selectedRatios.includes(ratio.value)
                                        ? "bg-primary border-primary"
                                        : "border-white/20 group-hover:border-white/40 bg-transparent"
                                )}>
                                    {selectedRatios.includes(ratio.value) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedRatios.includes(ratio.value)}
                                    onChange={() => toggleRatio(ratio.value)}
                                />
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{ratio.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Gemini API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="AI Studioで取得したキーを入力"
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 space-y-4 bg-sidebar">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating || !uploadedImage}
                    className={cn(
                        "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                        isGenerating || !uploadedImage
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20"
                    )}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-5 h-5" />
                            一括生成する
                        </>
                    )}
                </button>

                <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                    結果をダウンロード
                </button>
            </div>
        </aside>
    );
}
