import React from 'react';

export function Layout({ children }) {
    return (
        <div className="flex h-screen w-full bg-background text-white overflow-hidden font-sans">
            {children}
        </div>
    );
}
