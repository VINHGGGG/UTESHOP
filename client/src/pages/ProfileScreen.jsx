import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Card, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaUser, FaEnvelope, 
  FaReceipt, FaCheckCircle, FaTimesCircle, FaEye, FaIdBadge, FaSave 
} from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listMyOrders } from '../slices/orderSlice';
import { getUserDetails, updateUserProfile, userReset } from '../slices/userSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.user);
  const { userInfo, userDetails, loading, error, successUpdate } = userLogin;

  const orderListMy = useSelector((state) => state.order);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(listMyOrders());

      if (successUpdate) {
        dispatch(userReset());
        dispatch(getUserDetails('profile'));
      } else if (!userDetails || !userDetails.name) {
        dispatch(getUserDetails('profile'));
      } else {
        setName(userDetails.name);
        setEmail(userDetails.email);
      }
    }
  }, [dispatch, navigate, userInfo, userDetails, successUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ id: userInfo._id, name, email }));
  };

  return (
    <div 
      className="p-4" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: 'calc(100vh - 56px)', 
        overflowY: 'auto' 
      }}
    >
      <Row className="g-4">
        
        {/* ================= CỘT TRÁI: THÔNG TIN HỒ SƠ NHÂN VIÊN ================= */}
        <Col lg={4} md={12}>
          <Card className="border-0 shadow-sm rounded overflow-hidden mb-4">
            <div className="bg-dark p-4 text-white text-center position-relative">
              <FaUserCircle className="text-white-50 mb-2" style={{ fontSize: '70px' }} />
              <h4 className="fw-bold m-0">{name || 'Đang tải...'}</h4>
              <p className="text-light opacity-75 small m-0 mt-1">{email}</p>
              
              <div className="mt-3">
                {userInfo?.isAdmin ? (
                  <Badge bg="danger" className="px-3 py-2 shadow-sm rounded-pill">
                    <FaIdBadge className="me-1" /> Quản trị viên (Admin)
                  </Badge>
                ) : (
                  <Badge bg="success" className="px-3 py-2 shadow-sm rounded-pill">
                    <FaIdBadge className="me-1" /> Thu ngân (Cashier)
                  </Badge>
                )}
              </div>
            </div>

            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-3">Thông Tin Tài Khoản</h5>
              
              {error && <Message variant='danger'>{error}</Message>}
              {successUpdate && <Message variant='success'>Cập nhật thông tin thành công!</Message>}
              {loading && <Loader />}

              <Form onSubmit={submitHandler}>
                <Form.Group controlId='name' className='mb-3'>
                  <Form.Label className="fw-bold text-secondary small">
                    <FaUser className="me-1" /> Họ và tên nhân viên
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Nhập họ tên'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="py-2"
                    required
                  />
                </Form.Group>

                <Form.Group controlId='email' className='mb-4'>
                  <Form.Label className="fw-bold text-secondary small">
                    <FaEnvelope className="me-1" /> Email đăng nhập hệ thống
                  </Form.Label>
                  <Form.Control
                    type='email'
                    value={email}
                    disabled
                    className='bg-light py-2 text-muted'
                    style={{ borderStyle: 'dashed', cursor: 'not-allowed' }}
                    title="Tài khoản email do Admin cấp phát, không thể tự thay đổi"
                  />
                  <small className="text-muted d-block mt-1">
                    * Mật khẩu và email do Quản trị viên quản lý bảo mật.
                  </small>
                </Form.Group>

                <Button type='submit' variant='primary' className='w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2'>
                  <FaSave /> Lưu Thay Đổi Tên
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= CỘT PHẢI: LỊCH SỬ LẬP HÓA ĐƠN TẠI QUẦY & ĐƠN SHIP ================= */}
        <Col lg={8} md={12}>
          <Card className="border-0 shadow-sm rounded overflow-hidden">
            <Card.Header className="bg-white p-3 fw-bold text-dark d-flex align-items-center gap-2 border-bottom">
              <FaReceipt className="text-primary fs-5" /> 
              <div>
                <span className="d-block">LỊCH SỬ KẾT TOÁN & LẬP HÓA ĐƠN</span>
                <small className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                  Danh sách toàn bộ hóa đơn (tại quầy & đơn giao hàng) được xử lý bởi tài khoản này
                </small>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              {loadingOrders ? (
                <div className="p-4"><Loader /></div>
              ) : errorOrders ? (
                <div className="p-3"><Message variant='danger'>{errorOrders}</Message></div>
              ) : (
                <Table hover responsive className='table-sm m-0 align-middle'>
                  <thead className="table-light text-secondary" style={{ fontSize: '0.85rem' }}>
                    <tr>
                      <th className="p-3">MÃ ĐƠN (ID)</th>
                      <th className="p-3">THỜI GIAN LẬP</th>
                      <th className="p-3">HÌNH THỨC</th>
                      <th className="p-3 text-end">TỔNG TIỀN</th>
                      <th className="p-3 text-center">THANH TOÁN</th>
                      <th className="p-3 text-center">TRẠNG THÁI</th>
                      <th className="p-3 text-center">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders && orders.length > 0 ? (
                      orders.map((order) => {
                        // Xác định xem có phải đơn Ship không bằng địa chỉ giao hàng
                        const isShipping = !!(
                          order.shippingAddress?.address && 
                          !order.shippingAddress.address.toLowerCase().includes('tại quầy') &&
                          !order.shippingAddress.address.toLowerCase().includes('trực tiếp')
                        );

                        return (
                          <tr key={order._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                            <td className="p-3">
                              <code className="text-dark fw-bold">{order._id.substring(0, 10).toUpperCase()}...</code>
                            </td>
                            <td className="p-3 text-muted" style={{ fontSize: '0.85rem' }}>
                              {new Date(order.createdAt).toLocaleString('vi-VN', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3">
                              <Badge bg="secondary" className="bg-opacity-10 text-dark fw-semibold border px-2 py-1">
                                {order.paymentMethod || 'Chuyên khoản / TM'}
                              </Badge>
                            </td>
                            <td className="p-3 text-end fw-bold text-primary">
                              {order.totalPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-3 text-center" style={{ fontSize: '1.1rem' }}>
                              {order.isPaid ? (
                                <FaCheckCircle className="text-success" title="Đơn đã thanh toán" />
                              ) : (
                                <FaTimesCircle className="text-danger" title="Chưa thu tiền / Công nợ" />
                              )}
                            </td>
                            
                            {/* 🌟 CỘT TRẠNG THÁI ĐƠN HÀNG MỚI ĐƯỢC BỔ SUNG */}
                            <td className="p-3 text-center">
                              {order.isReturned ? (
                                <Badge bg="danger" className="fw-bold px-2 py-1">Đã hoàn trả</Badge>
                              ) : isShipping ? (
                                order.isDelivered ? (
                                  <Badge bg="success" className="fw-bold px-2 py-1">Đã giao</Badge>
                                ) : (
                                  <Badge bg="warning" className="text-dark fw-bold px-2 py-1">Đang giao</Badge>
                                )
                              ) : (
                                <Badge bg="success" className="fw-bold px-2 py-1">Hoàn thành</Badge>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <LinkContainer to={`/order/${order._id}`}>
                                <Button variant='outline-secondary' className='btn-sm rounded border px-2 py-1 d-inline-flex align-items-center gap-1'>
                                  <FaEye size={12} /> Xem đơn
                                </Button>
                              </LinkContainer>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-5 text-muted">
                          <FaReceipt className="d-block mx-auto mb-2 text-black-50 fs-2" />
                          Tài khoản này chưa xử lý giao dịch hoặc đơn ship nào trên hệ thống.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default ProfileScreen;