import { useState } from 'react';
import { Check, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import {
  buildWhatsAppUrl,
  parseWhatsAppBoldLine,
} from '../utils/whatsappFormatter';

interface WhatsAppPreviewProps {
  senderAlias: string;
  generatedText: string;
  customTextOverride: string | null;
  onChangeCustomText: (val: string | null) => void;
  onRecordAction: (actionType: 'send' | 'copy', finalMessage: string) => void;
}

export function WhatsAppPreview({
  senderAlias,
  generatedText,
  customTextOverride,
  onChangeCustomText,
  onRecordAction,
}: WhatsAppPreviewProps) {
  const [viewMode, setViewMode] = useState<'bubble' | 'raw'>('bubble');
  const [copied, setCopied] = useState(false);

  const finalMessage = customTextOverride ?? generatedText;
  const whatsappUrl = buildWhatsAppUrl('', finalMessage);

  const now = new Date();
  const timeStamp = `${String(now.getHours()).padStart(2, '0')}.${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const lines = finalMessage.split('\n');

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    }
  }

  async function handleCopy() {
    await copyToClipboard(finalMessage);
    setCopied(true);
    onRecordAction('copy', finalMessage);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Top Preview Controls */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Pratinjau Pesan WhatsApp
          </h2>
          <p className="text-xs text-slate-500 tabular-nums mt-0.5">
            {lines.length} baris · {finalMessage.length} karakter
            {customTextOverride !== null && ' · Diedit manual'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('bubble')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'bubble'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilan WA
          </button>
          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teks Mentah
          </button>
        </div>
      </div>

      {/* Message Body */}
      {viewMode === 'bubble' ? (
        <div
          className="p-4 sm:p-5 bg-[#0B141A] max-h-[540px] overflow-y-auto"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="bg-[#1F2C34] text-[#E9EDEF] rounded-xl rounded-tl-xs px-4 py-3 shadow-sm max-w-full">
            {senderAlias.trim() && (
              <div className="text-[13px] font-semibold text-[#25D366] mb-1.5 tracking-wide">
                {senderAlias.trim()}
              </div>
            )}
            <div className="text-[13.5px] leading-[1.45] whitespace-pre-wrap break-words font-sans">
              {lines.map((line, lineIdx) => {
                const segments = parseWhatsAppBoldLine(line);
                return (
                  <div key={lineIdx} className="min-h-[1.25em]">
                    {segments.map((seg, segIdx) =>
                      seg.bold ? (
                        <strong key={segIdx} className="font-semibold text-white">
                          {seg.text}
                        </strong>
                      ) : (
                        <span key={segIdx}>{seg.text}</span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="text-[11px] text-[#8696A0] tabular-nums">
                {timeStamp}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50">
          {customTextOverride !== null && (
            <div className="mb-2.5 flex items-center justify-between gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span>Teks sedang dalam mode sunting manual.</span>
              <button
                type="button"
                onClick={() => onChangeCustomText(null)}
                className="inline-flex items-center gap-1 font-medium text-amber-900 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Sinkronkan ulang
              </button>
            </div>
          )}
          <textarea
            value={finalMessage}
            onChange={(e) => onChangeCustomText(e.target.value)}
            rows={18}
            aria-label="Editor teks mentah laporan WhatsApp"
            className="w-full font-mono text-xs leading-relaxed text-slate-800 bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-y"
          />
        </div>
      )}

      {/* Direct WhatsApp Send & Copy Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordAction('send', finalMessage)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700"
          >
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            Kirim via WhatsApp
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span className="text-emerald-700">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
