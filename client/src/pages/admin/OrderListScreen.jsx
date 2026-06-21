import React, { useEffect } from 'react';
import { Table, Button, Badge, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaReceipt, FaCheckCircle, FaTimesCircle, FaShoppingBag, FaTruck, FaUndoAlt } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
// 🌟 Import thêm hàm reset để dọn dẹp bộ nhớ store sau khi load xong danh sách
import { listOrders, deleteOrder, orderDeliverReset, orderReturnReset } from '../../slices/orderSlice';

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orderList = useSelector((state) => state.order);
  // 🌟 LẤY THÊM các cờ thông báo thành công từ slice để theo dõi biến động
  const { 
    loading, 
    error, 
    orders, 
    loadingDelete, 
    successDelete, 
    successDeliver, 
    successReturn 
  } = orderList;

  const userLogin = useSelector((state) => state.auth || state.user);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());

      // 🌟 DỌN DẸP TRẠNG THÁI: Nếu danh sách vừa cập nhật xong do giao hàng hoặc trả hàng,
      // ta hạ cờ success về false để tránh bị re-render vô hạn hoặc lệch logic ở các màn hình khác.
      if (successDeliver) {
        dispatch(orderDeliverReset());
      }
      if (successReturn) {
        dispatch(orderReturnReset());
      }
    } else {
      navigate('/login');
    }
    // 🌟 Đưa successDeliver và successReturn vào đây làm tai mắt lắng nghe sự thay đổi
  }, [dispatch, navigate, userInfo, successDelete, successDeliver, successReturn]);

  const deleteHandler = (id) => {
    if (window.confirm('🚨 CẢNH BÁO!\nXóa hóa đơn này sẽ làm thay đổi báo cáo doanh thu.\nBạn có chắc chắn muốn xóa?')) {
      dispatch(deleteOrder(id));
    }
  };

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
      {/* HEADER BANNER */}
      <Card className="mb-4 border-0 shadow-sm bg-white p-3 rounded">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
            <FaReceipt className="text-primary fs-3" />
          </div>
          <div>
            <h4 className="text-dark mb-1 fw-bold">Nhật Ký Giao Dịch & Hóa Đơn</h4>
            <small className="text-muted">Quản lý trạng thái thanh toán, xuất kho và lịch sử bán hàng đa kênh</small>
          </div>
        </div>
      </Card>

      {loadingDelete && <Loader />}
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Card className="border-0 shadow-sm rounded overflow-hidden mb-4">
          <Table hover responsive className='align-middle mb-0' style={{ backgroundColor: '#fff' }}>
            <thead className="table-dark">
              <tr>
                <th className="ps-3" style={{ backgroundColor: '#1a2d42' }}>MÃ HÓA ĐƠN</th>
                <th style={{ backgroundColor: '#1a2d42' }}>NHÂN VIÊN / KHÁCH HÀNG</th>
                <th style={{ backgroundColor: '#1a2d42' }}>NGÀY LẬP</th>
                <th style={{ backgroundColor: '#1a2d42' }}>HÌNH THỨC</th>
                <th className="text-end" style={{ backgroundColor: '#1a2d42' }}>TỔNG TIỀN</th>
                <th className="text-center" style={{ backgroundColor: '#1a2d42' }}>THANH TOÁN</th>
                <th className="text-center" style={{ backgroundColor: '#1a2d42' }}>TRẠNG THÁI GIAO</th>
                <th className="text-center" style={{ width: '130px', backgroundColor: '#1a2d42' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.map((order) => {
                const isShipping = !!(
                  order.shippingAddress?.address && 
                  !order.shippingAddress.address.toLowerCase().includes('tại quầy') &&
                  !order.shippingAddress.address.toLowerCase().includes('trực tiếp')
                );
                return (
                  <tr 
                    key={order._id} 
                    style={{ 
                      borderBottom: '1px solid #eee',
                      backgroundColor: order.isReturned ? '#fff5f5' : 'transparent'
                    }}
                  >
                    <td className="ps-3 fw-bold text-secondary" style={{ fontSize: '13px' }}>
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </td>
                    <td className="fw-bold text-dark">
                      {order.user ? order.user.name : <span className="text-muted">Khách vãng lai</span>}
                    </td>
                    <td className="text-muted" style={{ fontSize: '13px' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td>
                      {isShipping ? (
                        <Badge bg="warning" className="text-dark fw-semibold"><FaTruck className="me-1" /> Giao hàng</Badge>
                      ) : (
                        <Badge bg="success" className="bg-opacity-10 text-success fw-semibold"><FaShoppingBag className="me-1" /> Tại quầy</Badge>
                      )}
                    </td>
                    
                    <td className="text-end fw-bold" style={{ fontSize: '15px' }}>
                      {order.isReturned ? (
                        <span className="text-decoration-line-through text-muted" title="Đơn hàng đã hoàn tiền">
                          {order.totalPrice?.toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-primary">
                          {order.totalPrice?.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      {order.isReturned ? (
                        <Badge bg="secondary" className="px-2 py-1 text-dark bg-opacity-25"><FaUndoAlt className="me-1" /> Đã hoàn tiền</Badge>
                      ) : order.isPaid ? (
                        <Badge bg="success" className="px-2 py-1"><FaCheckCircle className="me-1" /> Đã thanh toán</Badge>
                      ) : (
                        <Badge bg="danger" className="px-2 py-1"><FaTimesCircle className="me-1" /> Chờ xử lý</Badge>
                      )}
                    </td>

                    <td className="text-center">
                      {order.isReturned ? (
                        <Badge bg="danger" className="px-2 py-1 fw-bold"><FaUndoAlt className="me-1" /> Đã hoàn trả</Badge>
                      ) : order.isDelivered ? (
                        <Badge bg="success" className="px-2 py-1">Đã hoàn thành</Badge>
                      ) : isShipping ? (
                        <Badge bg="info" className="text-white px-2 py-1">Đang giao hàng</Badge>
                      ) : (
                        <Badge bg="light" className="text-dark border px-2 py-1">Đã lấy tại chỗ</Badge>
                      )}
                    </td>

                    <td className="text-center">
                      <Button 
                        variant='outline-primary' 
                        className='btn-sm me-1 border-0 shadow-sm' 
                        title="Xem chi tiết"
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        <FaEye />
                      </Button>

                      <Button
                        variant='outline-danger'
                        className='btn-sm border-0 shadow-sm'
                        onClick={() => deleteHandler(order._id)}
                        title="Xóa hóa đơn"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default OrderListScreen;