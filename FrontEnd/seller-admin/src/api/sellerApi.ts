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

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

/* ===========================================================
   TYPES
=========================================================== */

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';

export type ReviewStatus =
    | 'VISIBLE'
    | 'HIDDEN';

export type PaymentStatus =
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'REFUNDED';

export type PaymentStatusOrder =
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'REFUNDED';

export type Period =
    | 'day'
    | 'month'
    | 'quarter'
    | 'year';

export type ProductStatus =
    | 'PENDING_APPROVAL'
    | 'ACTIVE'
    | 'OUT_OF_STOCK'
    | 'DISCONTINUED'
    | 'REJECTED';

export type PromotionType =
    | 'PERCENTAGE'
    | 'FIXED_AMOUNT';

export type UserRole =
    | 'USER'
    | 'ADMIN'
    | 'SELLER';

export type UserStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'BANNED';

/* ===========================================================
   PRODUCT
=========================================================== */

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

/* ===========================================================
   CATEGORY
=========================================================== */

export interface Category {
  id: number;
  name: string;

  parentId: number | null;
  parentName: string | null;
}

/* ===========================================================
   PAGE
=========================================================== */

export interface Page<T> {
  content: T[];

  totalElements: number;
  totalPages: number;

  number: number;
  size: number;
}

/* ===========================================================
   DASHBOARD
=========================================================== */

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

/* ===========================================================
   PAYMENT
=========================================================== */

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

  orderPaymentStatus: PaymentStatusOrder;

  orderStatus: OrderStatus;

  amount: number;

  transactionId: string | null;

  createdAt: string;

  paidAt: string | null;
}

/* ===========================================================
   ORDER
=========================================================== */

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

/* ===========================================================
   PROMOTION
=========================================================== */

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

/* ===========================================================
   SELLER DASHBOARD
=========================================================== */

export const sellerApi = {
  getDashboard: () =>
      request<DashboardData>('/seller/dashboard'),

  getRevenue: (period: Period) =>
      request<RevenuePoint[]>(
          `/seller/revenue?period=${period}`
      ),
};

/* ===========================================================
   PRODUCT API
=========================================================== */

export const productApi = {
  // Danh sách sản phẩm seller
  list: () =>
      request<Product[]>(
          '/seller/products',
          {
              method: 'GET',
              headers: {
                  Authorization: `Bearer ${getToken()}`,
              },
          }
      ),

  // Tạo sản phẩm
  create: (data: ProductForm) =>
      request<Product>(
          '/v1/seller/custom-products',
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
      ),

  // Cập nhật
  update: (id: number, data: ProductForm) =>
      request<Product>(
          `/v1/seller/custom-products/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
      ),

  // Xóa
  delete: (id: number) =>
      fetch(
          `${BASE_URL}/v1/seller/custom-products/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),

  // Upload ảnh
  uploadImage: (
      productId: number,
      file: File
  ) => {
    const fd = new FormData();

    fd.append('file', file);

    return fetch(
        `${BASE_URL}/v1/products/upload/${productId}/images`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: fd,
        }
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res.json() as Promise<ProductImage>;
    });
  },

  // Xóa ảnh
  deleteImage: (imageId: number) =>
      fetch(
          `${BASE_URL}/v1/products/images/${imageId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),
};

/* ===========================================================
   PROMOTION HELPER
=========================================================== */

function toPromotionPayload(
    data: PromotionForm
) {
  return {
    ...data,

    startDate: data.startDate.includes('T')
        ? data.startDate
        : `${data.startDate}T00:00:00`,

    endDate: data.endDate.includes('T')
        ? data.endDate
        : `${data.endDate}T23:59:59`,
  };
}

/* ===========================================================
   ORDER API
=========================================================== */

export const orderApi = {
  /**
   * Danh sách đơn hàng của seller (có filter)
   */
  listSellerOrders: (
      filters: OrderFilterForm = {},
      page = 0,
      size = 10
  ) =>
      request<Page<Order>>(
          `/v1/orders/seller-orders?page=${page}&size=${size}`,
          {
            method: 'POST',
            body: JSON.stringify({
              orderCode: filters.orderCode?.trim() || null,
              status: filters.status || null,
              paymentStatus: filters.paymentStatus || null,
              fromDate: filters.fromDate || null,
              toDate: filters.toDate || null,
            }),
          }
      ),

  /**
   * Đổi trạng thái đơn hàng
   */
  updateStatus: (
      id: number,
      status: OrderStatus
  ) =>
      fetch(
          `${BASE_URL}/seller/orders/${id}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              status,
            }),
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),

  /**
   * Danh sách Custom Orders
   */
  listSellerCustomOrders: (
      page = 0,
      size = 10
  ) =>
      request<Page<SellerCustomOrder>>(
          `/v1/seller/custom-orders?page=${page}&size=${size}`
      ),

  /**
   * Chi tiết Custom Order
   */
  getSellerCustomOrderDetail: (
      orderId: number
  ) =>
      request<OrderDetail>(
          `/v1/seller/custom-orders/${orderId}`
      ),

  /**
   * Danh sách đơn hàng cũ
   * (API cũ vẫn giữ để tương thích)
   */
  list: () =>
      request<Order[]>(
          '/seller/orders'
      ),
};

