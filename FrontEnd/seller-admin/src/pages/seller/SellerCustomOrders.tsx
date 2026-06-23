import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search, X } from 'lucide-react';
import { orderApi, type OrderDetail, type SellerCustomOrder, type OrderItemDetail } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const PAGE_SIZE = 10;

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CustomItemCard({ item }: { item: OrderItemDetail }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{item.productName || `Sản phẩm #${item.productId}`}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            SL: {item.quantity} | Giá: {formatMoney(item.price)} | Phụ phí custom: {formatMoney(item.customizationPrice || 0)}
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
          Custom
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-1">Nội dung</p>
          <p className="text-gray-700 whitespace-pre-wrap">{item.customText || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Ghi chú</p>
          <p className="text-gray-700 whitespace-pre-wrap">{item.customNote || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Ảnh</p>
          {item.customImage ? (
            <a href={item.customImage} target="_blank" rel="noreferrer" className="text-amber-600 break-all">
              Xem ảnh
            </a>
          ) : (
            <p className="text-gray-700">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerCustomOrders() {
  const { showToast } = useToast();
  const [items, setItems] = useState<SellerCustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const load = async (nextPage = 0) => {
    setLoading(true);
    try {
      const res = await orderApi.listSellerCustomOrders(nextPage, PAGE_SIZE);
      setItems(res.content);
      setPage(res.number);
      setTotalPages(res.totalPages);
    } catch {
      showToast('Không thể tải danh sách đơn custom', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter((item) => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    return [
      item.orderCode,
      item.buyerName,
      item.orderStatus,
      item.paymentStatus,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(kw);
  });

  async function openDetail(orderId: number) {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await orderApi.getSellerCustomOrderDetail(orderId);
      setDetail(res);
    } catch {
      showToast('Không thể tải chi tiết đơn custom', 'error');
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn custom</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý đơn hàng theo yêu cầu handmade</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-56 focus-within:ring-2 focus-within:ring-amber-400">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã đơn, người mua, trạng thái..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
        </div>
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">Không có đơn custom nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã đơn</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Khách</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">SL custom</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Giá custom</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Thanh toán</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày tạo</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{item.orderCode}</td>
                    <td className="px-4 py-3 text-gray-700">{item.buyerName || '—'}</td>
                    <td className="px-4 py-3 text-center">{item.customItems}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatMoney(item.customAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {ORDER_STATUS_LABEL[item.orderStatus] || item.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {PAYMENT_LABEL[item.paymentStatus] || item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openDetail(item.orderId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition"
                      >
                        <Eye size={14} />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white rounded-xl border border-gray-200">
          <span className="text-xs text-gray-400">Trang {page + 1} / {totalPages}</span>
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

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Chi tiết đơn custom</h2>
                <p className="text-sm text-gray-500">Xem yêu cầu handmade của khách</p>
              </div>
              <button onClick={() => setDetailOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              {detailLoading ? (
                <div className="py-16 text-center text-sm text-gray-400">Đang tải chi tiết...</div>
              ) : detail ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">Mã đơn</p>
                      <p className="font-mono font-semibold text-gray-900 mt-1">{detail.orderCode}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">Khách</p>
                      <p className="font-semibold text-gray-900 mt-1">{detail.receiverName}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">Thanh toán</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {PAYMENT_LABEL[detail.paymentStatus] || detail.paymentStatus}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                    <p className="text-xs text-gray-400 mb-1">Địa chỉ giao hàng</p>
                    <p className="text-sm text-gray-700">{detail.shippingAddress}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-800">Danh sách item custom</h3>
                    {detail.items.filter((i) => i.customized).length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-400">Đơn này không có item custom</div>
                    ) : (
                      <div className="space-y-3">
                        {detail.items
                          .filter((i) => i.customized)
                          .map((item) => (
                            <CustomItemCard key={item.id} item={item} />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-sm text-gray-400">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
