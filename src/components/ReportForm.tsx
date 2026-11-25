import { RefObject, useState } from 'react';
import {
  BookmarkPlus,
  CheckSquare,
  Clock,
  Edit3,
  Plus,
  RotateCcw,
  Save,
  Square,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ReportData,
  ReportItem,
  ReportSection,
  ReportTemplate,
  SendMode,
  TargetContact,
  WhatsAppGroup,
} from '../types/report';
import {
  formatIndonesianDate,
  formatPhoneReadable,
  getIndonesianDayName,
  getLocalIsoDate,
  isValidWhatsAppPhone,
  normalizeGroupInviteUrl,
} from '../utils/whatsappFormatter';

interface ReportFormProps {
  templates: ReportTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  formData: ReportData;
  onChangeFormData: (next: ReportData) => void;
  sendMode: SendMode;
  onChangeSendMode: (mode: SendMode) => void;
  targetPhone: string;
  targetName: string;
  onChangeTargetPhone: (phone: string, name?: string) => void;
  contacts: TargetContact[];
  groups: WhatsAppGroup[];
  selectedGroupIds: string[];
  onToggleSelectGroup: (groupId: string) => void;
  onSelectAllGroups: (selectAll: boolean) => void;
  onQuickSaveContact: (name: string, phone: string) => void;
  onQuickAddGroup: (name: string, inviteUrl: string) => void;
  onSaveAsNewTemplate: (name: string, category: string) => void;
  onResetFormToTemplate: () => void;
  phoneInputRef: RefObject<HTMLInputElement | null>;
}

