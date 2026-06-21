import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  ArrowRight,
  Activity,
  PieChart as PieChartIcon,
  Trophy,
} from 'lucide-react';
import { sellerApi, type DashboardData, type RevenuePoint, type Period } from '../../api/sellerApi';
import { useToast } from '../../contexts/ToastContext';

// ---- constants ----
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

const PERIOD_LABELS: Record<Period, string> = {
  day: '30 ngày',
  month: '12 tháng',
  quarter: '8 quý',
  year: 'Theo năm',
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
  if (parts.length === 2) return `T${parseInt(parts[1])}/${parts[0].slice(2)}`;
  return dateStr;
}
function formatDateTime(dateTimeStr: string) {
  const d = new Date(dateTimeStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---- sub-components ----
interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
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

function SectionCard({
  icon,
  title,
  action,
  children,
  className = '',
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-600">{icon}</span>
          <p className="text-sm font-bold text-gray-800">{title}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function RevenueTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-semibold text-amber-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="text-gray-500 mb-0.5 truncate max-w-[180px]">{label}</p>
      <p className="font-semibold text-gray-800">{payload[0].value} sản phẩm</p>
    </div>
  );
}

// ---- main ----
export default function SellerDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('day');
  const [revenueChartData, setRevenueChartData] = useState<RevenuePoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const periodMounted = useRef(false);

  useEffect(() => {
    sellerApi.getDashboard()
      .then((d) => {
        setData(d);
        setRevenueChartData(d.revenueByDay);
      })
      .catch(() => showToast('Không thể tải dữ liệu dashboard', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!periodMounted.current) { periodMounted.current = true; return; }
    setRevenueLoading(true);
    sellerApi.getRevenue(period)
      .then(setRevenueChartData)
      .catch(() => showToast('Không thể tải dữ liệu doanh thu', 'error'))
      .finally(() => setRevenueLoading(false));
  }, [period, showToast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Đang tải dữ liệu...</div>;
  }
  if (!data) return null;

  const revenueData = revenueChartData.map((d) => ({
    date: formatDateLabel(d.date),
    revenue: Number(d.revenue),
  }));

  const orderPieData = data.orderStatusCounts
    .filter((s) => s.count > 0)
    .map((s) => ({ name: ORDER_STATUS_LABEL[s.status] ?? s.status, value: s.count, status: s.status }));

  const topProductsData = [...data.topProducts].reverse();

  const todayLabel = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hôm nay là <span className="font-medium text-gray-700">{todayLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Activity size={14} className="text-emerald-500" />
          <span>Dữ liệu được cập nhật theo thời gian thực</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp size={22} />}
          label="Doanh thu tháng này"
          value={shortCurrency(data.revenueThisMonth)}
          sub={formatCurrency(data.revenueThisMonth)}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          accentBar="bg-emerald-500"
        />
        <KpiCard
          icon={<ShoppingBag size={22} />}
          label="Tổng đơn hàng"
          value={data.totalOrders.toString()}
          sub={data.todayOrders > 0 ? `+${data.todayOrders} đơn hôm nay` : 'Hôm nay chưa có đơn'}
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          accentBar="bg-amber-500"
        />
        <KpiCard
          icon={<Package size={22} />}
          label="Sản phẩm"
          value={data.totalProducts.toString()}
          iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
          accentBar="bg-sky-500"
        />
        <KpiCard
          icon={<Star size={22} />}
          label="Đánh giá mới"
          value={data.newReviews.toString()}
          sub={`Tổng ${data.totalReviews} đánh giá`}
          iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
          accentBar="bg-violet-500"
        />
      </div>

      {/* Row 2: Revenue line chart + Order status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          }
        >
          {revenueLoading ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">Đang tải...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tickFormatter={shortCurrency} tick={{ fontSize: 11 }} width={48} />
                <Tooltip content={<RevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon={<PieChartIcon size={16} />} title="Trạng thái đơn hàng">
          {orderPieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">Chưa có đơn hàng</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
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

      {/* Row 3: Recent orders + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          icon={<ShoppingBag size={16} />}
          title="Đơn hàng mới nhất"
          action={
            <Link
              to="/seller/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
            >
              Xem tất cả <ArrowRight size={12} />
            </Link>
          }
        >
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">Chưa có đơn hàng</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentOrders.map((o) => (
                <div
                  key={o.orderCode}
                  className="flex items-center justify-between py-2.5 hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-gray-800 truncate">{o.orderCode}</p>
                    <p className="text-xs text-gray-400 truncate">{o.buyerName} · {formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(o.totalPrice)}</p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
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

        <SectionCard icon={<Trophy size={16} />} title="Top sản phẩm bán chạy">
          {topProductsData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={topProductsData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 10 }}
                  width={110}
                  tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="totalQuantity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
