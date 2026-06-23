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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
export type ReviewStatus = 'VISIBLE' | 'HIDDEN';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentStatusOrder = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
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

export interface SellerPaymentSummary {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface SellerPayment {
  paymentId: number;
  paymentCode: string;
  orderId: number | null;
  orderCode: string | null;
  buyerName: string | null;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: PaymentStatus;
  orderPaymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  orderStatus: OrderStatus;
  amount: number;
  transactionId: string | null;
  createdAt: string;
  paidAt: string | null;
}

export const sellerApi = {
  getDashboard: () => request<DashboardData>('/seller/dashboard'),
  getRevenue: (period: Period) => request<RevenuePoint[]>(`/seller/revenue?period=${period}`),
};

export const productApi = {
  list: () => request<Product[]>('/v1/seller/custom-products'),

  create: (data: ProductForm) =>
    request<Product>('/v1/seller/custom-products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductForm) =>
    request<Product>(`/v1/seller/custom-products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetch(`${BASE_URL}/v1/seller/custom-products/${id}`, {
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

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string | null;
  quantity: number;
  price: number;
  customized: boolean | null;
  customizationPrice: number | null;
  customText: string | null;
  customNote: string | null;
  customImage: string | null;
}

export interface OrderDetail {
  id: number;
  orderCode: string;
  userId: number;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemDetail[];
}

export interface SellerCustomOrder {
  orderId: number;
  orderCode: string;
  buyerName: string | null;
  customItems: number;
  customAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatusOrder;
  createdAt: string;
}

export interface OrderFilterForm {
  orderCode?: string;
  status?: OrderStatus | '';
  paymentStatus?: PaymentStatus | '';
  fromDate?: string | null;
  toDate?: string | null;
}

export const orderApi = {
  listSellerOrders: (filters: OrderFilterForm = {}, page = 0, size = 10) =>
    request<Page<Order>>(`/v1/orders/seller-orders?page=${page}&size=${size}`, {
      method: 'POST',
      body: JSON.stringify({
        orderCode: filters.orderCode?.trim() || null,
        status: filters.status || null,
        paymentStatus: filters.paymentStatus || null,
        fromDate: filters.fromDate || null,
        toDate: filters.toDate || null,
      }),
    }),

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

  listSellerCustomOrders: (page = 0, size = 10) =>
    request<Page<SellerCustomOrder>>(`/v1/seller/custom-orders?page=${page}&size=${size}`),

  getSellerCustomOrderDetail: (orderId: number) =>
    request<OrderDetail>(`/v1/seller/custom-orders/${orderId}`),
};

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

export const categoryApi = {
  list: () => request<Category[]>('/v1/categories'),
};

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: PromotionType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  sellerId: number | null;
  sellerName: string | null;
  productId: number | null;
  productName: string | null;
}

export interface PromotionForm {
  name: string;
  code: string;
  discountType: PromotionType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  startDate: string;
  endDate: string;
  active: boolean;
  productId: number | null;
}

function toPromotionPayload(data: PromotionForm) {
  return {
    ...data,
    startDate: data.startDate.includes('T') ? data.startDate : `${data.startDate}T00:00:00`,
    endDate: data.endDate.includes('T') ? data.endDate : `${data.endDate}T23:59:59`,
  };
}

export const promotionApi = {
  list: (page = 0, size = 8) => request<Page<Promotion>>(`/v1/seller/promotions?page=${page}&size=${size}`),

  create: (data: PromotionForm) =>
    request<Promotion>('/v1/seller/promotions', {
      method: 'POST',
      body: JSON.stringify(toPromotionPayload(data)),
    }),

  update: (id: number, data: PromotionForm) =>
    request<Promotion>(`/v1/seller/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toPromotionPayload(data)),
    }),

  delete: (id: number) =>
    fetch(`${BASE_URL}/v1/seller/promotions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),

  toggleActive: (id: number, active: boolean) =>
    request<Promotion>(`/v1/seller/promotions/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify(active),
    }),
};

export const paymentApi = {
  summary: () => request<SellerPaymentSummary>('/v1/seller/payments/summary'),
  list: (page = 0, size = 10) =>
    request<Page<SellerPayment>>(`/v1/seller/payments?page=${page}&size=${size}`),
};
