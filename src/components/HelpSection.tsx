import React from 'react';
import { HelpCircle, RefreshCw, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function HelpSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-7xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800 font-sans">
          How to Use & Tips / उपयोग करने का तरीका और सुझाव
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
            <h3 className="font-semibold text-slate-700 text-sm">Upload Photos / अपलोड करें</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            अपलोड एरिया में क्लिक करें या अपनी फाइलों को ड्रैग करके छोड़ें। आप एक बार में 1 से लेकर अधिकतम 10 फोटो अपलोड कर सकते हैं।
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
            <h3 className="font-semibold text-slate-700 text-sm">Auto BG Removal / आटोमेटिक बैकग्राउंड</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            अपलोड होते ही AI आटोमेटिक फोटो का बैकग्राउंड हटा देगा। प्रोग्रेस बार में आपको लाइव स्टेटस दिखाई देगा।
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</span>
            <h3 className="font-semibold text-slate-700 text-sm">Adjust & Erase / एडजस्ट व इरेज़र</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>"Adjust & Edit"</strong> बटन पर क्लिक करके आप फोटो को 227×253 के फ्रेम में ज़ूम, घुमा या खिसका सकते हैं। अगर AI से कोई हिस्सा छूट गया है तो इरेज़र ब्रश से उसे साफ़ करें!
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">4</span>
            <h3 className="font-semibold text-slate-700 text-sm">Save as PNG / पीएनजी में सेव करें</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            आप फोटो का नाम बदल सकते हैं। उसके बाद प्रत्येक फोटो को अलग से या <strong>"Download All as ZIP"</strong> बटन दबाकर सभी फोटो को एक साथ जिप फाइल में डाउनलोड कर सकते हैं।
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Technical Details / तकनीकी विवरण:</h4>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li><strong>Width (चौड़ाई):</strong> 227 Pixels</li>
            <li><strong>Height (ऊंचाई):</strong> 253 Pixels</li>
            <li><strong>Format (फॉर्मेट):</strong> PNG with transparent background (or solid color background)</li>
            <li><strong>Resolution (रेजोल्यूशन):</strong> 72 DPI (Standard Web / Form Resolution)</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Privacy & Speed / सुरक्षा और गति:</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            यह ऐप पूरी तरह से आपके ब्राउज़र में काम करता है। आपकी तस्वीरें किसी सर्वर पर अपलोड नहीं होती हैं, जिससे आपकी प्राइवेसी 100% सुरक्षित रहती है और प्रोसेसिंग सुपर-फास्ट होती है!
          </p>
        </div>
      </div>
    </section>
  );
}
