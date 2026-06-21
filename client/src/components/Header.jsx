import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, Button, InputGroup, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/userSlice';
import { clearCartItems } from '../slices/cartSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  const [keyword, setKeyword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  const logoutHandler = () => {
    dispatch(clearCartItems());
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header style={{ width: '100%'}}>
      {/* Thay Container bằng fluid để thanh điều hướng tràn hết màn hình chuẩn App */}
      <Navbar 
    bg="dark" 
    variant="dark" 
    expand="lg" 
    collapseOnSelect 
    className="py-2 px-3 shadow-sm"
    /* Thêm paddingRight vào style inline để tạo vùng đệm cấm menu chui vào */
    style={{ width: '100%', paddingRight: '395px', boxSizing: 'border-box' }}
  >
    <Container fluid>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Navbar.Brand style={{ fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '1px' }}>
              <i className="fas fa-desktop me-2 text-info"></i>UTESHOP POS
            </Navbar.Brand>
          </Link>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            
            {/* Thanh tìm kiếm sản phẩm cho thu ngân - Giữ ở giữa cân đối */}
<Form className="d-flex mx-auto" style={{ width: '40%' }} onSubmit={submitHandler}>
  <InputGroup size="sm">
    <Form.Control
      type="search"
      placeholder="Gõ tên sản phẩm cần tìm nhanh..."
      className="bg-secondary text-white border-0"
      aria-label="Search"
      style={{ borderRadius: '6px 0 0 6px', colorScheme: 'dark' }}
      onChange={(e) => setKeyword(e.target.value)}
    />
    <Button type="submit" variant="info" className="text-white fw-bold" style={{ borderRadius: '0 6px 6px 0' }}>
      <i className="fas fa-search"></i>
    </Button>
  </InputGroup>
</Form>

            {/* Thanh chứa menu tài khoản - Xóa bỏ padding-right 380px nếu lượt trước có thêm nhé */}
<Nav className="ms-auto align-items-center" style={{ gap: '10px' }}>
  
  {/* --- MENU ADMIN --- */}
{userInfo && userInfo.isAdmin && (
  <NavDropdown 
    title={<><i className="fas fa-user-shield me-1"></i> Quản lý</>} 
    id='adminmenu' 
    className="me-2"
    align="end" /* Ép menu bung về phía bên trái */
  >
    <Link to='/admin/dashboard' className='dropdown-item'>
      <i className="fas fa-chart-line me-2 text-primary"></i>Dashboard
    </Link>
    <Link to='/admin/categorylist' className='dropdown-item'>
      <i className="fas fa-th-list me-2 text-secondary"></i>Danh mục
    </Link>
    <Link to='/admin/productlist' className='dropdown-item'>
      <i className="fas fa-boxes me-2 text-warning"></i>Sản phẩm
    </Link>
    
    {/* 🎯 BỔ SUNG 1: ĐƯỜNG DẪN QUẢN LÝ NHÀ CUNG CẤP */}
    <Link to='/admin/supplier' className='dropdown-item'>
      <i className="fas fa-handshake me-2 text-info"></i>Nhà cung cấp
    </Link>

    {/* 🎯 BỔ SUNG 2: ĐƯỜNG DẪN NHẬT KÝ NHẬP KHỎ */}
    <Link to='/admin/purchase' className='dropdown-item'>
      <i className="fas fa-truck-loading me-2 text-success"></i>Nhập kho hàng hóa
    </Link>

    <NavDropdown.Divider />

    <Link to='/admin/orderlist' className='dropdown-item'>
      <i className="fas fa-receipt me-2 text-dark"></i>Đơn bán hàng
    </Link>
    <Link to='/admin/userlist' className='dropdown-item'>
      <i className="fas fa-users me-2 text-indigo"></i>Người dùng
    </Link>
    <Link to='/admin/couponlist' className='dropdown-item'>
      <i className="fas fa-ticket-alt me-2 text-danger"></i>Mã giảm giá
    </Link>
  </NavDropdown>
)}

  {/* --- THÔNG TIN THU NGÂN --- */}
  {userInfo ? (
    <NavDropdown 
      title={<><i className="fas fa-user me-1"></i> {userInfo.name || "Thu Ngân"}</>} 
      id='username'
      align="end" /* 🔴 THÊM Ở ĐÂY: Ép menu bung về phía bên trái giống Chrome */
    >
      <Link to='/profile' className='dropdown-item'>Hồ sơ cá nhân</Link>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={logoutHandler} className="text-danger">
        <i className="fas fa-sign-out-alt me-1"></i> Đăng xuất
      </NavDropdown.Item>
    </NavDropdown>
  ) : (
    <Link to="/login" className="nav-link">
      <i className="fas fa-user"></i> Đăng nhập
    </Link>
  )}
</Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;