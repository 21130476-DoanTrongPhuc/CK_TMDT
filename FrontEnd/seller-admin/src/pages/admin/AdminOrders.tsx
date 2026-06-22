import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Search,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CreditCard,
  MapPin,
  User,
  Eye,
  PackageCheck
} from 'lucide-react';
import { adminOrderApi } from '../../api/sellerApi';
import type { AdminOrder, AdminOrderDetail, OrderStatus, PaymentStatus } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_META: Record<OrderStatus, { badge: string; icon: React.ReactNode }> = {
  PENDING: {
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    icon: <Clock size={12} />,
  },
  CONFIRMED: {
    badge: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
    icon: <CheckCircle2 size={12} />,
  },
  SHIPPED: {
    badge: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
    icon: <Truck size={12} />,
  },
  COMPLETED: {
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    icon: <PackageCheck size={12} />,
  },
  CANCELLED: {
    badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    icon: <XCircle size={12} />,
  },
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
};

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  UNPAID: 'text-amber-600',
  PARTIALLY_PAID: 'text-sky-600',
  PAID: 'text-emerald-600',
  REFUNDED: 'text-gray-600',
};

const PAGE_SIZE = 10;

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + '₫';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminOrders() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadOrders(0);
  }, []);

  const loadOrders = async (page: number) => {
    try {
      setLoading(true);
      const res = await adminOrderApi.list({
        page,
        size: PAGE_SIZE,
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.number);
    } catch {
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      const detail = await adminOrderApi.getById(orderId);
      setSelectedOrder(detail);
    } catch {
      showToast('Không thể tải chi tiết đơn hàng', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn Hàng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Hệ thống hiện có tổng cộng <span className="font-semibold text-gray-700">{totalElements}</span> đơn hàng
            </p>
          </div>
        </div>
      </div>

      {/* Note for Admin */}
      <div className="bg-sky-50 border border-sky-100 text-sky-800 px-4 py-3 rounded-xl flex gap-3 text-sm">
        <Eye className="mt-0.5 shrink-0" size={16} />
        <div>
          <p className="font-semibold">Chế độ Chỉ xem (Read-only)</p>
          <p>Admin chỉ có quyền xem chi tiết đơn hàng toàn hệ thống để giám sát. Việc cập nhật trạng thái đơn hàng (Duyệt, Giao hàng, Hủy) là nghiệp vụ của Seller sở hữu sản phẩm đó.</p>
        </div>
      </div>

      {/* Table card */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-3" />
          Đang tải...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
            <ShoppingBag size={36} className="text-sky-500" />
          </div>
          <p className="text-gray-700 text-lg font-semibold mb-1">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Mã đơn</th>
                  <th className="px-4 py-3 text-left font-bold">Khách hàng</th>
                  <th className="px-4 py-3 text-left font-bold">Tổng tiền</th>
                  <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-bold">Thanh toán</th>
                  <th className="px-4 py-3 text-left font-bold">Ngày đặt</th>
                  <th className="px-4 py-3 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const meta = STATUS_META[order.status] || {
                    badge: 'bg-gray-100 text-gray-700',
                    icon: null,
                  };
                  return (
                    <tr key={order.id} className="hover:bg-sky-50/30 transition">
                      <td className="px-4 py-3 font-mono font-medium text-gray-800 whitespace-nowrap">
                        #{order.orderCode}
                      </td>
                      <td className="px-4 py-3 text-gray-700 inline-flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        <div className="flex flex-col">
                          <span>{order.receiverName}</span>
                          <span className="text-xs text-gray-400">{order.receiverPhone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-600 whitespace-nowrap">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
                          {meta.icon}
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        <span className={PAYMENT_STATUS_COLOR[order.paymentStatus] || 'text-gray-600'}>
                          {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenModal(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                          disabled={loadingDetail}
                        >
                          <Eye size={13} /> Chi tiết
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
                  onClick={() => loadOrders(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition"
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <button
                  onClick={() => loadOrders(currentPage + 1)}
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

      {/* Modal chi tiết đơn hàng (Read-Only) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-100 font-mono">#{selectedOrder.orderCode}</p>
                <h2 className="text-lg font-bold text-white">Chi tiết đơn hàng</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Trạng thái hiện tại
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[selectedOrder.status]?.badge || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_META[selectedOrder.status]?.icon}
                  {STATUS_LABEL[selectedOrder.status] ?? selectedOrder.status}
                </span>
              </div>

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-3">
                <InfoBox
                  icon={<User size={14} className="text-sky-600" />}
                  label="Khách hàng"
                  value={`${selectedOrder.receiverName} - ${selectedOrder.receiverPhone}`}
                />
                <InfoBox
                  icon={<Clock size={14} className="text-sky-600" />}
                  label="Ngày đặt"
                  value={formatDate(selectedOrder.createdAt)}
                />
                <InfoBox
                  icon={<CreditCard size={14} className="text-sky-600" />}
                  label="Thanh toán"
                  value={PAYMENT_STATUS_LABEL[selectedOrder.paymentStatus] ?? selectedOrder.paymentStatus}
                  valueClass={PAYMENT_STATUS_COLOR[selectedOrder.paymentStatus]}
                />
                <InfoBox
                  className="col-span-2"
                  icon={<MapPin size={14} className="text-sky-600" />}
                  label="Địa chỉ giao hàng"
                  value={selectedOrder.shippingAddress}
                />
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">
                  Sản phẩm ({selectedOrder.items.length})
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50/70 ring-1 ring-gray-100 rounded-xl p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">Sản phẩm ID: {item.productId}</span>
                        {item.customized && (
                          <div className="text-xs text-sky-600 mt-1">
                            {item.customText && <p>Text: {item.customText}</p>}
                            {item.customNote && <p>Ghi chú: {item.customNote}</p>}
                            {item.customImage && <a href={item.customImage} target="_blank" rel="noreferrer" className="underline">Xem ảnh custom</a>}
                            <p>Phí thiết kế: {formatCurrency(item.customizationPrice || 0)}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">x{item.quantity} × {formatCurrency(item.price)}</p>
                        <p className="text-sm font-bold text-rose-600 mt-1">
                          {formatCurrency(item.quantity * item.price + (item.customizationPrice || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-amber-50 ring-1 ring-rose-100 rounded-xl px-4 py-3 mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Đã thanh toán</span>
                    <span className="text-sm font-medium text-emerald-600">{formatCurrency(selectedOrder.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-rose-200/50">
                    <span className="text-sm text-gray-600">Còn lại</span>
                    <span className="text-sm font-medium text-rose-600">{formatCurrency(selectedOrder.remainingAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-800">Tổng cộng</span>
                    <span className="text-xl font-extrabold text-rose-600">
                      {formatCurrency(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lịch sử trạng thái */}
              {selectedOrder.statusHistories && selectedOrder.statusHistories.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">
                    Lịch sử cập nhật
                  </p>
                  <div className="space-y-3 pl-2 border-l-2 border-sky-100">
                    {selectedOrder.statusHistories.map((h, i) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-white" />
                        <p className="text-xs font-semibold text-gray-800">
                          {STATUS_LABEL[h.oldStatus as OrderStatus] || h.oldStatus} ➔ {STATUS_LABEL[h.newStatus as OrderStatus] || h.newStatus}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(h.changedAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  italic,
  valueClass,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  italic?: boolean;
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={`bg-gray-50/60 ring-1 ring-gray-100 rounded-lg px-3 py-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
        {icon}
        <span className="uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className={`text-sm font-medium text-gray-800 ${italic ? 'italic' : ''} ${valueClass || ''}`}>
        {value}
      </p>
    </div>
  );
}
