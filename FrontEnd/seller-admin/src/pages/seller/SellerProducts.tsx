import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, ImagePlus, Search } from 'lucide-react';
import { productApi, categoryApi } from '../../api/sellerApi';
import type { Product, ProductForm, ProductImage, Category, ProductStatus } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVE: 'Đang bán',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng bán',
  REJECTED: 'Đã từ chối',
};

const STATUS_CLASS: Record<ProductStatus, string> = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-green-100 text-green-700',
  OUT_OF_STOCK: 'bg-yellow-100 text-yellow-700',
  DISCONTINUED: 'bg-gray-100 text-gray-500',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  status: 'ACTIVE',
  allowCustomization: false,
  categoryId: null,
};

const PAGE_SIZE = 10;

export default function SellerProducts() {
  const { showToast } = useToast();

  // all products fetched from server
  const [allProducts, setAllProducts] = useState<Page<Product>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // filter state
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  // client-side pagination
  const [page, setPage] = useState(0);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // image state
  const [savedImages, setSavedImages] = useState<ProductImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mountedRef = useRef(false);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await productApi.list();
      setAllProducts(res);

    } catch {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }

  console.log(allProducts.content);

  // client-side filter
  const filtered = allProducts.content.filter((p) => {
    if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()))
      return false;

    if (statusFilter && p.status !== statusFilter)
      return false;

    if (categoryFilter !== null && p.categoryId !== categoryFilter)
      return false;

    return true;
  });



  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const pageProducts = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  function handleFilterChange(kw: string, st: string, catId: number | null) {
    setKeyword(kw);
    setStatusFilter(st);
    setCategoryFilter(catId);
    setPage(0);
  }

  function resetFilters() {
    handleFilterChange('', '', null);
  }

  const hasFilter = keyword !== '' || statusFilter !== '' || categoryFilter !== null;

  // modal helpers
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSavedImages([]);
    setPendingFiles([]);
    setPendingPreviews([]);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stock: p.stock ?? 0,
      status: p.status,
      allowCustomization: p.allowCustomization ?? false,
      categoryId: p.categoryId,
    });
    setSavedImages(p.images ?? []);
    setPendingFiles([]);
    setPendingPreviews([]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSavedImages([]);
    setPendingFiles([]);
    setPendingPreviews([]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setPendingFiles((prev) => [...prev, ...files]);
    setPendingPreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  }

  function removePending(index: number) {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteSavedImage(imageId: number) {
    try {
      await productApi.deleteImage(imageId);
      setSavedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      showToast('Xóa ảnh thất bại', 'error');
    }
  }

  async function uploadPendingFiles(productId: number) {
    for (const file of pendingFiles) {
      await productApi.uploadImage(productId, file);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast('Tên sản phẩm không được để trống', 'error'); return; }
    if (form.price <= 0) { showToast('Giá phải lớn hơn 0', 'error'); return; }

    setSaving(true);
    try {
      if (editingId !== null) {
        await productApi.update(editingId, form);
        if (pendingFiles.length > 0) {
          setUploadingImg(true);
          await uploadPendingFiles(editingId);
          setUploadingImg(false);
        }
        showToast('Cập nhật sản phẩm thành công', 'success');
      } else {
        const created = await productApi.create(form);
        if (pendingFiles.length > 0) {
          setUploadingImg(true);
          await uploadPendingFiles(created.id);
          setUploadingImg(false);
        }
        showToast('Thêm sản phẩm thành công', 'success');
      }
      closeModal();
      fetchProducts();
    } catch {
      setUploadingImg(false);
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await productApi.delete(id);
      showToast('Đã xóa sản phẩm', 'success');
      fetchProducts();
    } catch {
      showToast('Xóa thất bại', 'error');
    }
  }

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasFilter ? `${filtered.length} / ${allProducts.length} sản phẩm` : `${allProducts.length} sản phẩm`}
            </p>
          </div>
          <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            Thêm sản phẩm
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-48 focus-within:ring-2 focus-within:ring-amber-400">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
                type="text"
                value={keyword}
                onChange={(e) => handleFilterChange(e.target.value, statusFilter, categoryFilter)}
                placeholder="Tìm theo tên sản phẩm..."
                className="flex-1 text-sm focus:outline-none bg-transparent"
            />
            {keyword && (
                <button onClick={() => handleFilterChange('', statusFilter, categoryFilter)}>
                  <X size={13} className="text-gray-400 hover:text-gray-600" />
                </button>
            )}
          </div>

          <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(keyword, e.target.value, categoryFilter)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
            <option value="DISCONTINUED">Ngừng bán</option>
          </select>

          <select
              value={categoryFilter ?? ''}
              onChange={(e) => handleFilterChange(keyword, statusFilter, e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {hasFilter && (
              <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition whitespace-nowrap"
              >
                Xóa lọc
              </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
              <div className="py-20 text-center text-sm text-gray-400">Đang tải...</div>
          ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-400">
                {hasFilter ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Ảnh</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên sản phẩm</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Giá</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Tồn kho</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Custom</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Danh mục</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                  {pageProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5">
                          {p.images && p.images.length > 0 ? (
                              <img
                                  src={p.images[0].imageUrl}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                              />
                          ) : (
                              <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                <ImagePlus size={14} className="text-gray-300" />
                              </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-900 max-w-xs truncate">{p.name}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700">
                          {p.price.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700">{p.stock ?? 0}</td>
                        <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">
                          {p.allowCustomization ? '✓' : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{p.categoryName ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => openEdit(p)}
                                className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition"
                                title="Sửa"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                                title="Xóa"
                            >
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

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Trang {currentPage + 1} / {totalPages}
            </span>
                <div className="flex gap-1">
                  <button
                      disabled={currentPage === 0}
                      onClick={() => setPage(currentPage - 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setPage(currentPage + 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">
                    {editingId !== null ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                  </h2>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Tên sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="Nhập tên sản phẩm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        placeholder="Mô tả sản phẩm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Giá (VNĐ) <span className="text-rose-500">*</span>
                      </label>
                      <input
                          type="number"
                          min={0}
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tồn kho</label>
                      <input
                          type="number"
                          min={0}
                          value={form.stock}
                          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                      <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="ACTIVE">Đang bán</option>
                        <option value="OUT_OF_STOCK">Hết hàng</option>
                        <option value="DISCONTINUED">Ngừng bán</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục</label>
                      <select
                          value={form.categoryId ?? ''}
                          onChange={(e) =>
                              setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="">— Không chọn —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form.allowCustomization}
                        onChange={(e) => setForm({ ...form, allowCustomization: e.target.checked })}
                        className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-sm text-gray-700">Cho phép đặt hàng tùy chỉnh</span>
                  </label>

                  {/* Images */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Ảnh sản phẩm</label>
                    <div className="flex flex-wrap gap-2">
                      {savedImages.map((img) => (
                          <div key={img.id} className="relative group w-20 h-20">
                            <img
                                src={img.imageUrl}
                                alt=""
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => handleDeleteSavedImage(img.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                            >
                              <X size={10} />
                            </button>
                          </div>
                      ))}

                      {pendingPreviews.map((src, i) => (
                          <div key={`p-${i}`} className="relative group w-20 h-20">
                            <img
                                src={src}
                                alt=""
                                className="w-20 h-20 object-cover rounded-lg border border-amber-300 opacity-80"
                            />
                            <button
                                type="button"
                                onClick={() => removePending(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                            >
                              <X size={10} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-[9px] text-center py-0.5 rounded-b-lg">
                              Chờ lưu
                            </div>
                          </div>
                      ))}

                      <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 flex flex-col items-center justify-center gap-1 transition text-gray-400 hover:text-amber-500"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[10px]">Thêm ảnh</span>
                      </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {pendingFiles.length > 0 && (
                        <p className="mt-1.5 text-xs text-amber-600">
                          {pendingFiles.length} ảnh sẽ được upload khi bấm lưu
                        </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg transition"
                  >
                    {uploadingImg ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : editingId !== null ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
