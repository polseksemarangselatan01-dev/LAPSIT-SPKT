import { useState } from 'react';
import {
  ArrowRight,
  CheckSquare,
  Edit2,
  Phone,
  Plus,
  Save,
  Square,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { TargetContact, WhatsAppGroup } from '../types/report';
import {
  formatPhoneReadable,
  isValidWhatsAppPhone,
  normalizeGroupInviteUrl,
  normalizePhoneNumber,
} from '../utils/whatsappFormatter';

interface ContactManagerProps {
  contacts: TargetContact[];
  groups: WhatsAppGroup[];
  selectedGroupIds: string[];
  onSaveContacts: (next: TargetContact[]) => void;
  onSaveGroups: (next: WhatsAppGroup[]) => void;
  onToggleSelectGroup: (groupId: string) => void;
  onUseSelectedGroupsInForm: () => void;
  onSelectContactForForm: (contact: TargetContact) => void;
}

export function ContactManager({
  contacts,
  groups,
  selectedGroupIds,
  onSaveContacts,
  onSaveGroups,
  onToggleSelectGroup,
  onUseSelectedGroupsInForm,
  onSelectContactForForm,
}: ContactManagerProps) {
  const [subTab, setSubTab] = useState<'groups' | 'contacts'>('groups');

  // Contact form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Group form state
  const [groupName, setGroupName] = useState('');
  const [groupCategory, setGroupCategory] = useState('');
  const [groupInviteUrl, setGroupInviteUrl] = useState('');
  const [groupNotes, setGroupNotes] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupErrorMsg, setGroupErrorMsg] = useState('');

  function resetContactForm() {
    setName('');
    setRole('');
    setPhone('');
    setNotes('');
    setEditingId(null);
    setErrorMsg('');
  }

  function startEditContact(c: TargetContact) {
    setEditingId(c.id);
    setName(c.name);
    setRole(c.role);
    setPhone(c.phone);
    setNotes(c.notes || '');
    setErrorMsg('');
  }

  function handleSubmitContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kontak tujuan wajib diisi.');
      return;
    }
    if (phone.trim() && !isValidWhatsAppPhone(phone)) {
      setErrorMsg('Format nomor WhatsApp tidak valid (minimal 10 digit).');
      return;
    }

    const normalized = phone.trim() ? normalizePhoneNumber(phone) : '';

    if (editingId) {
      onSaveContacts(
        contacts.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                role: role.trim(),
                phone: normalized,
                notes: notes.trim(),
              }
            : c
        )
      );
    } else {
      const created: TargetContact = {
        id: `cnt-${Date.now()}`,
        name: name.trim(),
        role: role.trim() || 'Penerima Laporan',
        phone: normalized,
        notes: notes.trim(),
      };
      onSaveContacts([created, ...contacts]);
    }
    resetContactForm();
  }

  function handleDeleteContact(id: string) {
    onSaveContacts(contacts.filter((c) => c.id !== id));
    if (editingId === id) {
      resetContactForm();
    }
  }

  function resetGroupForm() {
    setGroupName('');
    setGroupCategory('');
    setGroupInviteUrl('');
    setGroupNotes('');
    setEditingGroupId(null);
    setGroupErrorMsg('');
  }

  function startEditGroup(g: WhatsAppGroup) {
    setEditingGroupId(g.id);
    setGroupName(g.name);
    setGroupCategory(g.category);
    setGroupInviteUrl(g.inviteUrl || '');
    setGroupNotes(g.notes || '');
    setGroupErrorMsg('');
  }

  function handleSubmitGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) {
      setGroupErrorMsg('Nama grup WhatsApp wajib diisi.');
      return;
    }
    let normalizedInvite = '';
    if (groupInviteUrl.trim()) {
      normalizedInvite = normalizeGroupInviteUrl(groupInviteUrl);
      if (!normalizedInvite) {
        setGroupErrorMsg(
          'Tautan grup harus berupa link resmi https://chat.whatsapp.com/...'
        );
        return;
      }
    }

    if (editingGroupId) {
      onSaveGroups(
        groups.map((g) =>
          g.id === editingGroupId
            ? {
                ...g,
                name: groupName.trim(),
                category: groupCategory.trim() || 'Grup Pelaporan',
                inviteUrl: normalizedInvite,
                notes: groupNotes.trim(),
              }
            : g
        )
      );
    } else {
      const created: WhatsAppGroup = {
        id: `grp-${Date.now()}`,
        name: groupName.trim(),
        category: groupCategory.trim() || 'Grup Pelaporan',
        inviteUrl: normalizedInvite,
        notes: groupNotes.trim(),
      };
      onSaveGroups([created, ...groups]);
    }
    resetGroupForm();
  }

  function handleDeleteGroup(id: string) {
    onSaveGroups(groups.filter((g) => g.id !== id));
    if (editingGroupId === id) {
      resetGroupForm();
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kontak &amp; Grup WhatsApp Tujuan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola daftar grup WhatsApp untuk kirim massal (&gt;1 grup) maupun nomor tujuan perorangan.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('groups')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'groups'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Grup WA ({groups.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('contacts')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'contacts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nomor Perorangan ({contacts.length})
          </button>
        </div>
      </div>

      {subTab === 'groups' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add / Edit Group Form */}
          <form
            onSubmit={handleSubmitGroup}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingGroupId ? 'Ubah Grup WhatsApp' : 'Tambah Grup WhatsApp'}
              </h2>
              {editingGroupId && (
                <button
                  type="button"
                  onClick={resetGroupForm}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Batal
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Simpan beberapa grup tujuan sekaligus. Tautan undangan grup bersifat opsional untuk akses langsung ke ruang chat grup tersebut.
            </p>

            {groupErrorMsg && (
              <div className="p-3 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg">
                {groupErrorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Grup WhatsApp
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Contoh: Grup SPKT Polrestabes Semarang"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori / Wilayah
              </label>
              <input
                type="text"
                value={groupCategory}
                onChange={(e) => setGroupCategory(e.target.value)}
                placeholder="Contoh: Pelaporan Utama / Piket"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tautan Undangan Grup (Opsional)
              </label>
              <input
                type="url"
                value={groupInviteUrl}
                onChange={(e) => setGroupInviteUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
                placeholder="Contoh: Kirim laporan tiap pergantian shift"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              {editingGroupId ? (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  Simpan Perubahan Grup
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Tambah ke Daftar Grup
                </>
              )}
            </button>
          </form>

          {/* Group List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Daftar Grup Tersimpan ({groups.length})
              </h2>
              {selectedGroupIds.length > 0 && (
                <button
                  type="button"
                  onClick={onUseSelectedGroupsInForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Kirim ke {selectedGroupIds.length} Grup Terpilih
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-900">
                  Belum ada grup WhatsApp tersimpan.
                </p>
                <p className="text-xs text-slate-500">
                  Tambahkan beberapa grup melalui formulir di samping untuk mengirim laporan ke lebih dari 1 grup.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {groups.map((grp) => {
                  const isSelected = selectedGroupIds.includes(grp.id);
                  return (
                    <div
                      key={grp.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleSelectGroup(grp.id)}
                        className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare
                            className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <Square
                            className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {grp.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {grp.category}
                            {grp.notes ? ` · ${grp.notes}` : ''}
                          </div>
                          {grp.inviteUrl && (
                            <div className="text-xs font-mono text-emerald-700 truncate">
                              {grp.inviteUrl}
                            </div>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditGroup(grp)}
                          aria-label={`Ubah ${grp.name}`}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(grp.id)}
                          aria-label={`Hapus ${grp.name}`}
                          className="p-2 min-h-[38px] text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add / Edit Contact Form */}
          <form
            onSubmit={handleSubmitContact}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Ubah Kontak Tujuan' : 'Tambah Nomor Tujuan'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetContactForm}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Batal
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Simpan nomor WhatsApp pimpinan atau piket tujuan agar langsung siap dipilih di formulir.
            </p>

            {errorMsg && (
              <div className="p-3 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama / Pejabat Penerima
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ka SPKT Polrestabes Semarang"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jabatan / Keterangan Peran
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Tujuan Utama Laporan 1x12 Jam"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Nomor WhatsApp
                </label>
                {phone && isValidWhatsAppPhone(phone) && (
                  <span className="text-xs font-mono text-emerald-700 tabular-nums">
                    {formatPhoneReadable(phone)}
                  </span>
                )}
              </div>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890 atau 6281234567890"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kirim sebelum pukul 08.15 WIB"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              {editingId ? (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Simpan Kontak Tujuan
                </>
              )}
            </button>
          </form>

          {/* Contact List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Daftar Kontak Tersimpan ({contacts.length})
              </h2>
            </div>

            {contacts.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Phone className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-900">
                  Belum ada kontak tujuan tersimpan.
                </p>
                <p className="text-xs text-slate-500">
                  Tambahkan nomor tujuan melalui formulir di samping untuk pengiriman satu klik.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {contacts.map((contact) => {
                  const hasPhone = isValidWhatsAppPhone(contact.phone);
                  return (
                    <div
                      key={contact.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {contact.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {contact.role}
                          {contact.notes ? ` · ${contact.notes}` : ''}
                        </div>
                        <div
                          className={`text-xs font-mono tabular-nums pt-0.5 ${
                            hasPhone
                              ? 'text-emerald-700 font-medium'
                              : 'text-amber-700'
                          }`}
                        >
                          {hasPhone
                            ? formatPhoneReadable(contact.phone)
                            : 'Nomor WhatsApp belum diisi — klik Ubah untuk melengkapi'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasPhone && (
                          <button
                            type="button"
                            onClick={() => onSelectContactForForm(contact)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Gunakan
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditContact(contact)}
                          aria-label={`Ubah ${contact.name}`}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          aria-label={`Hapus ${contact.name}`}
                          className="p-2 min-h-[38px] text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
