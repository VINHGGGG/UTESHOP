import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';       // ✅ Đã sửa cấu trúc bọc
import Loader from '../components/Loader';         // ✅ Đã sửa cấu trúc bọc
import FormContainer from '../components/FormContainer'; 
import { login } from '../slices/userSlice';       

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy state từ Redux
  const userLogin = useSelector((state) => state.user);
  const { loading, error, userInfo } = userLogin;

  // Xử lý redirect
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    // Nếu đã đăng nhập rồi thì đá về trang chủ
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '85vh', 
        width: '100%',
        backgroundColor: 'transparent' // Để ăn theo màu nền app nền tối/sáng của cậu
      }}
    >
      <Card 
        className="p-4 border-0 shadow-lg" 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          borderRadius: '16px',
          backgroundColor: '#ffffff'
        }}
      >
        <Card.Body>
          {/* LOGO HOẶC BIỂU TƯỢNG HỆ THỐNG */}
          <div className="text-center mb-4">
            <div 
              className="d-inline-flex justify-content-center align-items-center bg-primary text-white rounded-circle mb-3"
              style={{ width: '60px', height: '60px', fontSize: '24px' }}
            >
              <i className="fas fa-desktop"></i>
            </div>
            <h3 className="fw-bold text-dark m-0 tracking-wide" style={{ letterSpacing: '0.5px' }}>
              UTESHOP
            </h3>
            <small className="text-muted text-uppercase fw-semibold small d-block mt-1" style={{ letterSpacing: '1px' }}>
              Đăng Nhập Phiên Làm Việc
            </small>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI HOẶC TRẠNG THÁI LOADING */}
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}

          {/* FORM ĐĂNG NHẬP */}
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='email' className="mb-3">
              <Form.Label className="small fw-bold text-secondary">
                <i className="fas fa-envelope me-2"></i>Địa chỉ Email
              </Form.Label>
              <Form.Control
                type='email'
                placeholder='Nhập email nhân viên...'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-2 px-3 shadow-none"
                style={{ borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem' }}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='password' className="mb-4">
              <Form.Label className="small fw-bold text-secondary">
                <i className="fas fa-lock me-2"></i>Mật khẩu
              </Form.Label>
              <Form.Control
                type='password'
                placeholder='Nhập mật khẩu...'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2 px-3 shadow-none"
                style={{ borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem' }}
                required
              ></Form.Control>
            </Form.Group>

            {/* NÚT ĐĂNG NHẬP CHÍNH */}
            <Button 
              type='submit' 
              variant='primary' 
              className='w-100 py-2 fw-bold shadow-sm mb-3'
              style={{ borderRadius: '8px', fontSize: '1rem', transition: 'all 0.2s' }}
            >
              <i className="fas fa-sign-in-alt me-2"></i> ĐĂNG NHẬP
            </Button>

           
          </Form>

          <hr className="text-muted opacity-25 my-4" />

          
          <div className="text-center" style={{ fontSize: '0.85rem' }}>
            <span className="text-secondary">Nếu quên mật khẩu, vui lòng liên hệ quản lý để được hỗ trợ </span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginScreen;