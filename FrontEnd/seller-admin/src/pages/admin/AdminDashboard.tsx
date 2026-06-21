import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  Activity,
  PieChart as PieChartIcon,
  Trophy,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { adminDashboardApi } from '../../api/sellerApi';
import type { AdminDashboardData, Period } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

// ---- màu sắc & nhãn ----
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

// ---- helpers ----
function formatCurrency(val: number) {
  return val.toLocaleString('vi-VN') + '₫';
}

function shortCurrency(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

function formatDateLabel(dateStr: string) {
  if (dateStr.includes('Q')) {
    const [year, q] = dateStr.split('-');
    return `${q}/${year.slice(2)}`;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return `T${parseInt(parts[1], 10)}/${parts[0].slice(2)}`;
  return dateStr;
}

function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr) return '';
  const d = new Date(dateTimeStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---- KPI Card ----
interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  accentBar: string;
}
function KpiCard({ icon, label, value, sub, iconBg, accentBar }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentBar}`} />
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
          <p className="text-2xl font-extrabold text-gray-800 mt-0.5 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ---- Section Card wrapper ----
function SectionCard({
  icon,
  title,
  action,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sky-600">{icon}</span>
          <p className="text-sm font-bold text-gray-800">{title}</p>
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-semibold text-sky-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="text-gray-500 mb-0.5 truncate max-w-[180px]">{label}</p>
      <p className="font-semibold text-gray-800">{payload[0].value} đã bán</p>
    </div>
  );
}

const PERIOD_LABELS: Record<Period, string> = {
  day: '30 ngày',
  month: '12 tháng',
  quarter: '8 quý',
  year: 'Theo năm',
};

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('day');
  const [revenueChartData, setRevenueChartData] = useState<{ date: string; revenue: number }[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    adminDashboardApi.getDashboard()
      .then((d) => {
        setData(d);
        setRevenueChartData(d.revenueByDay || []);
      })
      .catch(() => showToast('Không thể tải dữ liệu dashboard', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (loading) return;
    setRevenueLoading(true);
    adminDashboardApi.getRevenue(period)
      .then(setRevenueChartData)
      .catch(() => showToast('Không thể tải dữ liệu doanh thu', 'error'))
      .finally(() => setRevenueLoading(false));
  }, [period, loading, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
      </div>
    );
  }
  if (!data) return null;

  const revenueData = revenueChartData.map((d) => ({
    date: formatDateLabel(d.date),
    revenue: Number(d.revenue),
  }));

  const orderPieData = (data.orderStatusCounts || [])
    .filter((s) => s.count > 0)
    .map((s) => ({ name: ORDER_STATUS_LABEL[s.status] ?? s.status, value: s.count, status: s.status }));

  const topProductsData = [...(data.topProducts || [])].reverse(); 

  const todayLabel = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hôm nay là <span className="font-medium text-gray-700">{todayLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Activity size={14} className="text-emerald-500" />
          <span>Dữ liệu được cập nhật theo thời gian thực</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp size={22} />}
          label="Doanh thu tháng này"
          value={shortCurrency(Number(data.revenueThisMonth))}
          sub={formatCurrency(Number(data.revenueThisMonth))}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          accentBar="bg-emerald-500"
        />
        <KpiCard
          icon={<ShoppingBag size={22} />}
          label="Tổng đơn hàng"
          value={data.totalOrders}
          sub={data.todayOrders > 0 ? `+${data.todayOrders} đơn hôm nay` : 'Hôm nay chưa có đơn'}
          iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
          accentBar="bg-sky-500"
        />
        <KpiCard
          icon={<Package size={22} />}
          label="Tổng sản phẩm"
          value={data.totalProducts}
          sub={data.pendingApprovalProducts > 0 ? `${data.pendingApprovalProducts} sản phẩm chờ duyệt` : 'Đã duyệt tất cả'}
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          accentBar="bg-amber-500"
        />
        <KpiCard
          icon={<Users size={22} />}
          label="Người dùng & Seller"
          value={data.totalUsers}
          sub={`${data.totalSellers} Seller đang hoạt động`}
          iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
          accentBar="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[360px]">
        <SectionCard
          icon={<TrendingUp size={16} />}
          title="Doanh thu"
          className="lg:col-span-2"
          action={
            <div className="flex gap-1 flex-wrap">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    period === p
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          }
        >
          {revenueLoading ? (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">Đang tải...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={shortCurrency} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon={<PieChartIcon size={16} />} title="Trạng thái đơn hàng">
          {orderPieData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">Chưa có đơn hàng</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderPieData.map((entry) => (
                    <Cell key={entry.status} fill={ORDER_STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} đơn`, 'tổng']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[360px]">
        <SectionCard icon={<Trophy size={16} />} title="Top sản phẩm bán chạy">
          {topProductsData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProductsData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 20) + '…' : v}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="totalQuantity" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          icon={<ShoppingBag size={16} />}
          title="Đơn hàng mới nhất"
          action={
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
            >
              Xem tất cả <ArrowRight size={12} />
            </Link>
          }
        >
          {(!data.recentOrders || data.recentOrders.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-300">Chưa có đơn hàng</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 flex flex-col h-full overflow-y-auto pr-2">
              {data.recentOrders.map((o) => (
                <div
                  key={o.orderCode}
                  className="flex items-center justify-between py-3 hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-bold text-gray-800 truncate">#{o.orderCode}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{o.buyerName} · {formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-rose-600">{formatCurrency(o.totalPrice)}</p>
                    <span
                      className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: (ORDER_STATUS_COLORS[o.status] ?? '#94a3b8') + '20',
                        color: ORDER_STATUS_COLORS[o.status] ?? '#94a3b8',
                      }}
                    >
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
