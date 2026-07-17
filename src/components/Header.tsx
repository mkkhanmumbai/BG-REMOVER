import React from 'react';
import { Image, CheckCircle, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  doneCount: number;
}

export default function Header({ totalCount, doneCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 py-5 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-sm shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                AI Background Remover & Resizer
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                  W: 227px × H: 253px (72 DPI)
                </span>
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                आटोमेटिक बैकग्राउंड हटाएं और सरकारी फॉर्म/आईडी के लिए फ़ोटो को परफेक्ट 227×253 पिक्सल में क्रॉप व एडजस्ट करें।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 self-start md:self-center">
          <div className="text-right px-1">
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">UPLOAD LIMIT / लिमिट</span>
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
      </div>

      <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl flex gap-2 items-start text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">10 Photos Limit:</strong> आप एक बार में 1 से लेकर अधिकतम 10 फोटो अपलोड करके बैकग्राउंड हटा सकते हैं।
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl flex gap-2 items-start text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Exact Dimensions:</strong> हर फोटो का आउटपुट साइज बिल्कुल <strong>227×253 पिक्सल (72 DPI)</strong> रहेगा।
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl flex gap-2 items-start text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Adjust & Manual Edit:</strong> साइज बनने के बाद आप फोटो को ज़ूम, रोटेट, पेन या ब्रश से खुद भी बैकग्राउंड साफ़ कर सकते हैं!
          </div>
        </div>
      </div>
    </header>
  );
}
