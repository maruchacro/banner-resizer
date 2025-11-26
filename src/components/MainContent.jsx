import React from 'react';
import { ImageCard } from './ImageCard';

export function MainContent({ generatedImages }) {
    return (
        <main className="flex-1 h-screen overflow-y-auto bg-background p-8">
            {generatedImages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    </div>
                    <p>画像をアップロードして生成を開始してください</p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 mx-auto max-w-7xl pb-20">
                    {generatedImages.map((image) => (
                        <div key={image.id} className="break-inside-avoid">
                            <ImageCard image={image} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
