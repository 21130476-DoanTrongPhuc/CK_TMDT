import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { promotionApi, type Promotion, type PromotionForm, type PromotionType } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const EMPTY_FORM: PromotionForm = {
    name: '',
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscountAmount: null,
    usageLimit: null,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    active: true,
    productId: null,
};

const PAGE_SIZE = 8;

function formatMoney(value: number) {
    return value.toLocaleString('vi-VN') + 'đ';
}

export default function SellerPromotions() {
    const { showToast } = useToast();
    const [items, setItems] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<PromotionForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const load = async (nextPage = 0) => {
        setLoading(true);
        try {
            const res = await promotionApi.list(nextPage, PAGE_SIZE);
            setItems(res.content);
            setPage(res.number);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
        } catch {
            showToast('Không thể tải danh sách khuyến mãi', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(0);
    }, []);
    const pageItems = items;

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(item: Promotion) {
        setEditingId(item.id);
        setForm({
            name: item.name,
            code: item.code,
            discountType: item.discountType,
            discountValue: item.discountValue,
            minOrderValue: item.minOrderValue,
            maxDiscountAmount: item.maxDiscountAmount,
            usageLimit: item.usageLimit,
            startDate: item.startDate.slice(0, 10),
            endDate: item.endDate.slice(0, 10),
            active: item.active,
            productId: item.productId,
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    async function handleSave() {
        if (!form.code.trim() || !form.name.trim()) {
            showToast('Mã và tên khuyến mãi không được để trống', 'error');
            return;
        }
        if (form.discountValue <= 0) {
            showToast('Giá trị khuyến mãi phải lớn hơn 0', 'error');
            return;
        }
        if (form.discountType === 'PERCENTAGE' && form.discountValue > 100) {
            showToast('Mức giảm theo phần trăm không được vượt quá 100%', 'error');
            return;
        }
        if (form.usageLimit !== null && form.usageLimit <= 0) {
            showToast('Lượt sử dụng phải lớn hơn 0', 'error');
            return;
        }
        if (new Date(form.startDate) > new Date(form.endDate)) {
            showToast('Ngày kết thúc phải sau ngày bắt đầu', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingId !== null) {
                await promotionApi.update(editingId, form);
                showToast('Cập nhật khuyến mãi thành công', 'success');
            } else {
                await promotionApi.create(form);
                showToast('Thêm khuyến mãi thành công', 'success');
            }
            await load(page);
            closeModal();
        } catch {
            showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(item: Promotion) {
        if (!window.confirm(`Xóa khuyến mãi "${item.code}"?`)) return;
        try {
            await promotionApi.delete(item.id);
            await load(page);
            showToast('Đã xóa khuyến mãi', 'success');
        } catch {
            showToast('Xóa thất bại', 'error');
        }
    }

    async function handleToggleActive(item: Promotion) {
        try {
            await promotionApi.toggleActive(item.id, !item.active);
            await load(page);
            showToast(item.active ? 'Đã tắt khuyến mãi' : 'Đã bật khuyến mãi', 'success');
        } catch {
            showToast('Cập nhật trạng thái thất bại', 'error');
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {totalElements} chương trình
                    </p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg">
                    <Plus size={16} />
                    Tạo khuyến mãi
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
                <div className="text-sm text-gray-500">
                    Danh sách đang phân trang trực tiếp từ server.
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-sm text-gray-400">Đang tải...</div>
                ) : pageItems.length === 0 ? (
                    <div className="py-20 text-center text-sm text-gray-400">Không có khuyến mãi nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Loại</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Giá trị</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Dùng</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Kích hoạt</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {pageItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.productName || 'Tất cả / theo seller'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{item.discountType === 'PERCENTAGE' ? 'Theo %' : 'Giảm tiền'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                                        {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : formatMoney(item.discountValue)}
                                        {item.maxDiscountAmount ? <div className="text-xs text-gray-400">Tối đa {formatMoney(item.maxDiscountAmount)}</div> : null}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.usageLimit ? (
                                            <div>
                                                <div className="font-medium">{item.usedCount}/{item.usageLimit}</div>
                                                <div className="text-xs text-gray-400">lượt</div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Không giới hạn</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">{item.active ? 'Đang chạy' : 'Tắt'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleToggleActive(item)} className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-medium">
                                                {item.active ? 'Tắt' : 'Bật'}
                                            </button>
                                            <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Trang {page + 1} / {totalPages}
          </span>
                    <div className="flex gap-1">
                        <button
                            disabled={page === 0}
                            onClick={() => load(Math.max(0, page - 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => load(Math.min(totalPages - 1, page + 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">{editingId !== null ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi'}</h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Mã khuyến mãi" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên chương trình" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as PromotionType })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                    <option value="PERCENTAGE">Theo %</option>
                                    <option value="FIXED_AMOUNT">Giảm tiền</option>
                                </select>
                                <input type="number" min={1} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} placeholder="Giá trị" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                <input type="number" min={0} value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} placeholder="Đơn tối thiểu" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="number" min={1} value={form.usageLimit ?? ''} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })} placeholder="Giới hạn lượt dùng" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                <input type="number" min={0} value={form.maxDiscountAmount ?? ''} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })} placeholder="Giá trị tối đa" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                                    Kích hoạt
                                </label>
                                <input type="number" min={0} value={form.productId ?? ''} onChange={(e) => setForm({ ...form, productId: e.target.value ? Number(e.target.value) : null })} placeholder="Product ID (nếu áp dụng cho sản phẩm)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg disabled:opacity-50">
                                {saving ? 'Đang lưu...' : editingId !== null ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
