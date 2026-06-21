import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; 
import { Row, Col, ListGroup, Image, Card, Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaArrowLeft, FaReceipt, FaTruck, FaShoppingBag, FaRegCalendarAlt, 
  FaCheckCircle, FaTimesCircle, FaUndoAlt, FaExclamationTriangle 
} from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { 
  getOrderDetails, 
  deliverOrder, 
  orderDeliverReset, 
  deleteOrder, 
  returnOrder, 
  orderReturnReset 
} from '../slices/orderSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const orderState = useSelector((state) => state.order);
  const { 
    order, 
    loading, 
    error, 
    loadingDeliver, 
    successDeliver, 
    successDelete,
    loadingReturn,
    successReturn
  } = orderState;

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (successDelete) {
      if (userInfo && userInfo.isAdmin) {
        navigate('/admin/orderlist');
      } else {
        navigate('/profile');
      }
      return; 
    }

    if (successDeliver) {
      alert('🚀 Đã cập nhật trạng thái giao hàng thành công!');
      dispatch(orderDeliverReset()); 
      dispatch(getOrderDetails(orderId)); 
      return;
    }

    if (successReturn) {
      alert('🎉 Đã hoàn tất thủ tục trả hàng!');
      dispatch(orderReturnReset());
      dispatch(getOrderDetails(orderId));
      return;
    }

    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [order, orderId, successDeliver, successDelete, successReturn, dispatch, navigate, userInfo]);

  const deliverHandler = () => {
    dispatch(deliverOrder(order._id));
  };

  const cancelHandler = () => {
    if (window.confirm('🚨 HÀNH ĐỘNG KHÔNG THỂ HOÀN TÁC!\nBạn có chắc chắn muốn HỦY và XÓA hóa đơn này khỏi hệ thống?')) {
      dispatch(deleteOrder(order._id));
    }
  };

  const returnHandler = () => {
    if (window.confirm('⚠️ XÁC NHẬN HOÀN TRẢ ĐƠN HÀNG?\nHành động này sẽ:\n1. Hoàn lại số tồn kho cho toàn bộ sản phẩm trong đơn.\n2. Khấu trừ điểm tích lũy của hội viên.\n3. Đưa doanh thu đơn này về 0đ.\n\nBạn có chắc chắn muốn tiếp tục không?')) {
      dispatch(returnOrder(order._id));
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant='danger'>{error}</Message>;
  if (!order) return <Loader />;

  const itemsPrice = order.itemsPrice ?? order.orderItems?.reduce((acc, item) => acc + item.price * item.qty, 0);

  const isShippingOrder = !!(
    order.shippingAddress?.address && 
    !order.shippingAddress.address.toLowerCase().includes('tại quầy') &&
    !order.shippingAddress.address.toLowerCase().includes('trực tiếp')
  );

  return (
    <div 
      className="p-4" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        height: 'calc(100vh - 56px)', 
        overflowY: 'auto',            
        scrollBehavior: 'smooth'      
      }}
    >
      {/* NÚT QUAY LẠI */}
      <Button variant="light" className="mb-3 border fw-semibold shadow-sm btn-sm" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" /> Quay lại danh sách
      </Button>

      {/* TIÊU ĐỀ ĐƠN HÀNG */}
      <Card className="mb-4 border-0 shadow-sm bg-white p-3 rounded">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary fs-4">
              <FaReceipt />
            </div>
            <div>
              <h4 className="text-dark mb-0 fw-bold">Chi Tiết Hóa Đơn #{order._id.toUpperCase()}</h4>
              <small className="text-muted"><FaRegCalendarAlt className="me-1" /> Ngày lập: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</small>
            </div>
          </div>
          <div>
            {order.isReturned ? (
              <Badge bg="danger" className="p-2 fw-bold fs-6"><FaUndoAlt className="me-1" /> ĐƠN ĐÃ HOÀN TRẢ</Badge>
            ) : isShippingOrder ? (
              <Badge bg="warning" className="text-dark p-2 fw-bold fs-6"><FaTruck className="me-1" /> ĐƠN GIAO HÀNG</Badge>
            ) : (
              <Badge bg="success" className="p-2 fw-bold fs-6"><FaShoppingBag className="me-1" /> BÁN TẠI QUẦY (POS)</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* THANH CẢNH BÁO HOÀN TRẢ */}
      {order.isReturned && (
        <div className="alert alert-danger d-flex align-items-center fw-bold rounded shadow-sm border-0 mb-4" role="alert">
          <FaExclamationTriangle className="me-2 fs-5" />
          HÓA ĐƠN NÀY ĐÃ ĐƯỢC HOÀN TRẢ VÀO LÚC: {order.returnedAt ? new Date(order.returnedAt).toLocaleString('vi-VN') : 'Hệ thống xác thực'} - TRẠNG THÁI DOANH THU ĐÃ HỦY GHI NHẬN.
        </div>
      )}

      <Row>
        <Col md={8}>
          <ListGroup variant='flush' className="shadow-sm rounded overflow-hidden border mb-4">
            {/* THÔNG TIN ĐỐI SOÁT */}
            <ListGroup.Item className="p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">👤 Phân loại đối soát giao dịch</h5>
              
              <p className="mb-2">
                <strong>Nhân viên xử lý (Thu ngân):</strong> {order.user?.name || 'Khách vãng lai'} 
                {order.user?.isAdmin && <Badge bg="danger" className="ms-1">Admin</Badge>}
              </p>
              <p className="mb-3"><strong>Email nhân viên:</strong> {order.user?.email ? <a href={`mailto:${order.user.email}`}>{order.user.email}</a> : 'Không có'}</p>
              
              {isShippingOrder ? (
                <>
                  <div className="bg-light p-3 rounded border mb-3">
                    <h6 className="fw-bold text-secondary mb-2">📍 Địa chỉ nhận hàng của khách</h6>
                    <p className="mb-1"><strong>Địa chỉ:</strong> {order.shippingAddress.address}</p>
                    <p className="mb-1"><strong>Thành phố:</strong> {order.shippingAddress.city}</p>
                    <p className="mb-0"><strong>Số điện thoại nhận:</strong> {order.shippingAddress.phone || 'Không có'}</p>
                  </div>

                  {order.isReturned ? (
                    <Message variant='danger'>
                      <FaUndoAlt className="me-2" /> Đơn hàng đã hoàn trả giao dịch
                    </Message>
                  ) : order.isDelivered ? (
                    <Message variant='success'>
                      <FaCheckCircle className="me-2" /> Đã giao hàng thành công lúc {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                    </Message>
                  ) : (
                    <Message variant='danger'>
                      <FaTimesCircle className="me-2" /> Đơn hàng đang chờ bàn giao vận chuyển
                    </Message>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-success bg-opacity-10 p-3 rounded border border-success border-opacity-20 mb-3">
                    <h6 className="fw-bold text-success mb-2">🌟 Thông tin hội viên tích điểm (Đối soát)</h6>
                    {order.shippingAddress?.phone ? (
                      <>
                        <p className="mb-1 text-dark"><strong>Số điện thoại tích điểm:</strong> <span className="text-primary fw-bold">{order.shippingAddress.phone}</span></p>
                        <p className="mb-1 text-muted small"><strong>Ghi chú hệ thống:</strong> Đơn mua trực tiếp - {order.isReturned ? 'Điểm thưởng đã bị khấu trừ hoàn trả lại kho điểm.' : 'Điểm đã được cộng tự động vào số điện thoại trên.'}</p>
                      </>
                    ) : (
                      <p className="mb-0 text-muted small">🛒 Đơn mua trực tiếp tại quầy vãng lai (Không tích điểm hội viên).</p>
                    )}
                  </div>
                  
                  {order.isReturned ? (
                    <Message variant='danger'>
                      <FaUndoAlt className="me-2" /> Giao dịch đã bị hủy và thực hiện hoàn trả hàng
                    </Message>
                  ) : (
                    <Message variant='success'>
                      <FaCheckCircle className="me-2" /> Giao dịch hoàn tất - Khách đã nhận đủ hàng tại quầy
                    </Message>
                  )}
                </>
              )}
            </ListGroup.Item>

            {/* THÔNG TIN THANH TOÁN */}
            <ListGroup.Item className="p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">💳 Phương thức thanh toán</h5>
              <p className="mb-3">
                <strong>Hình thức sử dụng: </strong>
                <Badge bg="secondary" className="bg-light text-dark border px-2 py-1">{order.paymentMethod || 'Tiền mặt'}</Badge>
              </p>
              {order.isReturned ? (
                <Message variant='danger'>
                  <FaUndoAlt className="me-2" /> Đã hoàn tiền mặt trả khách hàng
                </Message>
              ) : order.isPaid ? (
                <Message variant='success'>
                  <FaCheckCircle className="me-2" /> Đã xác nhận thanh toán lúc {order.paidAt && !isNaN(Date.parse(order.paidAt)) ? new Date(order.paidAt).toLocaleString('vi-VN') : (order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Hệ thống đã xác thực')}
                </Message>
              ) : (
                <Message variant='danger'>
                  <FaTimesCircle className="me-2" /> Chưa ghi nhận thanh toán
                </Message>
              )}
            </ListGroup.Item>

            {/* DANH SÁCH SẢN PHẨM MUA */}
            <ListGroup.Item className="p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">📦 Danh sách mặt hàng ({order.orderItems?.length || 0})</h5>
              {!order.orderItems || order.orderItems.length === 0 ? (
                <Message>Hóa đơn không có sản phẩm dữ liệu</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index} className="px-0 py-3" style={{ borderBottom: '1px dashed #eee' }}>
                      <Row className="align-items-center">
                        <Col md={1} xs={3}>
                          <Image
                            src={item.image || 'https://placehold.co/50x50?text=POS'}
                            alt={item.name}
                            fluid
                            rounded
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                        </Col>
                        <Col md={7} xs={9}>
                          <Link to={`/product/${item.product}`} className="fw-bold text-decoration-none text-dark">
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4} xs={12} className="text-end fw-semibold text-secondary mt-2 mt-md-0">
                          {item.qty} x {item.price?.toLocaleString('vi-VN')} đ ={' '}
                          <span className={order.isReturned ? "text-decoration-line-through text-muted" : "text-success"}>
                            {(item.qty * item.price)?.toLocaleString('vi-VN')} đ
                          </span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* CỘT TÍNH TIỀN & HÀNH ĐỘNG */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded overflow-hidden position-sticky" style={{ top: '10px' }}>
            <Card.Header className="bg-dark text-white fw-bold py-3 text-center">🧾 TÓM TẮT TÀI CHÍNH</Card.Header>
            <ListGroup variant='flush'>
              <ListGroup.Item className="d-flex justify-content-between py-3">
                <span className="text-muted">Tiền hàng:</span>
                <span className={order.isReturned ? "fw-bold text-decoration-line-through text-muted" : "fw-bold"}>
                  {itemsPrice?.toLocaleString('vi-VN')} đ
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between py-3">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="fw-bold">{isShippingOrder && order.shippingPrice ? `${order.shippingPrice.toLocaleString('vi-VN')} đ` : '0 đ'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between py-3">
                <span className="text-muted">Thuế VAT:</span>
                <span className="fw-bold">{order.taxPrice ? `${order.taxPrice.toLocaleString('vi-VN')} đ` : '0 đ'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between py-3 bg-light border-top border-bottom">
                <span className="fw-bold text-dark fs-5">TỔNG CỘNG:</span>
                <span className={`fw-bold fs-5 ${order.isReturned ? 'text-decoration-line-through text-danger' : 'text-primary'}`}>
                  {order.totalPrice?.toLocaleString('vi-VN')} đ
                </span>
              </ListGroup.Item>
              
              {/* 🔒 TRẢ HÀNG HOÀN KHO: Giữ nguyên chỉ Admin mới có quyền */}
              {userInfo && userInfo.isAdmin && !order.isReturned && (
                <ListGroup.Item className="p-3">
                  {loadingReturn && <Loader />}
                  <Button
                    type='button'
                    className='btn btn-warning w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2'
                    onClick={returnHandler}
                    disabled={loadingReturn}
                  >
                    <FaUndoAlt /> Trả Hàng & Hoàn Kho (POS)
                  </Button>
                </ListGroup.Item>
              )}

              {/* 🌟 ĐÃ CẬP NHẬT: Tất cả nhân viên (chỉ cần đăng nhập 'userInfo') đều có thể bấm Đã Giao Hàng */}
              {userInfo && isShippingOrder && !order.isDelivered && !order.isReturned && (
                <ListGroup.Item className="p-3">
                  {loadingDeliver && <Loader />}
                  <Button
                    type='button'
                    className='btn btn-success w-100 fw-bold py-2 shadow-sm'
                    onClick={deliverHandler}
                  >
                    🚀 Đánh dấu Đã Giao Hàng
                  </Button>
                </ListGroup.Item>
              )}

              {/* Hủy & Xóa đơn hàng */}
              {userInfo && (userInfo.isAdmin || (order.user && userInfo._id === order.user._id)) && !order.isDelivered && !order.isReturned && (
                <ListGroup.Item className="p-3 bg-light">
                  <Button
                    type='button'
                    className='btn btn-danger w-100 fw-bold py-2 shadow-sm'
                    onClick={cancelHandler}
                  >
                    🗑️ Hủy & Xóa Đơn Hàng này
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderScreen;