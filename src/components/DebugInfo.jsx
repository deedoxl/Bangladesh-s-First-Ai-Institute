import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const DebugInfo = () => {
    const { heroContent, loadingContent, heroImages } = useData();
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 border border-green-500/50 p-4 rounded-lg shadow-2xl max-w-sm text-xs font-mono text-green-400">
            <div className="flex justify-between items-center mb-2 border-b border-green-500/30 pb-1">
                <span className="font-bold">🖥️ SYSTEM DIAGNOSTICS</span>
                <button onClick={() => setVisible(false)} className="text-red-500 hover:text-red-400 font-bold px-2">X</button>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-white/70">Connect Status:</span>
                    <span className={loadingContent ? "text-yellow-400" : "text-green-500"}>{loadingContent ? "CONNECTING..." : "ONLINE"}</span>
                </div>

                <div className="border-t border-white/10 my-1 pt-1">
                    <div className="text-white/70 mb-1">Live Database Data:</div>
                    <div className="pl-2 border-l-2 border-green-500/30">
                        <div>Title: <span className="text-white">{heroContent?.titlePrefix || 'N/A'}</span></div>
                        <div>Subtitle: <span className="text-white">{heroContent?.subtitle?.substring(0, 15)}...</span></div>
                        <div>Images Count: <span className="text-white">{heroImages?.items?.length || 0}</span></div>
                    </div>
                </div>

                <div className="mt-2 text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 px-2 py-1 rounded text-[10px] w-full mb-1"
                    >
                        🔄 HARD RELOAD PAGE
                    </button>
                    <div className="text-[9px] text-white/30 text-left overflow-hidden h-8">
                        RAW: {JSON.stringify(heroContent).substring(0, 50)}
                    </div>
                </div>

                <div className="mt-2 text-[10px] text-white/50 italic">
                    If this matches Admin but not screen,<br />
                    refresh page or clear cache.
                </div>
            </div>
        </div>
    );
};

export default DebugInfo;
