import React from 'react';
import { Download } from 'lucide-react';
import { cn } from '../lib/utils';

export function ImageCard({ image }) {
    return (
        <div className="group relative bg-sidebar rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
            {/* Aspect Ratio Tag */}
            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-bold text-white border border-white/10">
                {image.ratio}
            </div>

            {/* Image */}
            <div className="w-full bg-black/50 flex items-center justify-center overflow-hidden">
                <img
                    src={image.url}
                    alt={`Generated ${image.ratio}`}
                    style={{ aspectRatio: image.ratio.replace(':', '/') }}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Overlay / Actions */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pt-12">
                <button className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    保存する
                </button>
            </div>
        </div>
    );
}
