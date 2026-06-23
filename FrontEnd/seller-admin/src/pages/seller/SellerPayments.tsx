import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { paymentApi, type SellerPayment, type SellerPaymentSummary } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const PAGE_SIZE = 10;

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  SUCCESS: 'Thành công',
  FAIL: 'Thất bại',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
  PARTIAL_REFUND: 'Hoàn một phần',
  EXPIRED: 'Hết hạn',
};

const PAYMENT_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAIL: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDED: 'bg-blue-100 text-blue-700',
  PARTIAL_REFUND: 'bg-indigo-100 text-indigo-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

const ORDER_CLASS: Record<string, string> = {
  UNPAID: 'bg-rose-100 text-rose-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-blue-100 text-blue-700',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
    </div>
  );
}

export default function SellerPayments() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<SellerPaymentSummary | null>(null);
  const [items, setItems] = useState<SellerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const load = async (nextPage = 0) => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.all([
        paymentApi.summary(),
        paymentApi.list(nextPage, PAGE_SIZE),
      ]);
      setSummary(sumRes);
      setItems(listRes.content);
      setPage(listRes.number);
      setTotalPages(listRes.totalPages);
    } catch {
      showToast('Không thể tải dữ liệu thanh toán', 'error');
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
    if (kw) {
      const haystack = [
        item.paymentCode,
        item.orderCode,
        item.buyerName,
        item.transactionId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    if (statusFilter && item.paymentStatus !== statusFilter) return false;
    if (methodFilter && item.paymentMethod !== methodFilter) return false;
    return true;
  });

  const hasFilter = keyword || statusFilter || methodFilter;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thanh toán và đối soát của shop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard label="Tổng giao dịch" value={summary ? summary.totalPayments.toString() : '—'} />
        <SummaryCard label="Đã thanh toán" value={summary ? summary.paidPayments.toString() : '—'} />
        <SummaryCard label="Chờ xử lý" value={summary ? summary.pendingPayments.toString() : '—'} />
        <SummaryCard label="Thất bại" value={summary ? summary.failedPayments.toString() : '—'} />
        <SummaryCard label="Hoàn tiền" value={summary ? summary.refundedPayments.toString() : '—'} />
        <SummaryCard label="Doanh thu" value={summary ? formatMoney(summary.totalRevenue) : '—'} sub={summary ? `${summary.totalOrders} đơn liên quan` : undefined} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-56 focus-within:ring-2 focus-within:ring-amber-400">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã giao dịch, mã đơn, người mua..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.keys(PAYMENT_LABEL).map((key) => (
            <option key={key} value={key}>{PAYMENT_LABEL[key]}</option>
          ))}
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="">Tất cả phương thức</option>
          <option value="ONLINE">Online</option>
          <option value="COD">COD</option>
        </select>

        {hasFilter && (
          <button
            onClick={() => {
              setKeyword('');
              setStatusFilter('');
              setMethodFilter('');
            }}
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
          <div className="py-20 text-center text-sm text-gray-400">Không có thanh toán nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã giao dịch</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Đơn hàng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Người mua</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Phương thức</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">TT thanh toán</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">TT đơn</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Số tiền</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-gray-900">{item.paymentCode}</div>
                      <div className="text-xs text-gray-400">#{item.paymentId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.orderCode}</div>
                      <div className="text-xs text-gray-400">{item.transactionId || 'Chưa có giao dịch'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.buyerName || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_CLASS[item.paymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                        {PAYMENT_LABEL[item.paymentStatus] ?? item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_CLASS[item.orderPaymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                        {item.orderPaymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatMoney(item.amount || 0)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{formatDate(item.createdAt)}</div>
                      <div className="text-xs text-gray-400">Paid: {formatDate(item.paidAt)}</div>
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
    </div>
  );
}
