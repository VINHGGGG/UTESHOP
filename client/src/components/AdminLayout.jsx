import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './Header';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userLogin = useSelector((state) => state.user || state.auth);
  const { userInfo } = userLogin;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.includes(path);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* ================= 1. SIDEBAR TRÁI (75PX) ================= */}
      <div style={{
        width: '75px', minWidth: '75px', backgroundColor: '#1a2d42',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '15px', gap: '2px', flexShrink: 0, height: '100vh'
      }}>
        <div style={{ color: '#00d2d3', marginBottom: '20px', fontSize: '20px' }}>
          <i className="fas fa-cubes"></i>
        </div>

        {/* 🛒 Chức năng cơ bản: NHÂN VIÊN & ADMIN ĐỀU THẤY */}
        <div onClick={() => navigate('/')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('/') ? '#fff' : '#a4b8cb', backgroundColor: isActive('/') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
          <i className="fas fa-desktop" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Bán hàng</span>
        </div>

        {/* ========================================================
            🔒 PHÂN QUYỀN CHỨC NĂNG: CHỈ HIỂN THỊ CÁC MENU DƯỚI NẾU LÀ ADMIN
            ======================================================== */}
        {userInfo && userInfo.isAdmin && (
          <>
            <div onClick={() => navigate('admin/dashboard')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('admin/dashboard') ? '#fff' : '#a4b8cb', backgroundColor: isActive('admin/dashboard') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-chart-line" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Tổng quan</span>
            </div>

            <div onClick={() => navigate('admin/productlist')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('productlist') ? '#fff' : '#a4b8cb', backgroundColor: isActive('productlist') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-box" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Hàng hóa</span>
            </div>

            {/* 🌟 THÊM MỚI TẠI ĐÂY: Nút quản lý danh mục sản phẩm */}
            <div onClick={() => navigate('admin/categorylist')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('categorylist') ? '#fff' : '#a4b8cb', backgroundColor: isActive('categorylist') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-folder" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Danh mục</span>
            </div>

            <div onClick={() => navigate('admin/orderlist')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('orderlist') ? '#fff' : '#a4b8cb', backgroundColor: isActive('orderlist') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-file-invoice" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Đơn hàng</span>
            </div>
            
            <div onClick={() => navigate('admin/userlist')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('userlist') ? '#fff' : '#a4b8cb', backgroundColor: isActive('userlist') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-users" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Nhân viên</span>
            </div>
            
            <div onClick={() => navigate('admin/supplier')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('supplier') ? '#fff' : '#a4b8cb', backgroundColor: isActive('supplier') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-handshake" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Đối tác</span>
            </div>
            
            <div onClick={() => navigate('admin/purchase')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('purchase') ? '#fff' : '#a4b8cb', backgroundColor: isActive('purchase') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-truck-loading" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Nhập hàng</span>
            </div>
            
            <div onClick={() => navigate('admin/couponlist')} style={{ width: '100%', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('couponlist') ? '#fff' : '#a4b8cb', backgroundColor: isActive('couponlist') ? '#253e5a' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              <i className="fas fa-ticket-alt" style={{ fontSize: '16px', marginBottom: '4px' }}></i><span>Giảm giá</span>
            </div>
          </>
        )}
      </div>

      {/* ================= 2. VÙNG BÊN PHẢI (CHUYỂN SANG DÙNG CSS GRID) ================= */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        overflow: 'hidden'
      }}>
        
        {/* Ô số 1: Header */}
        <div style={{ gridRow: '1', zIndex: 9999, position: 'relative' }}>
          <Header />
        </div>

        {/* Ô số 2: Trang con (HomeScreen...) */}
        <div style={{ gridRow: '2', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;