/* ===========================================================
   PAYMENT API
=========================================================== */

export const paymentApi = {
  /**
   * Thống kê thanh toán
   */
  summary: () =>
      request<SellerPaymentSummary>(
          '/v1/seller/payments/summary'
      ),

  /**
   * Danh sách thanh toán
   */
  list: (
      page = 0,
      size = 10
  ) =>
      request<Page<SellerPayment>>(
          `/v1/seller/payments?page=${page}&size=${size}`
      ),
};

/* ===========================================================
   PROMOTION API
=========================================================== */

export const promotionApi = {
  /**
   * Danh sách mã giảm giá
   */
  list: (
      page = 0,
      size = 8
  ) =>
      request<Page<Promotion>>(
          `/v1/seller/promotions?page=${page}&size=${size}`
      ),

  /**
   * Tạo mã giảm giá
   */
  create: (data: PromotionForm) =>
      request<Promotion>(
          '/v1/seller/promotions',
          {
            method: 'POST',
            body: JSON.stringify(
                toPromotionPayload(data)
            ),
          }
      ),

  /**
   * Cập nhật mã giảm giá
   */
  update: (
      id: number,
      data: PromotionForm
  ) =>
      request<Promotion>(
          `/v1/seller/promotions/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(
                toPromotionPayload(data)
            ),
          }
      ),

  /**
   * Xóa mã giảm giá
   */
  delete: (id: number) =>
      fetch(
          `${BASE_URL}/v1/seller/promotions/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),

  /**
   * Bật / tắt mã giảm giá
   */
  toggleActive: (
      id: number,
      active: boolean
  ) =>
      request<Promotion>(
          `/v1/seller/promotions/${id}/active`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              active,
            }),
          }
      ),
};

/* ===========================================================
   CATEGORY API
=========================================================== */

export const categoryApi = {
  list: () =>
      request<Category[]>(
          '/v1/categories'
      ),
};

/* ===========================================================
   ADMIN DASHBOARD
=========================================================== */

export interface AdminDashboardData {
  totalUsers: number;

  totalSellers: number;

  totalProducts: number;

  totalOrders: number;

  revenueThisMonth: number;

  todayOrders: number;

  pendingApprovalProducts: number;

  orderStatusCounts: OrderStatusCount[];

  recentOrders: RecentOrder[];

  topProducts: TopProduct[];

  revenueByDay: RevenuePoint[];
}

export const adminDashboardApi = {
  /**
   * Dashboard Admin
   */
  getDashboard: () =>
      request<AdminDashboardData>(
          '/admin/dashboard'
      ),

  /**
   * Doanh thu
   */
  getRevenue: (period: Period) =>
      request<RevenuePoint[]>(
          `/admin/revenue?period=${period}`
      ),
};

/* ===========================================================
   ADMIN PRODUCT API
=========================================================== */

