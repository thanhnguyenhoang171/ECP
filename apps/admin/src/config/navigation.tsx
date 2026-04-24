import type { MenuProps } from 'antd/es/menu';
import DashboardOutlined from '@ant-design/icons/es/icons/DashboardOutlined';
import ShoppingOutlined from '@ant-design/icons/es/icons/ShoppingOutlined';
import AppstoreOutlined from '@ant-design/icons/es/icons/AppstoreOutlined';
import DatabaseOutlined from '@ant-design/icons/es/icons/DatabaseOutlined';
import UserOutlined from '@ant-design/icons/es/icons/UserOutlined';
import BarcodeOutlined from '@ant-design/icons/es/icons/BarcodeOutlined';
import HistoryOutlined from '@ant-design/icons/es/icons/HistoryOutlined';
import SafetyOutlined from '@ant-design/icons/es/icons/SafetyOutlined';
import FileTextOutlined from '@ant-design/icons/es/icons/FileTextOutlined';
import SolutionOutlined from '@ant-design/icons/es/icons/SolutionOutlined';
import TeamOutlined from '@ant-design/icons/es/icons/TeamOutlined';
import CreditCardOutlined from '@ant-design/icons/es/icons/CreditCardOutlined';
import ApartmentOutlined from '@ant-design/icons/es/icons/ApartmentOutlined';
import TagsOutlined from '@ant-design/icons/es/icons/TagsOutlined';
import LogoutOutlined from '@ant-design/icons/es/icons/LogoutOutlined';

export type MenuItem = Required<MenuProps>['items'][number];

export const getAdminMenuItems = (t: (key: string) => string = (s) => s): MenuItem[] => [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: t('Tổng quan'),
  },
  {
    key: 'catalog-group',
    icon: <AppstoreOutlined />,
    label: t('Quản lý Catalog'),
    children: [
      {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: t('Sản phẩm'),
      },
      {
        key: '/categories',
        icon: <ApartmentOutlined />,
        label: t('Danh mục'),
      },
      {
        key: '/skus',
        icon: <TagsOutlined />,
        label: t('Quản lý SKU'),
      },
    ],
  },
  {
    key: 'sales-group',
    icon: <CreditCardOutlined />,
    label: t('Quản lý Bán hàng'),
    children: [
      {
        key: '/orders',
        icon: <FileTextOutlined />,
        label: t('Đơn hàng'),
      },
      {
        key: '/payments',
        icon: <CreditCardOutlined />,
        label: t('Thanh toán'),
      },
    ],
  },
  {
    key: 'inventory-group',
    icon: <DatabaseOutlined />,
    label: t('Quản lý Kho'),
    children: [
      {
        key: '/warehouses',
        icon: <ApartmentOutlined />,
        label: t('Kho bãi'),
      },
      {
        key: '/stock',
        icon: <DatabaseOutlined />,
        label: t('Tồn kho'),
      },
      {
        key: '/inventory-ledger',
        icon: <HistoryOutlined />,
        label: t('Nhật ký kho'),
      },
      {
        key: '/inventory-reservations',
        icon: <SafetyOutlined />,
        label: t('Giữ chỗ kho'),
      },
      {
        key: '/barcode-scans',
        icon: <BarcodeOutlined />,
        label: t('Quét mã vạch'),
      },
    ],
  },
  {
    key: 'procurement-group',
    icon: <SolutionOutlined />,
    label: t('Quản lý Thu mua'),
    children: [
      {
        key: '/purchase-orders',
        icon: <FileTextOutlined />,
        label: t('Đơn mua hàng'),
      },
      {
        key: '/suppliers',
        icon: <SolutionOutlined />,
        label: t('Nhà cung cấp'),
      },
    ],
  },
  {
    key: 'users-group',
    icon: <TeamOutlined />,
    label: t('Người dùng'),
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: t('Tài khoản hệ thống'),
      },
      {
        key: '/customers',
        icon: <TeamOutlined />,
        label: t('Khách hàng'),
      },
    ],
  },
  {
    key: 'divider-1',
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined className="text-red-500" />,
    label: <span className="text-red-500 font-medium">{t('Đăng xuất')}</span>,
  },
];

export const getBreadcrumbsByPath = (path: string): { title: string; key: string }[] => {
  const items = getAdminMenuItems();
  
  if (path === '/dashboard' || path === '/') {
    return [{ title: 'Tổng quan', key: '/dashboard' }];
  }

  for (const item of items) {
    if (item && 'children' in item && Array.isArray(item.children)) {
      const child = item.children.find((c) => c && c.key === path);
      if (child) {
        return [
          { title: String((item as { label?: string }).label || ''), key: String(item.key || '') },
          { title: String((child as { label?: string }).label || ''), key: String(child.key || '') },
        ];
      }
    } else if (item && item.key === path) {
      return [{ title: String((item as { label?: string }).label || ''), key: String(item.key || '') }];
    }
  }

  return [];
};

export const getUserMenuItems = (t: (key: string) => string = (s) => s): MenuItem[] => [
  {
    key: '/profile',
    icon: <UserOutlined />,
    label: t('Hồ sơ cá nhân'),
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined className="text-red-500" />,
    label: <span className="text-red-500 font-medium">{t('Đăng xuất')}</span>,
  },
];
