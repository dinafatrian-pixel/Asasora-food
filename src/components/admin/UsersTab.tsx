import React, { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  User,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { AdminUser } from '../../types';

interface UsersTabProps {
  adminUsers: AdminUser[];
  currentLoggedInUser?: AdminUser | null;
  onAddUser: (user: Omit<AdminUser, 'id'>) => void;
  onUpdateUser: (user: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
  onResetUsers?: () => void;
  onNotify: (message: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  adminUsers,
  currentLoggedInUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetUsers,
  onNotify,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form states for adding user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Admin');
  const [newEmail, setNewEmail] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Form states for editing user
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<AdminUser['role']>('Admin');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Password visibility state per user card
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onNotify(`Disalin ke papan klip: "${text}"`);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword(user.password);
    setEditName(user.name);
    setEditRole(user.role);
    setEditEmail(user.email || '');
    setEditIsActive(user.isActive !== false);
    setShowEditPassword(false);
    setEditFormError(null);
  };

  // Save new user
  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanName = newName.trim();

    if (!cleanUsername) {
      setAddFormError('Username wajib diisi.');
      return;
    }
    if (cleanUsername.length < 3) {
      setAddFormError('Username minimal 3 karakter.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setAddFormError('Username hanya boleh berisi huruf, angka, titik, strip, atau underscore.');
      return;
    }
    // Check if username already exists
    if (adminUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setAddFormError(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
      return;
    }
    if (!cleanPassword) {
      setAddFormError('Password wajib diisi.');
      return;
    }
    if (cleanPassword.length < 3) {
      setAddFormError('Password minimal 3 karakter.');
      return;
    }
    if (!cleanName) {
      setAddFormError('Nama Lengkap admin wajib diisi.');
      return;
    }

    onAddUser({
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      role: newRole,
      email: newEmail.trim() || undefined,
      isActive: newIsActive,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    onNotify(`✅ Pengguna "${cleanName}" (${cleanUsername}) berhasil ditambahkan dan siap digunakan untuk login!`);
    setIsAddModalOpen(false);
    // Reset form
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setNewRole('Admin');
    setNewEmail('');
    setNewIsActive(true);
  };

  // Save edited user
  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanPassword = editPassword.trim();
    const cleanName = editName.trim();

    if (!cleanUsername) {
      setEditFormError('Username tidak boleh kosong.');
      return;
    }
    if (cleanUsername.length < 3) {
      setEditFormError('Username minimal 3 karakter.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setEditFormError('Username hanya boleh berisi huruf, angka, titik, strip, atau underscore.');
      return;
    }
    // Check if username is already taken by another user
    if (
      adminUsers.some(
        (u) => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername
      )
    ) {
      setEditFormError(`Username "${cleanUsername}" sudah dipakai oleh akun admin lain.`);
      return;
    }
    if (!cleanPassword) {
      setEditFormError('Password tidak boleh kosong.');
      return;
    }
    if (cleanPassword.length < 3) {
      setEditFormError('Password minimal 3 karakter.');
      return;
    }
    if (!cleanName) {
      setEditFormError('Nama Lengkap tidak boleh kosong.');
      return;
    }

    // Safety: prevent deactivating the only active user
    if (!editIsActive) {
      const activeCount = adminUsers.filter((u) => u.isActive !== false).length;
      if (activeCount <= 1 && editingUser.isActive !== false) {
        setEditFormError('Tidak dapat menonaktifkan satu-satunya akun admin yang aktif.');
        return;
      }
    }

    const updatedUser: AdminUser = {
      ...editingUser,
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      role: editRole,
      email: editEmail.trim() || undefined,
      isActive: editIsActive,
    };

    onUpdateUser(updatedUser);
    onNotify(`✅ Perubahan akun "${cleanName}" (${cleanUsername}) berhasil disimpan & disinkronkan ke modul login!`);
    setEditingUser(null);
  };

  // Confirmation state for deleting a user (Iframe-safe modal)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [userWarning, setUserWarning] = useState<string | null>(null);

  // Delete user handler with safety checks
  const handleDelete = (user: AdminUser) => {
    if (adminUsers.length <= 1) {
      setUserWarning('Tidak dapat menghapus akun terakhir. Minimal harus ada 1 akun admin aktif untuk akses sistem.');
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      onNotify(`🗑️ Akun admin "${userToDelete.name}" (@${userToDelete.username}) berhasil dihapus.`);
      setUserToDelete(null);
    }
  };

  // Quick toggle active/inactive status
  const handleToggleActive = (user: AdminUser) => {
    if (user.isActive !== false) {
      const activeCount = adminUsers.filter((u) => u.isActive !== false).length;
      if (activeCount <= 1) {
        setUserWarning('Minimal harus ada 1 akun admin yang aktif di dalam sistem.');
        return;
      }
    }

    const updated = { ...user, isActive: !user.isActive };
    onUpdateUser(updated);
    onNotify(
      updated.isActive
        ? `✅ Akun @${user.username} berhasil diaktifkan kembali.`
        : `⚠️ Akun @${user.username} telah dinonaktifkan.`
    );
  };

  const getRoleBadgeStyle = (role: AdminUser['role']) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Admin':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Staff':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Operator':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-50 via-green-50 to-white p-5 rounded-2xl border border-emerald-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#2E6F40] text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#F3C623]" />
            </span>
            <div>
              <h4 className="font-extrabold text-[#2E6F40] text-base sm:text-lg flex items-center gap-2">
                <span>Kelola Username, Password &amp; Akun Admin</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {adminUsers.length} Akun Terdaftar
                </span>
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Ubah username/password akun yang ada, atau tambahkan user baru. Semua perubahan otomatis tersinkronisasi ke modul login sistem.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-[#2E6F40] hover:bg-green-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-[#F3C623]" />
            <span>Tambah User Baru</span>
          </button>

          {onResetUsers && (
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 font-bold p-2.5 rounded-xl transition cursor-pointer text-xs"
              title="Reset ke User Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warning Toast / Banner */}
      {userWarning && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs font-bold rounded-xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{userWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setUserWarning(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal (Iframe-Safe) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Hapus Akun Administrator?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun <strong className="text-gray-900 font-bold">"{userToDelete.name}"</strong> (@{userToDelete.username})? Akun ini tidak akan bisa login lagi setelah dihapus.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset Confirm Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Reset Akun Admin ke Default?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Kembalikan daftar akun ke user bawaan (admin/1234, asasora/1234). Data user kustom yang ditambahkan akan direset.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetUsers) {
                    onResetUsers();
                    onNotify('Akun administrator telah dikembalikan ke pengaturan awal.');
                  }
                  setShowResetConfirmModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Reset ke Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Synchronization Status Notice */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-extrabold text-amber-950">Sinkronisasi Instan Modul Login:</span>
          <p className="mt-0.5 text-amber-800">
            Setiap kali Anda menekan tombol <strong>"Simpan Hasil Edit"</strong> atau menambahkan user baru, data langsung tersimpan secara aman di database browser (LocalStorage). Anda dapat langsung menguji login dengan username dan password yang baru saja diperbarui tanpa perlu memuat ulang halaman.
          </p>
        </div>
      </div>

      {/* Admin Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminUsers.map((user) => {
          const isShowPass = visiblePasswords[user.id] || false;
          const isCurrent =
            currentLoggedInUser?.username?.toLowerCase() === user.username.toLowerCase();

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border p-5 transition-all space-y-4 shadow-2xs hover:shadow-md ${
                !user.isActive
                  ? 'border-gray-200 bg-gray-50/70 opacity-75'
                  : isCurrent
                  ? 'border-emerald-400 ring-2 ring-emerald-200/60'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              {/* Card Header: Avatar, Name, Role & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E6F40] to-emerald-700 text-white flex items-center justify-center font-black text-base shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-gray-900 text-sm sm:text-base">
                        {user.name}
                      </h5>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold bg-[#F3C623] text-gray-950 px-2 py-0.2 rounded-md shadow-2xs">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          user.isActive !== false
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {user.isActive !== false ? '● Aktif' : '○ Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(user)}
                  className={`p-1.5 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1 ${
                    user.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  }`}
                  title={user.isActive !== false ? 'Klik untuk menonaktifkan akun' : 'Klik untuk mengaktifkan akun'}
                >
                  {user.isActive !== false ? (
                    <UserCheck className="w-3.5 h-3.5" />
                  ) : (
                    <UserX className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Credentials Box (Username & Password with Eye Toggle) */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2.5">
                {/* Username */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    Username:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {user.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(user.username, `user-${user.id}`)}
                      className="p-1 text-gray-400 hover:text-emerald-700 rounded hover:bg-white transition"
                      title="Salin Username"
                    >
                      {copiedId === `user-${user.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200/70">
                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gray-400" />
                    Password:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-gray-200 tracking-wider">
                      {isShowPass ? user.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="p-1 text-gray-500 hover:text-emerald-700 rounded hover:bg-white transition"
                      title={isShowPass ? 'Sembunyikan Password' : 'Lihat Password'}
                    >
                      {isShowPass ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(user.password, `pass-${user.id}`)}
                      className="p-1 text-gray-400 hover:text-emerald-700 rounded hover:bg-white transition"
                      title="Salin Password"
                    >
                      {copiedId === `pass-${user.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email (if available) */}
                {user.email && (
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/70 text-[11px]">
                    <span className="font-bold text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      Email:
                    </span>
                    <span className="text-gray-700 truncate max-w-[180px]">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(user)}
                  className="flex-1 bg-emerald-50 hover:bg-[#2E6F40] text-[#2E6F40] hover:text-white border border-emerald-200 hover:border-[#2E6F40] text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Username / Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(user)}
                  className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 p-2 rounded-xl transition cursor-pointer"
                  title="Hapus Akun Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL TAMBAH USER BARU ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-[#2E6F40] rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">
                    Tambah Akun Admin Baru
                  </h4>
                  <p className="text-xs text-gray-500">
                    Akun baru dapat langsung digunakan untuk masuk sistem.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewUser} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap Admin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Username Login <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-gray-400 font-normal">Huruf kecil, tanpa spasi</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Contoh: budi_admin"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password atau PIN login"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Peran / Role Administrator
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E6F40] focus:outline-none bg-white"
                >
                  <option value="Super Admin">Super Admin (Hak Akses Penuh)</option>
                  <option value="Admin">Admin (Kelola Konten &amp; Pesanan)</option>
                  <option value="Staff">Staff (Kelola Katalog &amp; Galeri)</option>
                  <option value="Operator">Operator (Hanya Pesanan Masuk)</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@asasora.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#2E6F40] rounded border-gray-300 focus:ring-[#2E6F40]"
                />
                <label htmlFor="newIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Aktifkan Akun (Bisa langsung login)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveNewUser(e);
                  }}
                  className="flex-1 bg-[#2E6F40] hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 text-[#F3C623]" />
                  <span>Simpan Akun Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT USER (UBAH USER & PASSWORD) ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-[#2E6F40] rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">
                    Ubah Username &amp; Password
                  </h4>
                  <p className="text-xs text-gray-500">
                    Edit data akun <strong>@{editingUser.username}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditedUser} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap Admin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Username Baru <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold">Sinkron ke login</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] focus:outline-none bg-emerald-50/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Password Baru <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold">Bisa berupa PIN / Sandi</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#2E6F40] focus:outline-none bg-emerald-50/30 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Peran / Role Administrator
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminUser['role'])}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E6F40] focus:outline-none bg-white"
                >
                  <option value="Super Admin">Super Admin (Hak Akses Penuh)</option>
                  <option value="Admin">Admin (Kelola Konten &amp; Pesanan)</option>
                  <option value="Staff">Staff (Kelola Katalog &amp; Galeri)</option>
                  <option value="Operator">Operator (Hanya Pesanan Masuk)</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E6F40] focus:outline-none"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#2E6F40] rounded border-gray-300 focus:ring-[#2E6F40]"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Status Akun Aktif
                </label>
              </div>

              {/* Action Buttons: Simpan Hasil Edit */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveEditedUser(e);
                  }}
                  className="flex-1 bg-[#2E6F40] hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F3C623]" />
                  <span>Simpan Hasil Edit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
