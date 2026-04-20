/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

const Fallback = () => (
    <div className="flex w-full h-[100vh] items-center justify-center bg-slate-50">
        <Spin size="large" />
    </div>
);

const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<Fallback />}>
        <Component />
    </Suspense>
);

import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import GeneralError from '../pages/Error/GeneralError';
import NotFound from '../pages/Error/NotFound';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Products = lazy(() => import('../pages/Products'));
const Categories = lazy(() => import('../pages/Categories'));
const Skus = lazy(() => import('../pages/Skus'));
const Orders = lazy(() => import('../pages/Orders'));
const Payments = lazy(() => import('../pages/Payments'));
const Warehouses = lazy(() => import('../pages/Warehouses'));
const Stock = lazy(() => import('../pages/Stock'));
const InventoryLedger = lazy(() => import('../pages/InventoryLedger'));
const InventoryReservations = lazy(() => import('../pages/InventoryReservations'));
const BarcodeScans = lazy(() => import('../pages/BarcodeScans'));
const PurchaseOrders = lazy(() => import('../pages/PurchaseOrders'));
const Suppliers = lazy(() => import('../pages/Suppliers'));
const Users = lazy(() => import('../pages/Users'));
const Customers = lazy(() => import('../pages/Customers'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(Login),
  },
  {
    path: '/register',
    element: withSuspense(Register),
  },
  {
    path: '/',
    element: <ProtectedRoute />, // Bảo vệ tất cả các route bên trong
    errorElement: <GeneralError />,
    children: [
      {
        path: 'profile',
        element: withSuspense(Profile), // Profile trang riêng, không dùng AdminLayout
      },
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: withSuspense(Dashboard),
          },
          // Catalog
          {
            path: 'products',
            element: withSuspense(Products),
          },
          {
            path: 'categories',
            element: withSuspense(Categories),
          },
          {
            path: 'skus',
            element: withSuspense(Skus),
          },
          // Sales
          {
            path: 'orders',
            element: withSuspense(Orders),
          },
          {
            path: 'payments',
            element: withSuspense(Payments),
          },
          // Inventory
          {
            path: 'warehouses',
            element: withSuspense(Warehouses),
          },
          {
            path: 'stock',
            element: withSuspense(Stock),
          },
          {
            path: 'inventory-ledger',
            element: withSuspense(InventoryLedger),
          },
          {
            path: 'inventory-reservations',
            element: withSuspense(InventoryReservations),
          },
          {
            path: 'barcode-scans',
            element: withSuspense(BarcodeScans),
          },
          // Procurement
          {
            path: 'purchase-orders',
            element: withSuspense(PurchaseOrders),
          },
          {
            path: 'suppliers',
            element: withSuspense(Suppliers),
          },
          // Users
          {
            path: 'users',
            element: withSuspense(Users),
          },
          {
            path: 'customers',
            element: withSuspense(Customers),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
