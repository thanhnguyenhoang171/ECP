import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Skus from '../pages/Skus';
import Orders from '../pages/Orders';
import Payments from '../pages/Payments';
import Warehouses from '../pages/Warehouses';
import Stock from '../pages/Stock';
import InventoryLedger from '../pages/InventoryLedger';
import InventoryReservations from '../pages/InventoryReservations';
import BarcodeScans from '../pages/BarcodeScans';
import PurchaseOrders from '../pages/PurchaseOrders';
import Suppliers from '../pages/Suppliers';
import Users from '../pages/Users';
import Customers from '../pages/Customers';
import Profile from '../pages/Profile';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/Error/NotFound';
import GeneralError from '../pages/Error/GeneralError';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute />, // Bảo vệ tất cả các route bên trong
    errorElement: <GeneralError />,
    children: [
      {
        path: 'profile',
        element: <Profile />, // Profile trang riêng, không dùng AdminLayout
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
            element: <Dashboard />,
          },
          // Catalog
          {
            path: 'products',
            element: <Products />,
          },
          {
            path: 'categories',
            element: <Categories />,
          },
          {
            path: 'skus',
            element: <Skus />,
          },
          // Sales
          {
            path: 'orders',
            element: <Orders />,
          },
          {
            path: 'payments',
            element: <Payments />,
          },
          // Inventory
          {
            path: 'warehouses',
            element: <Warehouses />,
          },
          {
            path: 'stock',
            element: <Stock />,
          },
          {
            path: 'inventory-ledger',
            element: <InventoryLedger />,
          },
          {
            path: 'inventory-reservations',
            element: <InventoryReservations />,
          },
          {
            path: 'barcode-scans',
            element: <BarcodeScans />,
          },
          // Procurement
          {
            path: 'purchase-orders',
            element: <PurchaseOrders />,
          },
          {
            path: 'suppliers',
            element: <Suppliers />,
          },
          // Users
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'customers',
            element: <Customers />,
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
