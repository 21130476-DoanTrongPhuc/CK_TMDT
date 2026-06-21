import { useState, useEffect } from 'react';
import {
  Users,
  Lock,
  LockOpen,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Store
} from 'lucide-react';
import { adminUserApi } from '../../api/sellerApi';
import type { AdminUser, UserRole, UserStatus, AdminUserForm } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const ROLE_LABEL: Record<UserRole, string> = {
  USER: 'Người mua',
  SELLER: 'Người bán',
  ADMIN: 'Quản trị viên',
};

const ROLE_SELECT_CLASS: Record<UserRole, string> = {
  USER: 'bg-gray-50 text-gray-700 border-gray-200',
  SELLER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-sky-50 text-sky-700 border-sky-200',
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  USER: <UserIcon size={12} />,
  SELLER: <Store size={12} />,
  ADMIN: <ShieldCheck size={12} />,
};

const ROLE_AVATAR_BG: Record<UserRole, string> = {
  USER: 'from-gray-400 to-gray-500',
  SELLER: 'from-emerald-500 to-teal-600',
  ADMIN: 'from-sky-500 to-cyan-500',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Chưa kích hoạt',
  BANNED: 'Bị cấm',
};

const PAGE_SIZE = 15;

const emptyForm: AdminUserForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'USER',
  status: 'ACTIVE',
};

export default function AdminUsers() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [changingRoleId, setChangingRoleId] = useState<number | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers(0, filterRole, search);
  }, []);

  const loadUsers = async (page: number, role: UserRole | 'ALL', keyword: string) => {
    try {
      setLoading(true);
      const res = await adminUserApi.list({
        page,
        size: PAGE_SIZE,
        role: role === 'ALL' ? undefined : role,
        keyword: keyword || undefined,
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.number);
    } catch {
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (role: UserRole | 'ALL') => {
    setFilterRole(role);
    loadUsers(0, role, search);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      loadUsers(0, filterRole, search);
    }
  };

  const handleStatusToggle = async (u: AdminUser) => {
    // Nếu active thì đổi thành Banned, ngược lại đổi thành Active
    const newStatus: UserStatus = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      setChangingStatusId(u.id);
      await adminUserApi.update(u.id, {
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        status: newStatus
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: newStatus } : x)));
      showToast(newStatus === 'ACTIVE' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch {
      showToast('Thao tác thất bại', 'error');
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleRoleChange = async (u: AdminUser, newRole: string) => {
    try {
      setChangingRoleId(u.id);
      await adminUserApi.update(u.id, {
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        role: newRole as UserRole,
        status: u.status
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole as UserRole } : x)));
      showToast(`Đã đổi quyền thành ${ROLE_LABEL[newRole as UserRole]}`);
    } catch {
      showToast('Đổi quyền thất bại', 'error');
    } finally {
      setChangingRoleId(null);
    }
  };

  // Add / Edit form (Chỉ Add theo yêu cầu đơn giản, cập nhật đã làm qua dropdown)
  const openAdd = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.email || !form.fullName || !form.password) {
      showToast('Vui lòng điền đủ email, mật khẩu và họ tên', 'error');
      return;
    }
    try {
      setSaving(true);
      await adminUserApi.create(form);
      showToast('Thêm người dùng thành công', 'success');
      closeModal();
      loadUsers(0, filterRole, search);
    } catch {
      showToast('Thêm người dùng thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await adminUserApi.delete(deleteId);
      showToast('Đã xóa người dùng', 'success');
      setDeleteId(null);
      loadUsers(currentPage, filterRole, search);
    } catch {
      showToast('Xóa người dùng thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Người Dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng cộng <span className="font-semibold text-gray-700">{totalElements}</span> tài khoản trên hệ thống
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Toolbar: search + filter role */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Tìm kiếm
          </label>
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Vai trò (Role)
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={filterRole === 'ALL'}
              label="Tất cả"
              onClick={() => handleFilterChange('ALL')}
            />
            <FilterPill
              active={filterRole === 'USER'}
              label="Người mua"
              onClick={() => handleFilterChange('USER')}
            />
            <FilterPill
              active={filterRole === 'SELLER'}
              label="Người bán"
              onClick={() => handleFilterChange('SELLER')}
            />
            <FilterPill
              active={filterRole === 'ADMIN'}
              label="Quản trị viên"
              onClick={() => handleFilterChange('ADMIN')}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
            <Users size={36} className="text-sky-500" />
          </div>
          <p className="text-gray-700 text-lg font-semibold mb-1">Không tìm thấy người dùng</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-gray-600 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-bold w-12">#</th>
                  <th className="px-4 py-3 font-bold">Họ tên</th>
                  <th className="px-4 py-3 font-bold">Liên hệ</th>
                  <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-center w-44">Quyền (Role)</th>
                  <th className="px-4 py-3 font-bold text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isActive = u.status === 'ACTIVE';
                  const isBanned = u.status === 'BANNED';
                  const avatarBg = ROLE_AVATAR_BG[u.role] || ROLE_AVATAR_BG.USER;
                  return (
                    <tr key={u.id} className="hover:bg-sky-50/30 transition">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.id}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm shrink-0`}>
                            {u.fullName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <p className="font-semibold text-gray-800">{u.fullName}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        <p className="inline-flex items-center gap-1.5 text-sm">
                          <Mail size={12} className="text-gray-400" />
                          {u.email}
                        </p>
                        {u.phone && (
                          <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Phone size={11} className="text-gray-400" />
                            {u.phone}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : isBanned ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-gray-50 text-gray-600 ring-gray-200'
                          }`}>
                            {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {STATUS_LABEL[u.status]}
                          </span>
                          {changingStatusId === u.id ? (
                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                          ) : (
                            <button
                              onClick={() => handleStatusToggle(u)}
                              title={isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                              className={`p-1.5 rounded-lg transition ${
                                isActive
                                  ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isActive ? <Lock size={13} /> : <LockOpen size={13} />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {changingRoleId === u.id ? (
                          <span className="inline-block w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="relative inline-flex items-center">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              {ROLE_ICONS[u.role]}
                            </span>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className={`border rounded-lg pl-7 pr-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${
                                ROLE_SELECT_CLASS[u.role] || 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              <option value="USER">Người mua</option>
                              <option value="SELLER">Người bán</option>
                              <option value="ADMIN">Quản trị viên</option>
                            </select>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa người dùng vĩnh viễn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-xs text-gray-500">
                Hiển thị trang <span className="font-semibold text-gray-700">{currentPage + 1}</span> / <span className="font-semibold text-gray-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadUsers(currentPage - 1, filterRole, search)}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition"
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <button
                  onClick={() => loadUsers(currentPage + 1, filterRole, search)}
                  disabled={currentPage >= totalPages - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
            <div className="relative bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Thêm Người Dùng Mới</h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên *</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quyền hạn</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="USER">Người mua</option>
                  <option value="SELLER">Người bán</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <Trash2 className="mx-auto text-rose-500 mb-3" size={36} />
            <h2 className="text-lg font-bold text-gray-800 mb-2">Xóa người dùng?</h2>
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 text-sm bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
        active
          ? 'bg-sky-600 text-white shadow-md'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-sky-50 hover:text-sky-700'
      }`}
    >
      {label}
    </button>
  );
}
