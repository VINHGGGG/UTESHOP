import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { FaArrowLeft, FaUserPlus, FaSave, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios'; // Gọi API trực tiếp tạo user mà không làm ảnh hưởng Auth state Redux của Admin hiện tại
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';

const UserCreateScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Thêm quyền hạn ngay khi khởi tạo nhân sự

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); 

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    try {
      setLoading(true);
      
      // 🔥 GỌI API TẠO USER: Truyền thêm flag isAdmin lên server
      // Lưu ý: Đảm bảo route API Backend `/api/users` nhận thêm trường isAdmin khi tạo mới nhé cậu
      await axios.post('/api/users', { name, email, password, isAdmin });
      
      setLoading(false);
      setSuccess(true); 
      
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  };

  return (
    <div 
      className="p-4" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        height: 'calc(100vh - 56px)', 
        overflowY: 'auto' 
      }}
    >
      {/* NÚT QUAY LẠI */}
      <Button variant="light" className="mb-3 border fw-semibold shadow-sm btn-sm" onClick={() => navigate('/admin/userlist')}>
        <FaArrowLeft className="me-2" /> Quay lại danh sách nhân sự
      </Button>

      <FormContainer>
        {/* THÔNG BÁO THÀNH CÔNG CHUẨN POS */}
        {success ? (
          <Alert variant='success' className='mt-4 shadow-sm border-success border-opacity-30 p-4 rounded'>
            <Alert.Heading className="fw-bold d-flex align-items-center text-success mb-3">
              <FaCheckCircle className="me-2" /> CẤP TÀI KHOẢN THÀNH CÔNG!
            </Alert.Heading>
            <p className="mb-1">
              Tài khoản dành cho nhân viên <strong>{name}</strong> đã được lưu trữ an toàn vào cơ sở dữ liệu hệ thống.
            </p>
            <p>
              Email đăng nhập máy POS: <code className="bg-white p-1 rounded border text-dark">{email}</code>
            </p>
            <hr />
            <div className='d-flex justify-content-end'>
              <Button onClick={() => navigate('/admin/userlist')} variant='success' className="fw-bold px-4">
                Hoàn tất & Quay về danh sách
              </Button>
            </div>
          </Alert>
        ) : (
          <Card className="border-0 shadow-sm rounded overflow-hidden">
            <Card.Header className="bg-dark text-white p-3 fw-bold d-flex align-items-center">
              <FaUserPlus className="me-2 fs-5" /> KHỞI TẠO TÀI KHOẢN NHÂN VIÊN MỚI
            </Card.Header>

            <Card.Body className="p-4">
              {message && <Message variant='danger'>{message}</Message>}
              {error && <Message variant='danger'>{error}</Message>}
              {loading && <Loader />}

              <Form onSubmit={submitHandler}>
                <Form.Group controlId='name' className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Họ và tên nhân sự</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Nhập tên nhân viên'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="py-2"
                    required
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='email' className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Địa chỉ Email (Tài khoản đăng nhập)</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='nhanvien@congty.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2"
                    required
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='password' className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Mật khẩu khởi tạo ban đầu</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Nhập mật khẩu mặc định (Ít nhất 6 ký tự)'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2"
                    required
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='confirmPassword' className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Xác nhận lại mật khẩu</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Gõ lại mật khẩu phía trên để kiểm tra'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-2"
                    required
                  ></Form.Control>
                </Form.Group>

                {/* 🎯 TÍCH HỢP CHỌN QUYỀN LUÔN KHI TẠO MỚI */}
                <Form.Group controlId='isadmin' className='my-4 bg-light p-3 rounded border'>
                  <Form.Label className="fw-bold text-dark mb-2 d-block">🔰 Cấp bậc phân quyền</Form.Label>
                  <Form.Check
                    type='checkbox'
                    label={
                      <span className="fw-semibold text-danger">
                        Ủy quyền Quản trị viên hệ thống (Admin)
                      </span>
                    }
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  ></Form.Check>
                  <small className="text-muted d-block mt-1 ps-4">
                    * Nếu bỏ trống, tài khoản này sẽ tự động đóng vai trò là <strong>Nhân viên thu ngân (Cashier)</strong> khi đăng nhập.
                  </small>
                </Form.Group>

                <Button type='submit' variant='primary' className='w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center'>
                  <FaUserPlus className="me-2" /> Kích Hoạt & Cấp Tài Khoản
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}
      </FormContainer>
    </div>
  );
};

export default UserCreateScreen;