export const adminProductApi = {
  /**
   * Danh sách sản phẩm
   */
  list: (params?: {
    status?: ProductStatus;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const q = new URLSearchParams();

    if (params?.status) {
      q.set('status', params.status);
    }

    if (params?.keyword) {
      q.set('keyword', params.keyword);
    }

    q.set(
        'page',
        String(params?.page ?? 0)
    );

    q.set(
        'size',
        String(params?.size ?? 20)
    );

    return request<Page<Product>>(
        `/admin/products?${q.toString()}`
    );
  },

  /**
   * Chi tiết sản phẩm
   */
  getById: (id: number) =>
      request<Product>(
          `/admin/products/${id}`
      ),

  /**
   * Duyệt sản phẩm
   */
  approve: (id: number) =>
      fetch(
          `${BASE_URL}/admin/products/${id}/approve`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json() as Promise<Product>;
      }),

  /**
   * Từ chối sản phẩm
   */
  reject: (id: number) =>
      fetch(
          `${BASE_URL}/admin/products/${id}/reject`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json() as Promise<Product>;
      }),
};

/* ===========================================================
   ADMIN ORDER
=========================================================== */

export interface AdminOrder {
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

export interface AdminOrderDetail {
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

  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;

    customized: boolean;

    customizationPrice: number | null;
    customText: string | null;
    customNote: string | null;
    customImage: string | null;
  }[];

  statusHistories: {
    oldStatus: string;
    newStatus: string;
    changedAt: string;
  }[];
}

export const adminOrderApi = {
  /**
   * Danh sách đơn hàng
   */
  list: (params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();

    q.set(
        'page',
        String(params?.page ?? 0)
    );

    q.set(
        'size',
        String(params?.size ?? 20)
    );

    return request<Page<AdminOrder>>(
        `/admin/orders?${q.toString()}`
    );
  },

  /**
   * Chi tiết đơn hàng
   */
  getById: (id: number) =>
      request<AdminOrderDetail>(
          `/admin/orders/${id}`
      ),
};

/* ===========================================================
   ADMIN USER
=========================================================== */

export interface AdminUser {
  id: number;

  email: string;

  fullName: string;

  phone: string;

  role: UserRole;

  status: UserStatus;

  createdAt: string;

  updatedAt: string;
}

export interface AdminUserForm {
  email: string;

  password?: string;

  fullName: string;

  phone: string;

  role: UserRole;

  status?: UserStatus;
}

export const adminUserApi = {
  /**
   * Danh sách user
   */
  list: (params?: {
    role?: UserRole;
    status?: UserStatus;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const q = new URLSearchParams();

    if (params?.role) {
      q.set('role', params.role);
    }

    if (params?.status) {
      q.set('status', params.status);
    }

    if (params?.keyword) {
      q.set('keyword', params.keyword);
    }

    q.set(
        'page',
        String(params?.page ?? 0)
    );

    q.set(
        'size',
        String(params?.size ?? 20)
    );

    return request<Page<AdminUser>>(
        `/admin/users?${q.toString()}`
    );
  },

  /**
   * Lấy user theo id
   */
  getById: (id: number) =>
      request<AdminUser>(
          `/admin/users/${id}`
      ),

  /**
   * Tạo user
   */
  create: (data: AdminUserForm) =>
      request<AdminUser>(
          '/admin/users',
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
      ),

  /**
   * Cập nhật user
   */
  update: (
      id: number,
      data: AdminUserForm
  ) =>
      request<AdminUser>(
          `/admin/users/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
      ),

  /**
   * Xóa user
   */
  delete: (id: number) =>
      fetch(
          `${BASE_URL}/admin/users/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),
};

/* ===========================================================
   ADMIN REVIEW
=========================================================== */

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
  /**
   * Danh sách đánh giá
   */
  list: () =>
      request<Review[]>(
          '/admin/reviews'
      ),

  /**
   * Ẩn / hiện đánh giá
   */
  updateStatus: (
      id: number,
      status: ReviewStatus
  ) =>
      fetch(
          `${BASE_URL}/admin/reviews/${id}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              status,
            }),
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),

  /**
   * Xóa đánh giá
   */
  delete: (id: number) =>
      fetch(
          `${BASE_URL}/admin/reviews/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }),
};