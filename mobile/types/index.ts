export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand?: string;
  isSubsidy?: boolean;
  soldCount?: number;
  stock: number;
  category: string;
  subcategory?: string;
  attributes: { name: string; values: string[] }[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  variants?: {
    _id: string;
    name: string;
    options: Record<string, string>;
    price: number;
    stock: number;
    sku?: string;
    image?: string;
  }[];
  vendor: string | Vendor;
  shop: string | Shop;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  owner: string;
  shopName: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  logoUrl: string;
  earnings: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  _id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  vendor: string | Vendor;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  user: string;
  clerkId: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
  };
  paymentResult: {
    id: string;
    status: string;
  };
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
  hasReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions?: Record<string, string>;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  variantId?: string;
  selectedOptions?: Record<string, string>;
}

export interface Cart {
  _id: string;
  user: string;
  clerkId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  coupon?: string | null;
  subtotal?: number;
  discountAmount?: number;
  totalPrice?: number;
  couponDetails?: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    discountAmount: number;
  } | null;
}

export interface SubCategory {
  _id?: string;
  name: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories?: SubCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface PromoBanner {
  _id: string;
  title: string;
  label: string;
  imageUrl: string;
  price: string;
  type: "subsidy" | "fresh";
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  vendor?: string;
  description?: string;
}
