import { useState, useEffect } from 'react';
import {
  X,
  PackageSearch,
  Package,
  Search,
  Check,
  Ban,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Tag,
  DollarSign,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { adminProductApi } from '../../api/sellerApi';
import type { Product, ProductStatus } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVE: 'Đã duyệt',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng bán',
  REJECTED: 'Đã từ chối',
};

const STATUS_CLASS: Record<ProductStatus, string> = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  OUT_OF_STOCK: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  DISCONTINUED: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  REJECTED: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
};

const PAGE_SIZE = 10;

function formatCurrency(val: number) {
  return new Intl.NumberFormat('vi-VN').format(val) + '₫';
}

export default function AdminProducts() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'ALL'>('PENDING_APPROVAL');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    loadProducts(0, filterStatus, search);
  }, []);

  const loadProducts = async (page: number, status: ProductStatus | 'ALL', keyword: string) => {
    try {
      setLoading(true);
      const res = await adminProductApi.list({
        page,
        size: PAGE_SIZE,
        status: status === 'ALL' ? undefined : status,
        keyword: keyword || undefined,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.number);
    } catch {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: ProductStatus | 'ALL') => {
    setFilterStatus(status);
    loadProducts(0, status, search);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      loadProducts(0, filterStatus, search);
    }
  };

  const handleApprove = async (p: Product) => {
    try {
      setActioningId(p.id);
      await adminProductApi.approve(p.id);
      showToast(`Đã duyệt sản phẩm: ${p.name}`);
      setDetailProduct(null);
      loadProducts(currentPage, filterStatus, search);
    } catch {
      showToast('Duyệt thất bại', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (p: Product) => {
    if (!window.confirm(`Bạn chắc chắn muốn từ chối sản phẩm này?`)) return;
    try {
      setActioningId(p.id);
      await adminProductApi.reject(p.id);
      showToast(`Đã từ chối sản phẩm: ${p.name}`);
      setDetailProduct(null);
      loadProducts(currentPage, filterStatus, search);
    } catch {
      showToast('Từ chối thất bại', 'error');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Duyệt Sản Phẩm</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng <span className="font-semibold text-gray-700">{totalElements}</span> sản phẩm trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: search + filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Tìm kiếm
          </label>
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tên sản phẩm, thương hiệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Trạng thái
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={filterStatus === 'ALL'}
              label="Tất cả"
              onClick={() => handleFilterChange('ALL')}
            />
            <FilterPill
              active={filterStatus === 'PENDING_APPROVAL'}
              label="Chờ duyệt"
              onClick={() => handleFilterChange('PENDING_APPROVAL')}
            />
            <FilterPill
              active={filterStatus === 'ACTIVE'}
              label="Đã duyệt"
              onClick={() => handleFilterChange('ACTIVE')}
            />
            <FilterPill
              active={filterStatus === 'REJECTED'}
              label="Đã từ chối"
              onClick={() => handleFilterChange('REJECTED')}
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
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
            <PackageSearch size={36} className="text-sky-500" />
          </div>
          <p className="text-gray-700 text-lg font-semibold mb-1">Không có sản phẩm nào</p>
          <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-gray-600 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-bold w-16">Ảnh</th>
                  <th className="px-4 py-3 font-bold">Tên sản phẩm</th>
                  <th className="px-4 py-3 font-bold">Seller</th>
                  <th className="px-4 py-3 font-bold">Danh mục</th>
                  <th className="px-4 py-3 font-bold text-right">Giá</th>
                  <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-center w-36">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition">
                    <td className="px-4 py-3">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0].imageUrl}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg ring-1 ring-gray-200 bg-white"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-50 rounded-lg ring-1 ring-gray-200 flex items-center justify-center text-gray-300">
                          <ImageOff size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-semibold text-gray-800 line-clamp-2">{p.name}</p>
                      {p.categoryName && <p className="text-xs text-gray-400 mt-0.5">{p.categoryName}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {p.sellerName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-sky-50 ring-1 ring-sky-100 text-sky-700 rounded-md px-2 py-0.5">
                        <Tag size={10} />
                        {p.categoryName || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetailProduct(p)}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {p.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={actioningId === p.id}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                              title="Duyệt"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              disabled={actioningId === p.id}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                              title="Từ chối"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                  onClick={() => loadProducts(currentPage - 1, filterStatus, search)}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition"
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <button
                  onClick={() => loadProducts(currentPage + 1, filterStatus, search)}
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

      {/* Modal chi tiết & duyệt */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetailProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Chi tiết sản phẩm</h2>
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{detailProduct.name}</h3>
                  <p className="text-sm text-sky-600 font-semibold mt-1">Seller: {detailProduct.sellerName}</p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm flex items-center gap-2"><DollarSign size={16} /> Giá bán</span>
                      <span className="font-bold text-rose-600">{formatCurrency(detailProduct.price)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm flex items-center gap-2"><Tag size={16} /> Danh mục</span>
                      <span className="font-semibold text-gray-800">{detailProduct.categoryName || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm flex items-center gap-2"><AlertTriangle size={16} /> Trạng thái</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASS[detailProduct.status]}`}>
                        {STATUS_LABEL[detailProduct.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm flex items-center gap-2"><Check size={16} /> Tồn kho</span>
                      <span className="font-semibold text-gray-800">{detailProduct.stock}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-gray-500 text-sm font-semibold uppercase">Hình ảnh</span>
                  {detailProduct.images && detailProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {detailProduct.images.map(img => (
                        <img key={img.id} src={img.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl ring-1 ring-gray-200" />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 ring-1 ring-gray-200">
                      <ImageOff size={24} />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {detailProduct.description && (
                <div>
                  <span className="text-gray-500 text-sm font-semibold uppercase">Mô tả sản phẩm</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-xl ring-1 ring-gray-100 text-gray-700 text-sm whitespace-pre-wrap">
                    {detailProduct.description}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
              <button
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-white transition"
              >
                Đóng
              </button>
              {detailProduct.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => handleReject(detailProduct)}
                    disabled={actioningId === detailProduct.id}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-60"
                  >
                    <Ban size={14} /> Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(detailProduct)}
                    disabled={actioningId === detailProduct.id}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-60"
                  >
                    <Check size={14} /> Duyệt sản phẩm
                  </button>
                </>
              )}
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
