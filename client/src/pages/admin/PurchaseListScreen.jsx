import React, { useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaReceipt, FaCheckCircle, FaClock, FaPlus, FaWarehouse } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
// Thay thế đường dẫn slice thực tế trong dự án của cậu nhé
import { listPurchaseOrders, purchaseReset } from '../../slices/purchaseSlice'; 

const PurchaseListScreen = () => {
  const dispatch = useDispatch();
const navigate = useNavigate();

const purchaseList = useSelector((state) => state.purchase);
const { purchases, loading: isLoading, error } = purchaseList;
const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

useEffect(() => {
  if (!userInfo || !userInfo.isAdmin) {
    navigate('/login');
  } else {
    dispatch(listPurchaseOrders());
    dispatch(purchaseReset()); // Reset các cờ trạng thái cũ
  }
}, [dispatch, navigate, userInfo]);

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
      {/* HEADER BANNER & NÚT TẠO PHIẾU */}
      <Card className="mb-4 border-0 shadow-sm bg-white p-3 rounded">
        <Row className="align-items-center">
          <Col md={8} className="d-flex align-items-center">
            <div className="bg-success bg-opacity-10 p-3 rounded me-3">
              <FaWarehouse className="text-success fs-3" />
            </div>
            <div>
              <h4 className="text-dark mb-1 fw-bold">Nhật Ký Nhập Hàng & Kho Vận</h4>
              <small className="text-muted">Quản lý danh sách đơn mua từ nhà cung cấp, theo dõi giá vốn và phê duyệt hàng vào kho</small>
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button 
              variant="success" 
              className="fw-bold px-3 py-2 shadow-sm d-inline-flex align-items-center"
              onClick={() => navigate('/admin/purchase/create')}
            >
              <FaPlus className="me-2" /> Lập Phiếu Nhập Kho
            </Button>
          </Col>
        </Row>
      </Card>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <Card className="border-0 shadow-sm rounded overflow-hidden mb-4">
          <Table hover responsive className='align-middle mb-0' style={{ backgroundColor: '#fff' }}>
            <thead className="table-dark">
              <tr>
                <th className="ps-3" style={{ backgroundColor: '#1e3a2f' }}>MÃ PHIẾU</th>
                <th style={{ backgroundColor: '#1e3a2f' }}>NHÀ CUNG CẤP</th>
                <th style={{ backgroundColor: '#1e3a2f' }}>NGƯỜI LẬP PHIẾU</th>
                <th style={{ backgroundColor: '#1e3a2f' }}>NGÀY NHẬP KHO</th>
                <th className="text-end" style={{ backgroundColor: '#1e3a2f' }}>TỔNG GIÁ VỐN</th>
                <th className="text-center" style={{ backgroundColor: '#1e3a2f' }}>TRẠNG THÁI</th>
                <th className="text-center" style={{ width: '100px', backgroundColor: '#1e3a2f' }}>XEM</th>
              </tr>
            </thead>
            <tbody>
              {purchases && purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Chưa có phiếu nhập hàng nào được ghi nhận.</td>
                </tr>
              ) : (
                purchases?.map((purchase) => (
                  <tr key={purchase._id} style={{ borderBottom: '1px solid #eee' }}>
                    {/* Mã phiếu lấy 8 ký tự cuối viết hoa cho gọn */}
                    <td className="ps-3 fw-bold text-secondary" style={{ fontSize: '13px' }}>
                      #{purchase._id.substring(purchase._id.length - 8).toUpperCase()}
                    </td>
                    {/* Nhà cung cấp liên kết từ bảng Supplier */}
                    <td className="fw-bold text-dark">
                      {purchase.supplier ? purchase.supplier.name : <span className="text-danger">N/A (Đã xóa)</span>}
                    </td>
                    {/* Nhân viên lập phiếu */}
                    <td className="text-muted">
                      {purchase.user ? purchase.user.name : 'Hệ thống'}
                    </td>
                    {/* Ngày lập */}
                    <td className="text-muted" style={{ fontSize: '13px' }}>
                      {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    {/* Tổng tiền vốn bỏ ra */}
                    <td className="text-end fw-bold text-success" style={{ fontSize: '15px' }}>
                      {purchase.totalPrice?.toLocaleString('vi-VN')} đ
                    </td>
                    {/* Trạng thái phiếu nhập */}
                    <td className="text-center">
                      {purchase.status === 'Completed' ? (
                        <Badge bg="success" className="px-2 py-1">
                          <FaCheckCircle className="me-1" /> Đã vào kho
                        </Badge>
                      ) : (
                        <Badge bg="warning" className="text-dark px-2 py-1">
                          <FaClock className="me-1" /> Chờ duyệt
                        </Badge>
                      )}
                    </td>
                    {/* Hành động xem chi tiết */}
                    <td className="text-center">
                      <LinkContainer to={`/admin/purchase/${purchase._id}`}>
                        <Button variant='outline-success' className='btn-sm border-0 shadow-sm' title="Xem chi tiết phiếu nhập">
                          <FaEye />
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default PurchaseListScreen;