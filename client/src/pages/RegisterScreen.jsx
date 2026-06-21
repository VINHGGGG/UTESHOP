import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios'; // 👇 Import axios để gọi API trực tiếp
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
// ❌ Không import register action từ Redux nữa vì ta xử lý thủ công ở đây
// import { register } from '../slices/userSlice'; 

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  // 👇 Thêm state nội bộ để xử lý UI
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Biến này để check xem đăng ký xong chưa

  const navigate = useNavigate();

  // ❌ Bỏ đoạn useEffect tự động redirect này đi
  // useEffect(() => {
  //   if (userInfo) {
  //     navigate(redirect);
  //   }
  // }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    // Reset lỗi mỗi lần submit
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setMessage('Mật khẩu không khớp');
      return;
    }

    try {
      setLoading(true);
      
      // 👇 Gọi API trực tiếp thay vì qua Redux
      // Vì ta không muốn lưu trạng thái đăng nhập ngay lập tức
      await axios.post('/api/users', { name, email, password });
      
      setLoading(false);
      setSuccess(true); // ✅ Đánh dấu là đã đăng ký thành công
      
    } catch (err) {
      setLoading(false);
      // Lấy lỗi từ server trả về
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  };

  return (
    <FormContainer>
      <h1>Đăng Ký</h1>
      
      {message && <Message variant='danger'>{message}</Message>}
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}

      {/* 👇 Logic hiển thị: Nếu thành công thì hiện thông báo, chưa thì hiện Form */}
      {success ? (
        <Alert variant='success' className='mt-4'>
          <Alert.Heading>Đăng ký thành công! 🎉</Alert.Heading>
          <p>
            Chúng tôi đã gửi một email xác thực đến <strong>{email}</strong>.
            <br />
            Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam) và nhấp vào liên kết để kích hoạt tài khoản.
          </p>
          <hr />
          <div className='d-flex justify-content-end'>
            <Button onClick={() => navigate('/login')} variant='outline-success'>
              Về trang Đăng nhập
            </Button>
          </div>
        </Alert>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='name'>
            <Form.Label>Tên hiển thị</Form.Label>
            <Form.Control
              type='name'
              placeholder='Nhập tên của bạn'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='email'>
            <Form.Label>Địa chỉ Email</Form.Label>
            <Form.Control
              type='email'
              placeholder='Nhập email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='password'>
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type='password'
              placeholder='Nhập mật khẩu'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='confirmPassword'>
            <Form.Label>Nhập lại mật khẩu</Form.Label>
            <Form.Control
              type='password'
              placeholder='Nhập lại mật khẩu'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary' className='mt-3'>
            Đăng Ký
          </Button>

          <Row className='py-3'>
            <Col>
              Đã có tài khoản? <Link to='/login'>Đăng Nhập</Link>
            </Col>
          </Row>
        </Form>
      )}
    </FormContainer>
  );
};

export default RegisterScreen;