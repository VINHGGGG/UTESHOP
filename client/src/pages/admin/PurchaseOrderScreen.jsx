import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Card, Table, Badge, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTruck, FaUser, FaBarcode } from 'react-icons/fa';
import { listPurchaseOrders, completePurchaseOrder, purchaseReset } from '../../slices/purchaseSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const PurchaseOrderScreen = () => {
  const { id: purchaseId } = useParams();
  const dispatch = useDispatch();

  // --- LẤY THÔNG TIN TỪ REDUX STORE ---
  const purchaseList = useSelector((state) => state.purchase);
  const { purchases, loading, error, successComplete } = purchaseList;

  // Vì Action lấy danh sách phiếu trả về một mảng, ta sẽ find phiếu đúng với ID trên URL
  const purchase = purchases?.find((p) => p._id === purchaseId);

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  useEffect(() => {
  // Lần đầu tiên vào trang, nếu chưa có danh sách phiếu thì tải về
  if (!purchases || purchases.length === 0) {
    dispatch(listPurchaseOrders());
  }
}, [dispatch]); // Chỉ chạy 1 lần khi mount trang

useEffect(() => {
  // Khi duyệt thành công (successComplete chuyển sang true)
  if (successComplete) {
    dispatch(listPurchaseOrders()); // Tải lại danh sách mới đã cập nhật trạng thái
    dispatch(purchaseReset());      // Tắt cờ báo thành công ngay lập tức để ngắt mạch lặp
  }
}, [dispatch, successComplete]); // Tuyệt đối KHÔNG bỏ "purchases" vào đây nha cậu
  // --- HÀM XỬ LÝ PHÊ DUYỆT NHẬP KHO CỘNG VÀO CSDL ---
  const completeOrderHandler = () => {
    if (window.confirm('Bạn có chắc chắn xác nhận lô hàng này đã kiểm đếm xong và nhập vào kho không?\nHành động này sẽ cộng dồn số lượng vào hệ thống!')) {
      dispatch(completePurchaseOrder(purchaseId));
    }
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : !purchase ? (
    <div className="p-4">
      <Message variant='danger'>Không tìm thấy dữ liệu của phiếu nhập hàng này.</Message>
      <Link to='/admin/purchase' className='btn btn-light btn-sm'><FaArrowLeft /> Quay lại nhật ký</Link>
    </div>
  ) : (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
      
      {/* NÚT QUAY LẠI */}
      <Link to='/admin/purchase' className='btn btn-outline-secondary btn-sm mb-3 fw-bold shadow-sm d-inline-flex align-items-center'>
        <FaArrowLeft className="me-1" /> QUAY LẠI NHẬT KÝ
      </Link>

      <Row className="g-3">
        {/* ================= KHỐI BÊN TRÁI: THÔNG TIN CHỨNG TỪ & SẢN PHẨM ================= */}
        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-3 mb-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Phiếu Nhập Hàng #{purchase._id.substring(purchase._id.length - 8).toUpperCase()}</h5>
                <small className="text-muted">Ngày lập: {new Date(purchase.createdAt).toLocaleString('vi-VN')}</small>
              </div>
              <div>
                {purchase.status === 'Completed' ? (
                  <Badge bg="success" className="fs-6 px-3 py-2">
                    <FaCheckCircle className="me-1" /> Đã vào kho
                  </Badge>
                ) : (
                  <Badge bg="warning" className="text-dark fs-6 px-3 py-2">
                    <FaClock className="me-1" /> Chờ duyệt vào kho
                  </Badge>
                )}
              </div>
            </div>

            {/* Khối Thông tin Nhân viên & Nhà cung cấp */}
            <Row className="g-2 mb-4">
              <Col sm={6}>
                <div className="p-2 border rounded-3 bg-light h-100">
                  <div className="fw-bold text-success mb-1" style={{ fontSize: '13px' }}>
                    <FaUser className="me-1" /> NHÂN VIÊN LẬP PHIẾU
                  </div>
                  <div className="fw-bold text-dark">{purchase.user?.name || 'Hệ thống'}</div>
                  <small className="text-muted">{purchase.user?.email || 'N/A'}</small>
                </div>
              </Col>
              <Col sm={6}>
                <div className="p-2 border rounded-3 bg-light h-100">
                  <div className="fw-bold text-primary mb-1" style={{ fontSize: '13px' }}>
                    <FaTruck className="me-1" /> ĐỐI TÁC CUNG CẤP
                  </div>
                  <div className="fw-bold text-dark">{purchase.supplier?.name || <span className="text-danger">Đã xóa đối tác</span>}</div>
                  <small className="text-muted">SĐT: {purchase.supplier?.phone || '---'}</small>
                </div>
              </Col>
            </Row>

            {/* Bảng Danh Sách Sản Phẩm Thực Tế Nhập */}
            <h6 className="fw-bold text-dark mb-2">📦 Chi Tiết Danh Mục Hàng Hóa</h6>
            <Table responsive hover bordered size="sm" className="align-middle mb-0 text-center">
              <thead className="table-secondary">
                <tr style={{ fontSize: '13px' }}>
                  <th>STT</th>
                  <th className="text-start">Tên Sản Phẩm</th>
                  <th>Mã ID sản phẩm</th>
                  <th>Số Lượng Nhập</th>
                  <th className="text-end">Giá Vốn Nhập</th>
                  <th className="text-end">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items?.map((item, index) => (
                  <tr key={index} style={{ fontSize: '13px' }}>
                    <td>{index + 1}</td>
                    <td className="text-start fw-bold text-dark">{item.name}</td>
                    <td className="text-muted" style={{ fontSize: '11px' }}><FaBarcode /> {item.product}</td>
                    <td className="fw-bold text-primary">{item.qty}</td>
                    <td className="text-end">{item.importPrice?.toLocaleString('vi-VN')} đ</td>
                    <td className="text-end fw-bold text-success">
                      {(item.qty * item.importPrice)?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        {/* ================= KHỐI BÊN PHẢI: TÓM TẮT CHI PHÍ & NÚT PHÊ DUYỆT ================= */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-white p-3">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">💰 Tóm Tắt Giá Vốn Lô Hàng</h6>
            
            <div className="d-flex justify-content-between mb-2 pb-2 border-bottom text-secondary" style={{ fontSize: '14px' }}>
              <span>Tổng số mặt hàng:</span>
              <span className="fw-bold text-dark">{purchase.items?.length} loại</span>
            </div>

            <div className="d-flex justify-content-between mb-3 p-2 bg-success bg-opacity-10 rounded align-items-center">
              <span className="fw-bold text-success" style={{ fontSize: '14px' }}>TỔNG TIỀN PHẢI TRẢ:</span>
              <span className="fw-bold text-success fs-4">
                {purchase.totalPrice?.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* NÚT THAO TÁC DUYỆT KHO (Chỉ hiển thị khi trạng thái là Pending và tài khoản là Admin) */}
            {purchase.status === 'Pending' && userInfo && userInfo.isAdmin && (
              <Button
                variant="success"
                size="lg"
                className="w-100 fw-bold py-2 mt-2 shadow-sm"
                onClick={completeOrderHandler}
              >
                <FaCheckCircle className="me-2" /> XÁC NHẬN VÀO KHO
              </Button>
            )}

            {purchase.status === 'Completed' && (
              <div className="alert alert-success text-center py-2 mb-0 border-0 fw-semibold" style={{ fontSize: '13px' }}>
                ✓ Lô hàng này đã được kiểm đếm và cộng dồn vào số lượng tồn kho thành công.
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PurchaseOrderScreen;