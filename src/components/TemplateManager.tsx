import { useState } from 'react';
import { Copy, Download, FileText, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ReportTemplate } from '../types/report';

interface TemplateManagerProps {
  templates: ReportTemplate[];
  activeTemplateId: string;
  onUseTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: ReportTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onResetBuiltInTemplates: () => void;
  onCreateBlankTemplate: () => void;
}

export function TemplateManager({
  templates,
  activeTemplateId,
  onUseTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onResetBuiltInTemplates,
  onCreateBlankTemplate,
}: TemplateManagerProps) {
  const [search, setSearch] = useState('');

  const filtered = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(templates, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporwa-templates-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Template Laporan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pilih format standar yang tersedia, duplikasi untuk unit lain, atau buat template baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Ekspor JSON
          </button>
          <button
            type="button"
            onClick={onResetBuiltInTemplates}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Pulihkan Bawaan
          </button>
          <button
            type="button"
            onClick={onCreateBlankTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Buat Template Baru
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari template berdasarkan nama atau kategori..."
            aria-label="Cari template laporan"
            className="w-full max-w-md px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-900">
              Tidak ada template yang cocok dengan pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Tampilkan semua template
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((tpl) => {
              const isCurrent = tpl.id === activeTemplateId;
              const totalItems = tpl.data.sections.reduce(
                (acc, s) => acc + s.items.length,
                0
              );

              return (
                <div
                  key={tpl.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-semibold text-slate-900">
                        {tpl.name}
                      </h2>
                      {isCurrent && (
                        <span className="text-xs font-semibold text-emerald-700">
                          · Sedang Digunakan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{tpl.description}</p>
                    <div className="text-xs text-slate-500 tabular-nums pt-0.5">
                      {tpl.category} · {tpl.data.sections.length} bagian ·{' '}
                      {totalItems} item · {tpl.isBuiltIn ? 'Template Bawaan' : 'Template Kustom'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUseTemplate(tpl.id)}
                      className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {isCurrent ? 'Buka di Formulir' : 'Gunakan Template'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateTemplate(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      Duplikasi
                    </button>
                    {!tpl.isBuiltIn && (
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        aria-label={`Hapus template ${tpl.name}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
