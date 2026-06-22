import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { orderApi, type Order, type OrderStatus, type PaymentStatus, type OrderFilterForm } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
};

const PAGE_SIZE = 10;

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function SellerOrders() {
  const { showToast } = useToast();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async (nextPage = 0) => {
    setLoading(true);
    const filters: OrderFilterForm = {
      orderCode: keyword,
      status: statusFilter as OrderStatus | '',
      paymentStatus: paymentFilter as PaymentStatus | '',
    };
    try {
      const res = await orderApi.listSellerOrders(filters, nextPage, PAGE_SIZE);
      setAllOrders(res.content);
      setPage(res.number);
      setTotalPages(res.totalPages);
    } catch {
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFilter = keyword || statusFilter || paymentFilter;

  async function applyFilters() {
    await load(0);
  }

  function clearAllFilters() {
    setKeyword('');
    setStatusFilter('');
    setPaymentFilter('');
    load(0);
  }

  async function handleStatusChange(order: Order, newStatus: OrderStatus) {
    setUpdatingId(order.id);
    try {
      await orderApi.updateStatus(order.id, newStatus);
      setAllOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
      showToast(`Đã cập nhật đơn ${order.orderCode} → ${ORDER_STATUS_LABEL[newStatus]}`, 'success');
    } catch {
      showToast('Cập nhật trạng thái thất bại', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Mã đơn..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 w-56"
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">Tất cả trạng thái đơn</option>
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>

        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">Tất cả thanh toán</option>
          {(Object.keys(PAYMENT_LABEL) as PaymentStatus[]).map((s) => (
            <option key={s} value={s}>{PAYMENT_LABEL[s]}</option>
          ))}
        </select>

        <button onClick={applyFilters} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
          Lọc
        </button>

        {hasFilter && (
          <button onClick={clearAllFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-2">
            <X size={14} /> Xóa lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Người nhận</th>
              <th className="px-4 py-3 text-left">SĐT</th>
              <th className="px-4 py-3 text-right">Giá trị shop</th>
              <th className="px-4 py-3 text-center">SL SP shop</th>
              <th className="px-4 py-3 text-center">Trạng thái đơn</th>
              <th className="px-4 py-3 text-center">Thanh toán</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
            ) : allOrders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không có đơn hàng nào</td></tr>
            ) : (
              allOrders.map((order) => {
                const nextStatuses = NEXT_STATUSES[order.status];
                const isUpdating = updatingId === order.id;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-indigo-600">{order.orderCode}</td>
                    <td className="px-4 py-3">{order.receiverName}</td>
                    <td className="px-4 py-3 text-gray-500">{order.receiverPhone}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 text-center">{order.totalItems}</td>
                    <td className="px-4 py-3 text-center">
                      {nextStatuses ? (
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs disabled:opacity-50"
                        >
                          <option value={order.status}>{ORDER_STATUS_LABEL[order.status]}</option>
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {PAYMENT_LABEL[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => load(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => load(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