export function ReportForm({
  templates,
  activeTemplateId,
  onSelectTemplate,
  formData,
  onChangeFormData,
  sendMode,
  onChangeSendMode,
  targetPhone,
  targetName,
  onChangeTargetPhone,
  contacts,
  groups,
  selectedGroupIds,
  onToggleSelectGroup,
  onSelectAllGroups,
  onQuickSaveContact,
  onQuickAddGroup,
  onSaveAsNewTemplate,
  onResetFormToTemplate,
  phoneInputRef,
}: ReportFormProps) {
  const [editStructure, setEditStructure] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Operasional');
  const [newContactName, setNewContactName] = useState('');
  const [showQuickSaveContact, setShowQuickSaveContact] = useState(false);
  const [showQuickAddGroup, setShowQuickAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupInviteUrl, setNewGroupInviteUrl] = useState('');

  const phoneValid = isValidWhatsAppPhone(targetPhone);
  const phoneAlreadySaved = contacts.some(
    (c) =>
      c.phone &&
      formatPhoneReadable(c.phone) === formatPhoneReadable(targetPhone)
  );

  function updateField<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    onChangeFormData({ ...formData, [key]: value });
  }

  function applyQuickShift(shift: 'malam' | 'pagi') {
    const yesterday = getLocalIsoDate(-1);
    const today = getLocalIsoDate(0);
    if (shift === 'malam') {
      onChangeFormData({
        ...formData,
        greetingText: 'Selamat Pagi',
        startDate: yesterday,
        startTime: '20.00 wib',
        endDate: today,
        endTime: '08.00 wib',
      });
    } else {
      onChangeFormData({
        ...formData,
        greetingText: 'Selamat Malam',
        startDate: today,
        startTime: '08.00 wib',
        endDate: today,
        endTime: '20.00 wib',
      });
    }
  }

  function updateTembusan(index: number, value: string) {
    const next = [...formData.tembusanList];
    next[index] = value;
    updateField('tembusanList', next);
  }

  function addTembusan() {
    const nextNum = formData.tembusanList.length + 1;
    updateField('tembusanList', [...formData.tembusanList, `${nextNum}. `]);
  }

  function removeTembusan(index: number) {
    const next = formData.tembusanList.filter((_, idx) => idx !== index);
    updateField('tembusanList', next);
  }

  function updateSection(sectionId: string, updater: (s: ReportSection) => ReportSection) {
    updateField(
      'sections',
      formData.sections.map((s) => (s.id === sectionId ? updater(s) : s))
    );
  }

  function updateItem(
    sectionId: string,
    itemId: string,
    updater: (item: ReportItem) => ReportItem
  ) {
    updateSection(sectionId, (sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? updater(it) : it)),
    }));
  }

  function setSectionAllValue(sectionId: string, value: string) {
    updateSection(sectionId, (sec) => ({
      ...sec,
      items: sec.items.map((it) => ({ ...it, value })),
    }));
  }

  function addSection() {
    const nextNum = formData.sections.length + 1;
    const newSec: ReportSection = {
      id: `sec-${Date.now()}`,
      title: `${nextNum}. BAGIAN BARU :`,
      boldTitle: true,
      items: [
        {
          id: `item-${Date.now()}`,
          prefix: 'a.',
          boldPrefix: true,
          label: 'Item Laporan',
          spacer: ' ',
          value: 'NIHIL',
          quickValues: ['NIHIL', '1 kali', '-'],
        },
      ],
    };
    updateField('sections', [...formData.sections, newSec]);
  }

  function removeSection(sectionId: string) {
    updateField(
      'sections',
      formData.sections.filter((s) => s.id !== sectionId)
    );
  }

  function addItem(sectionId: string) {
    const sec = formData.sections.find((s) => s.id === sectionId);
    const nextLetterCode = 97 + (sec ? sec.items.length : 0);
    const letter =
      nextLetterCode <= 122 ? `${String.fromCharCode(nextLetterCode)}.` : '-';

    const newItem: ReportItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prefix: letter,
      boldPrefix: true,
      label: 'Item Baru',
      spacer: ' ',
      value: 'NIHIL',
      quickValues: ['NIHIL', '1 kali', '-'],
    };

    updateSection(sectionId, (s) => ({
      ...s,
      items: [...s.items, newItem],
    }));
  }

  function removeItem(sectionId: string, itemId: string) {
    updateSection(sectionId, (s) => ({
      ...s,
      items: s.items.filter((it) => it.id !== itemId),
    }));
  }

  function handleSaveTemplateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    onSaveAsNewTemplate(newTemplateName.trim(), newTemplateCategory.trim() || 'Kustom');
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
  }

  function handleQuickContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newContactName.trim() || !phoneValid) return;
    onQuickSaveContact(newContactName.trim(), targetPhone);
    setNewContactName('');
    setShowQuickSaveContact(false);
  }

  function handleQuickGroupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const validInvite = newGroupInviteUrl.trim()
      ? normalizeGroupInviteUrl(newGroupInviteUrl)
      : '';
    onQuickAddGroup(newGroupName.trim(), validInvite);
    setNewGroupName('');
    setNewGroupInviteUrl('');
    setShowQuickAddGroup(false);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
      {/* 1. Target WhatsApp Number & Template Selector */}
      <section className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Formulir Laporan WhatsApp
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Pilih template, isi data laporan, lalu kirim langsung ke nomor WhatsApp tujuan.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onResetFormToTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Isi
            </button>
            <button
              type="button"
              onClick={() => setShowSaveTemplateModal((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
              Simpan Template
            </button>
          </div>
        </div>

        {showSaveTemplateModal && (
          <form
            onSubmit={handleSaveTemplateSubmit}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
          >
            <div className="text-sm font-semibold text-slate-900">
              Simpan Formulir Ini Sebagai Template Baru
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamtibmas Polsek Banyumanik"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kepolisian / SPKT"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                Simpan Template
              </button>
            </div>
          </form>
        )}

        {/* Template Selector + Send Mode Switch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label
              htmlFor="template-select"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Template Laporan
            </label>
            <select
              id="template-select"
              value={activeTemplateId}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[42px] text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mode Pengiriman Tujuan
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg min-h-[42px]">
              <button
                type="button"
                onClick={() => onChangeSendMode('phone')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  sendMode === 'phone'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nomor Tujuan
              </button>
              <button
                type="button"
                onClick={() => onChangeSendMode('groups')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  sendMode === 'groups'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Multi-Grup WA ({selectedGroupIds.length})
              </button>
            </div>
          </div>
        </div>

        {sendMode === 'phone' ? (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="target-phone-input"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Nomor WhatsApp Tujuan
                </label>
                {targetPhone && phoneValid && (
                  <span className="text-xs font-mono text-emerald-700 tabular-nums">
                    {formatPhoneReadable(targetPhone)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  ref={phoneInputRef}
                  id="target-phone-input"
                  type="tel"
                  inputMode="tel"
                  placeholder="Contoh: 081234567890 atau 62812..."
                  value={targetPhone}
                  onChange={(e) => onChangeTargetPhone(e.target.value, '')}
                  className="flex-1 px-3 py-2.5 min-h-[42px] text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                {phoneValid && !phoneAlreadySaved && (
                  <button
                    type="button"
                    onClick={() => setShowQuickSaveContact((v) => !v)}
                    title="Simpan nomor ini ke Kontak Tujuan"
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    Simpan
                  </button>
                )}
              </div>
            </div>

            {contacts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 mr-1">Kontak cepat:</span>
                {contacts.map((c) => {
                  const hasPhone = isValidWhatsAppPhone(c.phone);
                  const isSelected =
                    hasPhone &&
                    formatPhoneReadable(c.phone) ===
                      formatPhoneReadable(targetPhone);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!hasPhone}
                      onClick={() => onChangeTargetPhone(c.phone, c.name)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        !hasPhone
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-pointer'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {c.name}
                      {!hasPhone && ' (Nomor belum diisi)'}
                    </button>
                  );
                })}
              </div>
            )}

            {showQuickSaveContact && (
              <form
                onSubmit={handleQuickContactSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Kontak / Jabatan Penerima
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ka SPKT Polrestabes Semarang"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickSaveContact(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Simpan Kontak
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Users className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>
                  Pilih Grup WhatsApp Tujuan ({selectedGroupIds.length} dari{' '}
                  {groups.length} dipilih)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onSelectAllGroups(selectedGroupIds.length < groups.length)
                  }
                  className="font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  {selectedGroupIds.length < groups.length
                    ? 'Pilih Semua'
                    : 'Batal Pilih Semua'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickAddGroup((v) => !v)}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Tambah Grup
                </button>
              </div>
            </div>

            {showQuickAddGroup && (
              <form
                onSubmit={handleQuickGroupSubmit}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Grup WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Grup Piket Polrestabes"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tautan Undangan Grup (Opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={newGroupInviteUrl}
                      onChange={(e) => setNewGroupInviteUrl(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddGroup(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                  >
                    Simpan Grup
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groups.map((grp) => {
                const isSelected = selectedGroupIds.includes(grp.id);
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => onToggleSelectGroup(grp.id)}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare
                        className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Square
                        className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {grp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {grp.category}
                        {grp.inviteUrl ? ' · Tautan grup aktif' : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Kepala Surat, Kepada, Tembusan */}
      <section className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            A. Identitas Kesatuan &amp; Tujuan Surat
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kesatuan / Instansi (Baris Paling Atas)
            </label>
            <input
              type="text"
              value={formData.unitName}
              onChange={(e) => updateField('unitName', e.target.value)}
              placeholder="Contoh: POLSEK SEMARANG SELATAN"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Pengirim di Pratinjau
            </label>
            <input
              type="text"
              value={formData.senderAlias}
              onChange={(e) => updateField('senderAlias', e.target.value)}
              placeholder="Contoh: SYAIFUL SEKSEL"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Kepada
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.boldKepada}
                  onChange={(e) => updateField('boldKepada', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                Cetak Tebal (*)
              </label>
            </div>
            <input
              type="text"
              value={formData.kepadaTarget}
              onChange={(e) => updateField('kepadaTarget', e.target.value)}
              placeholder="Yth. Ka SPKT Polrestabes Semarang."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Tembusan
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.boldTembusan}
                  onChange={(e) => updateField('boldTembusan', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                Cetak Tebal (*)
              </label>
            </div>
            <div className="space-y-2">
              {formData.tembusanList.map((temb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={temb}
                    onChange={(e) => updateTembusan(idx, e.target.value)}
                    placeholder={`${idx + 1}. Pejabat Tembusan`}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeTembusan(idx)}
                    aria-label="Hapus tembusan"
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTembusan}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Tambah Tembusan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Waktu Shift & Narasi Pembuka */}
      <section className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            B. Narasi Pembuka &amp; Periode Waktu
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {formData.includePeriodBlock && (
              <>
                <button
                  type="button"
                  onClick={() => applyQuickShift('malam')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  Shift Malam (20.00–08.00)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickShift('pagi')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  Shift Pagi (08.00–20.00)
                </button>
              </>
            )}
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={formData.includePeriodBlock}
                onChange={(e) =>
                  updateField('includePeriodBlock', e.target.checked)
                }
                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              Blok Tanggal/Pukul
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Salam Pembuka
            </label>
            <select
              value={formData.greetingText}
              onChange={(e) => updateField('greetingText', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Selamat Pagi">Selamat Pagi</option>
              <option value="Selamat Siang">Selamat Siang</option>
              <option value="Selamat Sore">Selamat Sore</option>
              <option value="Selamat Malam">Selamat Malam</option>
              <option value="Assalamu'alaikum Wr. Wb.">
                Assalamu&apos;alaikum Wr. Wb.
              </option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kalimat Pengantar Laporan
            </label>
            <input
              type="text"
              value={formData.introNarrative}
              onChange={(e) => updateField('introNarrative', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {formData.includePeriodBlock && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Mulai Tugas / Periode Awal
                </span>
                <span className="text-xs font-mono text-slate-600 tabular-nums">
                  {getIndonesianDayName(formData.startDate)},{' '}
                  {formatIndonesianDate(formData.startDate)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Pukul
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    placeholder="20.00 wib"
                    className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Selesai Tugas / Periode Akhir
                </span>
                <span className="text-xs font-mono text-slate-600 tabular-nums">
                  {getIndonesianDayName(formData.endDate)},{' '}
                  {formatIndonesianDate(formData.endDate)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Pukul
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    placeholder="08.00 wib"
                    className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Ringkasan Kondisi Umum
          </label>
          <input
            type="text"
            value={formData.conditionSummary}
            onChange={(e) => updateField('conditionSummary', e.target.value)}
            placeholder="Keadaan aman dan terkendali..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </section>

      {/* 4. Report Sections & Items */}
      <section className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              C. Rincian Bagian &amp; Data Laporan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol isian cepat (NIHIL / 1 kali / -) atau ketik manual sesuai data shift.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditStructure((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              editStructure
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            {editStructure ? 'Selesai Edit Struktur' : 'Edit Struktur Item'}
          </button>
        </div>

        <div className="space-y-6">
          {formData.sections.map((section) => (
            <div
              key={section.id}
              className="pt-4 border-t border-slate-200 first:pt-0 first:border-t-0 space-y-3"
            >
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {editStructure ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section.id, (s) => ({
                          ...s,
                          title: e.target.value,
                        }))
                      }
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <label className="inline-flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.boldTitle}
                        onChange={(e) =>
                          updateSection(section.id, (s) => ({
                            ...s,
                            boldTitle: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-emerald-700"
                      />
                      Tebal
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Hapus Bagian
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {section.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSectionAllValue(section.id, 'NIHIL')}
                      className="text-xs font-medium text-slate-600 hover:text-emerald-700 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Set semua NIHIL
                    </button>
                  </>
                )}
              </div>

              {/* Section Items */}
              <div className="space-y-2.5">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center"
                  >
                    {editStructure ? (
                      <>
                        <div className="lg:col-span-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item.prefix}
                            onChange={(e) =>
                              updateItem(section.id, item.id, (it) => ({
                                ...it,
                                prefix: e.target.value,
                              }))
                            }
                            placeholder="a."
                            aria-label="Awalan poin"
                            className="w-14 px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md"
                          />
                          <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.boldPrefix}
                              onChange={(e) =>
                                updateItem(section.id, item.id, (it) => ({
                                  ...it,
                                  boldPrefix: e.target.checked,
                                }))
                              }
                            />
                            B
                          </label>
                        </div>
                        <div className="lg:col-span-5">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateItem(section.id, item.id, (it) => ({
                                ...it,
                                label: e.target.value,
                              }))
                            }
                            aria-label="Nama item"
                            className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-md"
                          />
                        </div>
                        <div className="lg:col-span-4">
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) =>
                              updateItem(section.id, item.id, (it) => ({
                                ...it,
                                value: e.target.value,
                              }))
                            }
                            aria-label="Nilai default"
                            className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                          />
                        </div>
                        <div className="lg:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(section.id, item.id)}
                            aria-label="Hapus item"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label
                          htmlFor={`item-input-${item.id}`}
                          className="lg:col-span-5 text-sm text-slate-700 font-medium flex items-baseline gap-1.5"
                        >
                          {item.prefix && (
                            <span className="font-semibold text-slate-900 shrink-0">
                              {item.prefix}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </label>
                        <div className="lg:col-span-7 flex flex-wrap items-center gap-1.5">
                          <input
                            id={`item-input-${item.id}`}
                            type="text"
                            value={item.value}
                            onChange={(e) =>
                              updateItem(section.id, item.id, (it) => ({
                                ...it,
                                value: e.target.value,
                              }))
                            }
                            className={`flex-1 min-w-[140px] px-3 py-2 min-h-[38px] text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                              item.value.trim().toUpperCase() !== 'NIHIL' &&
                              item.value.trim() !== '-' &&
                              item.value.trim() !== ''
                                ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 font-medium'
                                : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                          {item.quickValues && item.quickValues.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {item.quickValues.map((qv) => (
                                <button
                                  key={qv}
                                  type="button"
                                  onClick={() =>
                                    updateItem(section.id, item.id, (it) => ({
                                      ...it,
                                      value: qv,
                                    }))
                                  }
                                  className={`px-2 py-1.5 text-xs rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                    item.value === qv
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                                >
                                  {qv}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {editStructure && (
                  <button
                    type="button"
                    onClick={() => addItem(section.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Tambah Baris Item
                  </button>
                )}
              </div>
            </div>
          ))}

          {editStructure && (
            <button
              type="button"
              onClick={addSection}
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-emerald-600 text-xs font-semibold text-slate-700 hover:text-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Tambah Bagian Laporan Baru
            </button>
          )}
        </div>
      </section>

      {/* 5. Penutup & Penandatangan */}
      <section className="p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          D. Penutup &amp; Penandatangan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kode / Kata Penutup
            </label>
            <input
              type="text"
              value={formData.closingTag}
              onChange={(e) => updateField('closingTag', e.target.value)}
              placeholder="DUMP"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Salam Penutup
            </label>
            <input
              type="text"
              value={formData.signOffGreeting}
              onChange={(e) => updateField('signOffGreeting', e.target.value)}
              placeholder="Hormat Kami"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Jabatan Penandatangan
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.boldSignOffRole}
                  onChange={(e) =>
                    updateField('boldSignOffRole', e.target.checked)
                  }
                  className="rounded border-slate-300 text-emerald-700"
                />
                Cetak Tebal (*)
              </label>
            </div>
            <input
              type="text"
              value={formData.signOffRole}
              onChange={(e) => updateField('signOffRole', e.target.value)}
              placeholder="KA SPKT 1 POLSEK SEMARANG SELATAN"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pangkat &amp; Nama Petugas
            </label>
            <input
              type="text"
              value={formData.signOffName}
              onChange={(e) => updateField('signOffName', e.target.value)}
              placeholder="AIPTU SYAIFUL BAHRI,SH"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
