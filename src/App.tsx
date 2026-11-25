import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ReportForm } from './components/ReportForm';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import { TemplateManager } from './components/TemplateManager';
import { ContactManager } from './components/ContactManager';
import { HistoryView } from './components/HistoryView';
import {
  createDefaultTemplates,
  DEFAULT_CONTACTS,
  DEFAULT_GROUPS,
} from './data/defaultTemplates';
import {
  ActiveTab,
  ReportData,
  ReportTemplate,
  SendMode,
  SentHistoryEntry,
  TargetContact,
  WhatsAppGroup,
} from './types/report';
import {
  generateReportText,
  getLocalIsoDate,
  isValidWhatsAppPhone,
  normalizePhoneNumber,
} from './utils/whatsappFormatter';

const STORAGE_KEYS = {
  templates: 'laporwa_templates_v1',
  activeTemplateId: 'laporwa_active_template_id_v1',
  draft: 'laporwa_draft_v1',
  sendMode: 'laporwa_send_mode_v1',
  targetPhone: 'laporwa_target_phone_v1',
  targetName: 'laporwa_target_name_v1',
  contacts: 'laporwa_contacts_v1',
  groups: 'laporwa_groups_v1',
  selectedGroupIds: 'laporwa_selected_group_ids_v1',
  history: 'laporwa_history_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const defaultTemplates = useMemo(() => createDefaultTemplates(), []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [templates, setTemplates] = useState<ReportTemplate[]>(() =>
    readStorage<ReportTemplate[]>(STORAGE_KEYS.templates, defaultTemplates)
  );
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
    const savedId = readStorage<string>(
      STORAGE_KEYS.activeTemplateId,
      defaultTemplates[0].id
    );
    return savedId || defaultTemplates[0].id;
  });
  const [formData, setFormData] = useState<ReportData>(() => {
    const savedDraft = readStorage<ReportData | null>(STORAGE_KEYS.draft, null);
    if (savedDraft) return savedDraft;
    return structuredClone(defaultTemplates[0].data);
  });
  const [customTextOverride, setCustomTextOverride] = useState<string | null>(
    null
  );
  const [sendMode, setSendMode] = useState<SendMode>(() =>
    readStorage<SendMode>(STORAGE_KEYS.sendMode, 'phone')
  );
  const [targetPhone, setTargetPhone] = useState<string>(() =>
    readStorage<string>(STORAGE_KEYS.targetPhone, '')
  );
  const [targetName, setTargetName] = useState<string>(() =>
    readStorage<string>(STORAGE_KEYS.targetName, '')
  );
  const [contacts, setContacts] = useState<TargetContact[]>(() =>
    readStorage<TargetContact[]>(STORAGE_KEYS.contacts, DEFAULT_CONTACTS)
  );
  const [groups, setGroups] = useState<WhatsAppGroup[]>(() =>
    readStorage<WhatsAppGroup[]>(STORAGE_KEYS.groups, DEFAULT_GROUPS)
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() =>
    readStorage<string[]>(
      STORAGE_KEYS.selectedGroupIds,
      DEFAULT_GROUPS.slice(0, 2).map((g) => g.id)
    )
  );
  const [sentGroupIds, setSentGroupIds] = useState<string[]>([]);
  const [history, setHistory] = useState<SentHistoryEntry[]>(() =>
    readStorage<SentHistoryEntry[]>(STORAGE_KEYS.history, [])
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  // Sync states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
    } catch {
      // ignore storage quota errors
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.activeTemplateId,
        JSON.stringify(activeTemplateId)
      );
    } catch {
      // ignore
    }
  }, [activeTemplateId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.sendMode, JSON.stringify(sendMode));
    } catch {
      // ignore
    }
  }, [sendMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.targetPhone,
        JSON.stringify(targetPhone)
      );
      localStorage.setItem(STORAGE_KEYS.targetName, JSON.stringify(targetName));
    } catch {
      // ignore
    }
  }, [targetPhone, targetName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
    } catch {
      // ignore
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.selectedGroupIds,
        JSON.stringify(selectedGroupIds)
      );
    } catch {
      // ignore
    }
  }, [selectedGroupIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  function showToast(msg: string) {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 2800);
  }

  const generatedText = useMemo(() => generateReportText(formData), [formData]);
  const selectedGroups = useMemo(
    () => groups.filter((g) => selectedGroupIds.includes(g.id)),
    [groups, selectedGroupIds]
  );

  function handleSelectTemplate(templateId: string) {
    const found = templates.find((t) => t.id === templateId);
    if (!found) return;
    setActiveTemplateId(found.id);
    setFormData(structuredClone(found.data));
    setCustomTextOverride(null);
    setSentGroupIds([]);
    setActiveTab('form');
    showToast(`Template "${found.name}" dimuat.`);
  }

  function handleResetFormToTemplate() {
    const found =
      templates.find((t) => t.id === activeTemplateId) || templates[0];
    if (!found) return;
    setFormData(structuredClone(found.data));
    setCustomTextOverride(null);
    setSentGroupIds([]);
    showToast('Isi formulir dikembalikan ke standar template.');
  }

  function handleSaveAsNewTemplate(name: string, category: string) {
    const newTpl: ReportTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name,
      description: `Template kustom dibuat dari formulir (${formData.unitName || 'Umum'}).`,
      category,
      isBuiltIn: false,
      updatedAt: getLocalIsoDate(0),
      data: structuredClone(formData),
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setActiveTemplateId(newTpl.id);
    showToast(`Template "${name}" berhasil disimpan.`);
  }

  function handleDuplicateTemplate(tpl: ReportTemplate) {
    const copy: ReportTemplate = {
      ...structuredClone(tpl),
      id: `tpl-custom-${Date.now()}`,
      name: `${tpl.name} (Salinan)`,
      isBuiltIn: false,
      updatedAt: getLocalIsoDate(0),
    };
    setTemplates((prev) => [copy, ...prev]);
    showToast(`Template "${copy.name}" dibuat.`);
  }

  function handleDeleteTemplate(templateId: string) {
    const next = templates.filter((t) => t.id !== templateId);
    setTemplates(next);
    if (activeTemplateId === templateId && next.length > 0) {
      setActiveTemplateId(next[0].id);
      setFormData(structuredClone(next[0].data));
    }
    showToast('Template kustom dihapus.');
  }

  function handleResetBuiltInTemplates() {
    const freshBuiltIns = createDefaultTemplates();
    const customOnly = templates.filter((t) => !t.isBuiltIn);
    const merged = [...freshBuiltIns, ...customOnly];
    setTemplates(merged);
    if (!merged.some((t) => t.id === activeTemplateId)) {
      setActiveTemplateId(freshBuiltIns[0].id);
      setFormData(structuredClone(freshBuiltIns[0].data));
    }
    showToast('Template bawaan dipulihkan.');
  }

  function handleCreateBlankTemplate() {
    const today = getLocalIsoDate(0);
    const blankTpl: ReportTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: 'Template Laporan Baru',
      description: 'Template kosong yang dapat disesuaikan bagian dan itemnya.',
      category: 'Kustom',
      isBuiltIn: false,
      updatedAt: today,
      data: {
        senderAlias: 'PETUGAS LAPORAN',
        unitName: 'NAMA INSTANSI / UNIT',
        kepadaLabel: 'Kepada :',
        kepadaTarget: 'Yth. Pimpinan Tujuan.',
        boldKepada: true,
        tembusanLabel: 'Tembusan :',
        tembusanList: ['1. Arsip / Pengawas'],
        boldTembusan: true,
        greetingText: 'Selamat Pagi',
        introNarrative: 'Mohon ijin melaporkan kegiatan / situasi sebagai berikut :',
        includePeriodBlock: false,
        startDate: today,
        startTime: '08.00 wib',
        periodConnector: 'Sampai - Dengan ...',
        endDate: today,
        endTime: '20.00 wib',
        conditionSummary: 'Situasi aman dan terkendali :',
        sections: [
          {
            id: `sec-${Date.now()}`,
            title: '1. RINCIAN KEGIATAN :',
            boldTitle: true,
            items: [
              {
                id: `item-${Date.now()}`,
                prefix: 'a.',
                boldPrefix: true,
                label: 'Kegiatan Utama',
                spacer: ' ',
                value: 'NIHIL',
                quickValues: ['NIHIL', 'Terlaksana', '-'],
              },
            ],
          },
        ],
        closingTag: 'DUMP',
        signOffGreeting: 'Hormat Kami',
        signOffRole: 'PETUGAS PELAPOR',
        boldSignOffRole: true,
        signOffName: 'NAMA PETUGAS',
      },
    };
    setTemplates((prev) => [blankTpl, ...prev]);
    setActiveTemplateId(blankTpl.id);
    setFormData(structuredClone(blankTpl.data));
    setCustomTextOverride(null);
    setActiveTab('form');
    showToast('Template baru dibuat. Aktifkan "Edit Struktur Item" untuk menyesuaikan.');
  }

  function handleQuickSaveContact(name: string, phone: string) {
    const normalized = normalizePhoneNumber(phone);
    const created: TargetContact = {
      id: `cnt-${Date.now()}`,
      name,
      role: 'Kontak Cepat',
      phone: normalized,
    };
    setContacts((prev) => [created, ...prev]);
    setTargetName(name);
    showToast(`Kontak "${name}" disimpan.`);
  }

  function handleQuickAddGroup(name: string, inviteUrl: string) {
    const created: WhatsAppGroup = {
      id: `grp-${Date.now()}`,
      name,
      category: 'Grup Tambahan',
      inviteUrl,
    };
    setGroups((prev) => [created, ...prev]);
    setSelectedGroupIds((prev) => [...prev, created.id]);
    showToast(`Grup "${name}" ditambahkan & dipilih.`);
  }

  function handleToggleSelectGroup(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  function handleSelectAllGroups(selectAll: boolean) {
    setSelectedGroupIds(selectAll ? groups.map((g) => g.id) : []);
  }

  function handleToggleGroupSent(groupId: string) {
    setSentGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  function handleSelectContactForForm(contact: TargetContact) {
    setSendMode('phone');
    setTargetPhone(contact.phone);
    setTargetName(contact.name);
    setActiveTab('form');
    showToast(`Nomor tujuan diatur ke ${contact.name}.`);
  }

  function handleRecordAction(
    actionType: 'send' | 'copy',
    finalMessage: string,
    groupNames?: string[]
  ) {
    const activeTpl = templates.find((t) => t.id === activeTemplateId);
    const entry: SentHistoryEntry = {
      id: `hist-${Date.now()}`,
      createdAt: new Date().toISOString(),
      templateId: activeTemplateId,
      templateName: activeTpl ? activeTpl.name : 'Laporan Kustom',
      targetName: sendMode === 'groups' ? '' : targetName,
      targetPhone: sendMode === 'groups' ? '' : normalizePhoneNumber(targetPhone),
      groupNames: groupNames && groupNames.length > 0 ? groupNames : undefined,
      formattedMessage: finalMessage,
      data: structuredClone(formData),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 50));
    if (actionType === 'copy') {
      showToast('Teks laporan disalin ke clipboard & dicatat di Riwayat.');
    } else {
      showToast('Membuka WhatsApp & mencatat ke Riwayat.');
    }
  }

  function handleFocusTargetInput() {
    setActiveTab('form');
    window.setTimeout(() => {
      if (sendMode === 'phone') {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }

  function handleHeaderPrimarySend() {
    if (activeTab !== 'form') {
      setActiveTab('form');
    }
    if (sendMode === 'phone' && !isValidWhatsAppPhone(targetPhone)) {
      handleFocusTargetInput();
      showToast('Masukkan nomor WhatsApp tujuan terlebih dahulu.');
      return;
    }
    if (sendMode === 'groups' && selectedGroups.length === 0) {
      handleFocusTargetInput();
      showToast('Pilih minimal 1 grup WhatsApp tujuan terlebih dahulu.');
      return;
    }
    previewSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function handleLoadHistoryToForm(entry: SentHistoryEntry) {
    setFormData(structuredClone(entry.data));
    if (entry.templateId && templates.some((t) => t.id === entry.templateId)) {
      setActiveTemplateId(entry.templateId);
    }
    if (entry.groupNames && entry.groupNames.length > 0) {
      setSendMode('groups');
    } else if (entry.targetPhone) {
      setSendMode('phone');
      setTargetPhone(entry.targetPhone);
      setTargetName(entry.targetName);
    }
    setCustomTextOverride(null);
    setSentGroupIds([]);
    setActiveTab('form');
    showToast('Data laporan lama dimuat ke formulir.');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrimarySendClick={handleHeaderPrimarySend}
        historyCount={history.length}
      />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg border border-slate-700"
        >
          {toastMsg}
        </div>
      )}

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <ReportForm
                templates={templates}
                activeTemplateId={activeTemplateId}
                onSelectTemplate={handleSelectTemplate}
                formData={formData}
                onChangeFormData={(next) => {
                  setFormData(next);
                  if (customTextOverride !== null) {
                    setCustomTextOverride(null);
                  }
                }}
                sendMode={sendMode}
                onChangeSendMode={setSendMode}
                targetPhone={targetPhone}
                targetName={targetName}
                onChangeTargetPhone={(phone, name = '') => {
                  setTargetPhone(phone);
                  setTargetName(name);
                }}
                contacts={contacts}
                groups={groups}
                selectedGroupIds={selectedGroupIds}
                onToggleSelectGroup={handleToggleSelectGroup}
                onSelectAllGroups={handleSelectAllGroups}
                onQuickSaveContact={handleQuickSaveContact}
                onQuickAddGroup={handleQuickAddGroup}
                onSaveAsNewTemplate={handleSaveAsNewTemplate}
                onResetFormToTemplate={handleResetFormToTemplate}
                phoneInputRef={phoneInputRef}
              />
            </div>

            <div
              ref={previewSectionRef}
              className="lg:col-span-5 lg:sticky lg:top-22"
            >
              <WhatsAppPreview
                senderAlias={formData.senderAlias}
                sendMode={sendMode}
                targetPhone={targetPhone}
                targetName={targetName}
                selectedGroups={selectedGroups}
                sentGroupIds={sentGroupIds}
                onToggleGroupSent={handleToggleGroupSent}
                onResetGroupQueue={() => setSentGroupIds([])}
                generatedText={generatedText}
                customTextOverride={customTextOverride}
                onChangeCustomText={setCustomTextOverride}
                onRecordAction={handleRecordAction}
                onFocusTargetInput={handleFocusTargetInput}
              />
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <TemplateManager
            templates={templates}
            activeTemplateId={activeTemplateId}
            onUseTemplate={handleSelectTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onResetBuiltInTemplates={handleResetBuiltInTemplates}
            onCreateBlankTemplate={handleCreateBlankTemplate}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactManager
            contacts={contacts}
            groups={groups}
            selectedGroupIds={selectedGroupIds}
            onSaveContacts={(next) => {
              setContacts(next);
              showToast('Daftar kontak tujuan diperbarui.');
            }}
            onSaveGroups={(next) => {
              setGroups(next);
              setSelectedGroupIds((prev) =>
                prev.filter((id) => next.some((g) => g.id === id))
              );
              showToast('Daftar grup WhatsApp diperbarui.');
            }}
            onToggleSelectGroup={handleToggleSelectGroup}
            onUseSelectedGroupsInForm={() => {
              setSendMode('groups');
              setActiveTab('form');
            }}
            onSelectContactForForm={handleSelectContactForForm}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            entries={history}
            onLoadToForm={handleLoadHistoryToForm}
            onDeleteEntry={(id) =>
              setHistory((prev) => prev.filter((e) => e.id !== id))
            }
            onClearAll={() => {
              setHistory([]);
              showToast('Riwayat laporan dibersihkan.');
            }}
            onGoToForm={() => setActiveTab('form')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            LaporWA · Formulir &amp; Template Laporan WhatsApp Terstruktur
          </span>
          <span>
            Data tersimpan lokal di peramban Anda dan dikirim langsung melalui tautan resmi WhatsApp.
          </span>
        </div>
      </footer>
    </div>
  );
}
