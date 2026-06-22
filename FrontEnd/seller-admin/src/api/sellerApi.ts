const BASE_URL = 'http://localhost:8081/api';

function getToken() {
  return localStorage.getItem('seller_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- Types ----

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
export type ReviewStatus = 'VISIBLE' | 'HIDDEN';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type Period = 'day' | 'month' | 'quarter' | 'year';
export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface ProductImage {
  id: number;
  imageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  allowCustomization: boolean;
  categoryId: number | null;
  categoryName: string | null;
  sellerId: number;
  sellerName: string;
  averageRating: number;
  totalReviews: number;
  images: ProductImage[];
  createdAt: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  allowCustomization: boolean;
  categoryId: number | null;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  parentName: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface RecentOrder {
  orderCode: string;
  buyerName: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface TopProduct {
  productName: string;
  totalQuantity: number;
}

export interface DashboardData {
  revenueThisMonth: number;
  totalOrders: number;
  todayOrders: number;
  totalProducts: number;
  totalReviews: number;
  newReviews: number;
  orderStatusCounts: OrderStatusCount[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueByDay: RevenuePoint[];
}

// ---- Dashboard ----

export const sellerApi = {
  getDashboard: () => request<DashboardData>('/seller/dashboard'),
  getRevenue: (period: Period) => request<RevenuePoint[]>(`/seller/revenue?period=${period}`),
};

// ---- Products ----

export const productApi = {
  list: () => request<Page<Product>>('/seller/products'),

  create: (data: ProductForm) =>
    request<Product>('/seller/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductForm) =>
    request<Product>(`/seller/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetch(`${BASE_URL}/seller/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),

  uploadImage: (productId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${BASE_URL}/v1/products/upload/${productId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<ProductImage>;
    });
  },

  deleteImage: (imageId: number) =>
    fetch(`${BASE_URL}/v1/products/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
};

// ---- Orders ----

export interface Order {
  id: number;
  orderCode: string;
  totalPrice: number;
  totalItems: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  receiverName: string;
  receiverPhone: string;
  createdAt: string;
}

export const orderApi = {
  list: () => request<Order[]>('/seller/orders'),

  updateStatus: (id: number, status: OrderStatus) =>
    fetch(`${BASE_URL}/seller/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
};

// ---- Admin Reviews ----

export interface Review {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export const adminReviewApi = {
  list: () => request<Review[]>('/admin/reviews'),

  updateStatus: (id: number, status: ReviewStatus) =>
    fetch(`${BASE_URL}/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),

  delete: (id: number) =>
    fetch(`${BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
};

// ---- Categories ----

export const categoryApi = {
  list: () => request<Category[]>('/v1/categories'),
};
