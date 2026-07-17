import React from 'react';
import { CheckCircle, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  doneCount: number;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

export default function Header({ totalCount, doneCount, showHelp, setShowHelp }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                AI Background Remover & Resizer
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                  W: 227px × H: 253px (72 DPI)
                </span>
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                सरकारी फॉर्म और आईडी के लिए बैकग्राउंड हटाकर फ़ोटो को परफेक्ट 227×253 पिक्सल में तैयार करें।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <div className="text-right px-1">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">LIMIT / लिमिट</span>
              <span className="text-xs font-bold text-slate-700">
                {totalCount} / 10 Photos
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="text-right px-1">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">STATUS / स्थिति</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                <CheckCircle className="w-3.5 h-3.5" /> {doneCount} Processed
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              showHelp 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{showHelp ? 'Hide Guide / गाइड छुपाएं' : 'Show Guide / गाइड देखें'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
