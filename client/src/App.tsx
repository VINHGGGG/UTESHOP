import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Import các thành phần giao diện
import AdminLayout from './components/AdminLayout';

// Import các trang (Pages)
import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import CartScreen from './pages/CartScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import ShippingScreen from './pages/ShippingScreen';
import OrderSuccessScreen from './pages/OrderSuccessScreen';
import ProductListScreen from './pages/admin/ProductListScreen';
import ProductEditScreen from './pages/admin/ProductEditScreen';
import UserListScreen from './pages/admin/UserListScreen';
import UserEditScreen from './pages/admin/UserEditScreen';
import ProfileScreen from './pages/ProfileScreen';
import OrderListScreen from './pages/admin/OrderListScreen';
import OrderScreen from './pages/OrderScreen';
import DashboardScreen from './pages/admin/DashboardScreen';
import CategoryListScreen from './pages/admin/CategoryListScreen';
import VerifyScreen from './pages/VerifyScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import CouponListScreen from './pages/admin/CouponListScreen';
import UserCreateScreen from './pages/admin/UserCreateScreen';
import PurchaseListScreen from './pages/admin/PurchaseListScreen';
import PurchaseOrderScreen from './pages/admin/PurchaseOrderScreen';

import './App.css'; 
import CreatePurchaseScreen from './pages/admin/CreatePurchaseScreen';
import SupplierListScreen from './pages/admin/SupplierListScreen';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ['/login', '/forgot-password', '/register'];
    if (!publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, []);

  return (
    <Routes>
      {/* ==================================================================
        🌟 NHÓM 1: CÁC TRANG HIỂN THỊ TOÀN MÀN HÌNH ĐỘC LẬP (NẰM NGOÀI LAYOUT CHUNG)
        Giúp giao diện Login, Đăng ký, Quên mật khẩu chiếm 100% không gian, không Sidebar.
        ==================================================================
      */}
      <Route path="/login" element={<Container className="mt-5"><LoginScreen /></Container>} />
      <Route path="/register" element={<Container className="mt-5"><RegisterScreen /></Container>} />
      <Route path="/forgot-password" element={<Container className="mt-5"><ForgotPasswordScreen /></Container>} />
      <Route path="/reset-password/:token" element={<Container className="mt-5"><ResetPasswordScreen /></Container>} />
      <Route path="/verify/:token" element={<Container className="mt-3"><VerifyScreen /></Container>} />


      {/* ==================================================================
        🌟 NHÓM 2: CÁC TRANG CÓ SIDEBAR MENU (BỌC TRONG ADMINLAYOUT)
        Chỉ khi Đăng nhập thành công và vào các trang này thì mới hiện Sidebar.
        ==================================================================
      */}
      <Route path="/" element={<AdminLayout />}>
        
        {/* MÀN POS TRANG CHỦ: Bung lụa full màn hình cạnh Sidebar */}
        <Route index element={<HomeScreen />} />
        <Route path="search/:keyword" element={<HomeScreen />} />

        {/* CÁC TÍNH NĂNG QUẢN LÝ / ADMIN */}
        <Route path="admin/dashboard" element={<DashboardScreen />} />
        <Route path="admin/productlist" element={<ProductListScreen />} />
        <Route path="admin/product/:id/edit" element={<ProductEditScreen />} />
        <Route path="admin/userlist" element={<UserListScreen />} />
        <Route path="admin/user/:id/edit" element={<UserEditScreen />} />
        <Route path="admin/orderlist" element={<OrderListScreen />} />
        <Route path="admin/categorylist" element={<CategoryListScreen />} />
        <Route path="admin/couponlist" element={<CouponListScreen />} />
        <Route path='/admin/user/create' element={<UserCreateScreen />} />
        <Route path='/admin/purchase' element={<PurchaseListScreen />} />
        <Route path='/admin/purchase/:id' element={<PurchaseOrderScreen />} />
        <Route path='/admin/purchase/create' element={<CreatePurchaseScreen />} />
        <Route path='/admin/supplier' element={<SupplierListScreen />} />

        {/* CÁC TRANG CỦA KHÁCH HÀNG / USER (Nằm trong hệ thống có Sidebar) */}
        <Route path="product/:id" element={<Container className="mt-3"><ProductScreen /></Container>} />
        <Route path="cart" element={<Container className="mt-3"><CartScreen /></Container>} />
        <Route path="shipping" element={<Container className="mt-3"><ShippingScreen /></Container>} />
        <Route path="order-success" element={<Container className="mt-3"><OrderSuccessScreen /></Container>} />
        <Route path="profile" element={<Container className="mt-3"><ProfileScreen /></Container>} />
        <Route path="order/:id" element={<Container className="mt-3"><OrderScreen /></Container>} />

      </Route>
    </Routes>
  );
};

export default App;