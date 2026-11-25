import { Send } from 'lucide-react';
import { ActiveTab } from '../types/report';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onPrimarySendClick: () => void;
  historyCount: number;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'form', label: 'Formulir' },
  { id: 'templates', label: 'Template' },
  { id: 'contacts', label: 'Kontak & Grup' },
  { id: 'history', label: 'Riwayat' },
];

export function Header({
  activeTab,
  onSelectTab,
  onPrimarySendClick,
  historyCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('form')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
        >
          LaporWA
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navigasi utama"
          className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const labelText =
              item.id === 'history' && historyCount > 0
                ? `${item.label} (${historyCount})`
                : item.label;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {labelText}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-emerald-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimarySendClick}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Kirim WhatsApp</span>
            <span className="sm:hidden">Kirim</span>
          </button>
        </div>
      </div>
    </header>
  );
}
