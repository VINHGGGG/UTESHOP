import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaUserEdit, FaSave, FaKey } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { getUserDetails, updateUser, userReset } from '../../slices/userSlice'; 

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  // 🌟 THÊM STATE QUẢN LÝ MẬT KHẨU MỚI
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.user);
  const { userDetails, loading, error, successUpdate } = userLogin; 
  
  useEffect(() => {
    if (successUpdate) {
      dispatch(userReset()); 
      navigate('/admin/userlist');
    } else {
      const user = userDetails?.user || userDetails; 

      if (!user || user._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
        // Đảm bảo mỗi lần load lại form, ô mật khẩu luôn rỗng
        setPassword('');
      }
    }
  }, [dispatch, navigate, userId, userDetails, successUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();
    // 🌟 TRUYỀN THÊM PASSWORD VÀO PAYLOAD (Nếu trống, Backend sẽ tự bỏ qua)
    dispatch(updateUser({ _id: userId, name, email, isAdmin, password }));
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
        <FaArrowLeft className="me-2" /> Quay lại danh sách
      </Button>

      <FormContainer>
        <Card className="border-0 shadow-sm rounded overflow-hidden">
          <Card.Header className="bg-dark text-white p-3 fw-bold d-flex align-items-center">
            <FaUserEdit className="me-2 fs-5" /> THAY ĐỔI PHÂN QUYỀN VÀ THÔNG TIN NHÂN VIÊN
          </Card.Header>
          
          <Card.Body className="p-4">
            {loading && <Loader />}
            {error && <Message variant='danger'>{error}</Message>}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='name' className='mb-3'>
                <Form.Label className="fw-bold text-secondary">Họ và tên nhân viên</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Nhập tên nhân viên'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="py-2"
                  required
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='email' className='mb-3'>
                <Form.Label className="fw-bold text-secondary">Địa chỉ Email đăng nhập</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Nhập tài khoản email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-2"
                  required
                ></Form.Control>
              </Form.Group>

              {/* 🌟 THÊM KHU VỰC CẤP LẠI MẬT KHẨU CHO NHÂN VIÊN */}
              <Form.Group controlId='password' className='mb-3'>
                <Form.Label className="fw-bold text-secondary">
                  <FaKey className="me-1" /> Cấp lại mật khẩu (Không bắt buộc)
                </Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Nhập mật khẩu mới nếu muốn đổi'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-2 border-warning"
                ></Form.Control>
                <Form.Text className="text-muted">
                  * Để trống ô này nếu bạn <strong>không muốn</strong> thay đổi mật khẩu hiện tại của nhân viên.
                </Form.Text>
              </Form.Group>

              {/* KHU VỰC PHÂN QUYỀN */}
              <Form.Group controlId='isadmin' className='my-4 bg-light p-3 rounded border'>
                <Form.Label className="fw-bold text-dark mb-2 d-block">🔰 Chỉ định vai trò hệ thống</Form.Label>
                <Form.Check
                  type='checkbox'
                  label={
                    <span className="fw-semibold">
                      Kích hoạt quyền quản trị tối cao <code className="text-danger">(Admin)</code>
                    </span>
                  }
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                ></Form.Check>
                <small className="text-muted d-block mt-1 ps-4">
                  * Nếu không tích chọn, tài khoản sẽ mặc định được gán quyền <strong>Nhân viên thu ngân (Cashier)</strong> chỉ được thao tác tại giao diện bán hàng POS.
                </small>
              </Form.Group>

              <Button type='submit' variant='primary' className='w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center'>
                <FaSave className="me-2" /> Lưu Lại Thay Đổi
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </FormContainer>
    </div>
  );
};

export default UserEditScreen;