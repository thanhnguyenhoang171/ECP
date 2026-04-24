import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tags,
  FileText,
  CreditCard,
  Warehouse,
  Database,
  History,
  ShieldCheck,
  ScanBarcode,
  Handshake,
  Truck,
  Users,
  UserCircle,
  LogOut,
  User,
  ChevronRight
} from "lucide-react";
import React from "react";

export interface NavItem {
  title: string;
  href?: string;
  icon?: React.ElementType;
  children?: NavItem[];
  variant?: "default" | "ghost" | "danger";
}

export const getAdminMenuItems = (): NavItem[] => [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Catalog",
    icon: Layers,
    children: [
      {
        title: "Sản phẩm",
        href: "/products",
        icon: ShoppingBag,
      },
      {
        title: "Danh mục",
        href: "/categories",
        icon: Layers,
      },
      {
        title: "Quản lý SKU",
        href: "/skus",
        icon: Tags,
      },
    ],
  },
  {
    title: "Quản lý Bán hàng",
    icon: CreditCard,
    children: [
      {
        title: "Đơn hàng",
        href: "/orders",
        icon: FileText,
      },
      {
        title: "Thanh toán",
        href: "/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Quản lý Kho",
    icon: Database,
    children: [
      {
        title: "Kho bãi",
        href: "/warehouses",
        icon: Warehouse,
      },
      {
        title: "Tồn kho",
        href: "/stock",
        icon: Database,
      },
      {
        title: "Nhật ký kho",
        href: "/inventory-ledger",
        icon: History,
      },
      {
        title: "Giữ chỗ kho",
        href: "/inventory-reservations",
        icon: ShieldCheck,
      },
      {
        title: "Quét mã vạch",
        href: "/barcode-scans",
        icon: ScanBarcode,
      },
    ],
  },
  {
    title: "Quản lý Thu mua",
    icon: Handshake,
    children: [
      {
        title: "Đơn mua hàng",
        href: "/purchase-orders",
        icon: FileText,
      },
      {
        title: "Nhà cung cấp",
        href: "/suppliers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Người dùng",
    icon: Users,
    children: [
      {
        title: "Tài khoản hệ thống",
        href: "/users",
        icon: UserCircle,
      },
      {
        title: "Khách hàng",
        href: "/customers",
        icon: Users,
      },
    ],
  },
];

export const getUserMenuItems = (): NavItem[] => [
  {
    title: "Hồ sơ cá nhân",
    href: "/profile",
    icon: User,
  },
];
