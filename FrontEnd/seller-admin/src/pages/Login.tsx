import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const BASE_URL = 'http://localhost:8081/api';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Bước 1: lấy token
      const res = await fetch(`${BASE_URL}/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Sai email hoặc mật khẩu');
      const { token } = await res.json();

      // Bước 2: decode JWT lấy email (sub)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail: string = payload.sub;

      // Bước 3: lấy thông tin user
      const profileRes = await fetch(
        `${BASE_URL}/v1/customers/username/${encodeURIComponent(userEmail)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!profileRes.ok) throw new Error('Không thể tải thông tin tài khoản');
      const profile = await profileRes.json();

      if (profile.role !== 'SELLER' && profile.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền truy cập trang này');
      }

      login(token, {
        id: profile.id,
        fullName: profile.fullName ?? profile.email,
        email: profile.email,
        role: profile.role,
      });
      navigate('/seller/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow">
            <Hammer size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">HandMade</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Seller & Admin Portal</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              placeholder="seller@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
