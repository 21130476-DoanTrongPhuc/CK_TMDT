import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  CreditCard,
  Star,
  LogOut,
  Menu,
  X,
  Bell,
  Hammer,
  Users,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SELLER_NAV = [
  { to: '/seller/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/seller/products', label: 'Sản phẩm', icon: Package },
  { to: '/seller/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/seller/custom-orders', label: 'Custom orders', icon: ClipboardList },
  { to: '/seller/payments', label: 'Thanh toán', icon: CreditCard },
  { to: '/seller/promotions', label: 'Khuyến mãi', icon: Tag },
];

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Duyệt sản phẩm', icon: CheckSquare },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
];

const ADMIN_EXTRA_NAV = [
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
];

function SidebarContent({
  onItemClick,
  onLogout,
}: {
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const navItems = user?.role === 'ADMIN' ? [...ADMIN_NAV, ...ADMIN_EXTRA_NAV] : SELLER_NAV;

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
        <Link
          to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'}
          className="flex items-center gap-2.5"
          onClick={onItemClick}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
            <Hammer size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-gray-900 text-sm">HandMade</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              {user?.role === 'ADMIN' ? 'Admin Panel' : 'Seller Panel'}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-3 mb-2">
          Quản lý
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 pt-3 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </>
  );
}

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-white flex flex-col md:hidden shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg z-10"
            >
              <X size={18} />
            </button>
            <SidebarContent
              onItemClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Main wrapper */}
      <div className="md:ml-60 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm text-gray-500 hidden sm:block">
              Chào mừng, <span className="font-semibold text-gray-800">{user?.fullName}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <Bell size={18} />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm shrink-0">
                {user?.fullName?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate max-w-36">
                  {user?.fullName}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-amber-600 font-bold">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
