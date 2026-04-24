/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Pure CSS fallback — không cần import antd Spin, giảm initial bundle
const Fallback = () => (
    <div style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC'
    }}>
        <div style={{
            width: 40,
            height: 40,
            border: '3px solid #E2E8F0',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
        }} />
    </div>
);

const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<Fallback />}>
        <Component />
    </Suspense>
);

// Layouts
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const AuthLayout = lazy(() => import('../components/layout/AuthLayout'));
const ProfileLayout = lazy(() => import('../components/layout/ProfileLayout'));
import ProtectedRoute from '../components/layout/ProtectedRoute';

// Pages
const GeneralError = lazy(() => import('../pages/Error/GeneralError'));
const NotFound = lazy(() => import('../pages/Error/NotFound'));
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
  // Auth Routes
  {
    element: withSuspense(AuthLayout),
    children: [
      {
        path: '/login',
        element: withSuspense(Login),
      },
      {
        path: '/register',
        element: withSuspense(Register),
      },
    ]
  },
  // Protected Routes
  {
    path: '/',
    element: <ProtectedRoute />, 
    errorElement: <Suspense fallback={<Fallback />}><GeneralError /></Suspense>,
    children: [
      {
        // Profile has its own simple layout
        path: 'profile',
        element: withSuspense(ProfileLayout),
        children: [
          {
            index: true,
            element: withSuspense(Profile),
          }
        ]
      },
      {
        // AdminLayout contains Sidebar and Header
        element: withSuspense(AdminLayout),
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
    element: withSuspense(NotFound),
  },
]);

export default router;
