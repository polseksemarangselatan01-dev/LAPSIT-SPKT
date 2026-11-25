import { useState } from 'react';
import { Check, Copy, ExternalLink, History, RotateCcw, Trash2 } from 'lucide-react';
import { SentHistoryEntry } from '../types/report';
import { buildWhatsAppUrl, formatPhoneReadable } from '../utils/whatsappFormatter';

interface HistoryViewProps {
  entries: SentHistoryEntry[];
  onLoadToForm: (entry: SentHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onGoToForm: () => void;
}

export function HistoryView({
  entries,
  onLoadToForm,
  onDeleteEntry,
  onClearAll,
  onGoToForm,
}: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = entries.filter((entry) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.templateName.toLowerCase().includes(q) ||
      entry.targetName.toLowerCase().includes(q) ||
      entry.targetPhone.toLowerCase().includes(q) ||
      entry.formattedMessage.toLowerCase().includes(q)
    );
  });

  async function handleCopy(entry: SentHistoryEntry) {
    try {
      await navigator.clipboard.writeText(entry.formattedMessage);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Laporan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Arsip laporan yang pernah dikirim atau disalin. Anda dapat memuat ulang laporan lama sebagai dasar shift berikutnya.
          </p>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Bersihkan Riwayat
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {entries.length > 0 && (
          <div className="p-4 border-b border-slate-200">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari isi laporan, tujuan, atau nama template..."
              aria-label="Cari riwayat laporan"
              className="w-full max-w-md px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        )}

        {entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900">
              Belum ada riwayat pengiriman laporan.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Setiap laporan yang Anda kirim melalui WhatsApp atau salin dari formulir akan otomatis tersimpan di perangkat ini.
            </p>
            <button
              type="button"
              onClick={onGoToForm}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              Buat Laporan Pertama
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-medium text-slate-900">
              Tidak ditemukan riwayat yang sesuai kata kunci.
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Reset pencarian
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((entry) => (
              <div key={entry.id} className="p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {entry.templateName}
                    </h2>
                    <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                      {formatTimestamp(entry.createdAt)} ·{' '}
                      {entry.groupNames && entry.groupNames.length > 0
                        ? `Multi-Grup (${entry.groupNames.length}): ${entry.groupNames.join(', ')}`
                        : entry.targetPhone
                        ? `Tujuan: ${
                            entry.targetName ? `${entry.targetName} (` : ''
                          }${formatPhoneReadable(entry.targetPhone)}${
                            entry.targetName ? ')' : ''
                          }`
                        : 'Salin teks / pilih kontak di WA'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLoadToForm(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Muat ke Formulir
                    </button>
                    <a
                      href={buildWhatsAppUrl(
                        entry.targetPhone,
                        entry.formattedMessage
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      Kirim Ulang
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          Salin
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label="Hapus riwayat"
                      className="p-2 min-h-[38px] text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <pre className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {entry.formattedMessage}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
