import { useEffect, useRef, useState } from 'react';
import { Search, X, Star, ChevronLeft, ChevronRight, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminReviewApi } from '../../api/sellerApi';
import type { Review, ReviewStatus } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const STATUS_LABEL: Record<ReviewStatus, string> = {
  VISIBLE: 'Hiển thị',
  HIDDEN: 'Đã ẩn',
};

const STATUS_CLASS: Record<ReviewStatus, string> = {
  VISIBLE: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-gray-100 text-gray-500',
};

const PAGE_SIZE = 10;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminReviews() {
  const { showToast } = useToast();

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(0);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    adminReviewApi
      .list()
      .then(setAllReviews)
      .catch(() => showToast('Không thể tải danh sách đánh giá', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = allReviews.filter((r) => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      const match =
        r.userName.toLowerCase().includes(kw) ||
        r.productName.toLowerCase().includes(kw) ||
        r.comment?.toLowerCase().includes(kw);
      if (!match) return false;
    }
    if (statusFilter && r.status !== statusFilter) return false;
    if (ratingFilter && r.rating !== Number(ratingFilter)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const hasFilter = keyword || statusFilter || ratingFilter;

  function clearAllFilters() {
    setKeyword('');
    setStatusFilter('');
    setRatingFilter('');
    setPage(0);
  }

  async function handleToggleStatus(review: Review) {
    const newStatus: ReviewStatus = review.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    setActioningId(review.id);
    try {
      await adminReviewApi.updateStatus(review.id, newStatus);
      setAllReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r)),
      );
      showToast(
        `Đánh giá #${review.id} → ${STATUS_LABEL[newStatus]}`,
        'success',
      );
    } catch {
      showToast('Cập nhật trạng thái thất bại', 'error');
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete(review: Review) {
    if (!window.confirm(`Xóa đánh giá của "${review.userName}"? Hành động không thể hoàn tác.`))
      return;
    setActioningId(review.id);
    try {
      await adminReviewApi.delete(review.id);
      setAllReviews((prev) => prev.filter((r) => r.id !== review.id));
      showToast('Đã xóa đánh giá', 'success');
    } catch {
      showToast('Xóa đánh giá thất bại', 'error');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Quản lý đánh giá</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tên người dùng, sản phẩm, nội dung..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="VISIBLE">Hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(0); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả sao</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} sao</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
          >
            <X size={14} /> Xóa lọc
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500 self-center">
          {filtered.length} đánh giá
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Người dùng</th>
              <th className="px-4 py-3 text-left">Sản phẩm</th>
              <th className="px-4 py-3 text-left">Nội dung</th>
              <th className="px-4 py-3 text-center">Sao</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Không có đánh giá nào
                </td>
              </tr>
            ) : (
              pageItems.map((review) => {
                const isActioning = actioningId === review.id;
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{review.userName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                      {review.productName}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="truncate text-gray-700">{review.comment || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[review.status]}`}
                      >
                        {STATUS_LABEL[review.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(review.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(review)}
                          disabled={isActioning}
                          title={review.status === 'VISIBLE' ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 disabled:opacity-40 transition"
                        >
                          {review.status === 'VISIBLE' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(review)}
                          disabled={isActioning}
                          title="Xóa đánh giá"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 disabled:opacity-40 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
