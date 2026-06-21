import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Form, Card, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTicketAlt, FaPlus, FaTrashAlt, FaCalendarAlt, FaPercentage, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listCoupons, createCoupon, deleteCoupon, couponCreateReset } from '../../slices/couponSlice';

const CouponListScreen = () => {
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [expiry, setExpiry] = useState('');

  const dispatch = useDispatch();

  const couponList = useSelector((state) => state.coupon);
  const { loading, error, coupons, successCreate } = couponList;

  useEffect(() => {
    if (successCreate) {
      setName('');
      setDiscount(0);
      setExpiry('');
      dispatch(couponCreateReset());
    }
    dispatch(listCoupons());
  }, [dispatch, successCreate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name || !expiry || !discount) {
      alert('Vui lòng điền đầy đủ thông tin mã giảm giá!');
      return;
    }
    dispatch(createCoupon({ name: name.trim().toUpperCase(), discount, expiry }));
  };

  const deleteHandler = (id) => {
    if (window.confirm('Cậu có chắc chắn muốn xóa mã giảm giá này không? Người dùng sẽ không thể áp mã này nữa.')) {
      dispatch(deleteCoupon(id));
    }
  };

  // Hàm kiểm tra hạn dùng của mã
  const checkStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return exp >= today;
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <div className="p-2 bg-primary text-white rounded-3 me-3 shadow-sm">
          <FaTicketAlt size={22} />
        </div>
        <div>
          <h4 className="fw-bold text-dark mb-0">Hệ Thống Quản Lý Mã Giảm Giá</h4>
          <small className="text-muted">Tạo và cấu hình các chương trình khuyến mãi toàn hệ thống</small>
        </div>
      </div>

      <Row className="g-4">
        {/* === CỘT TRÁI: FORM THÊM MÃ SANG CHẢNH === */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                <FaPlus className="text-primary me-2" size={14} /> Phát hành mã mới
              </h5>
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Mã ưu đãi (Voucher Code)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: GIAM50K, UTESHOP2026"
                    value={name}
                    className="fw-bold shadow-none border-secondary-subtle py-2"
                    style={{ letterSpacing: '1px' }}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Mức giảm giá (%)</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="number"
                      placeholder="Nhập số từ 1 đến 100"
                      value={discount || ''}
                      min="1"
                      max="100"
                      className="fw-bold shadow-none border-secondary-subtle py-2"
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                    <span className="input-group-text bg-light text-muted fw-bold"><FaPercentage /></span>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-secondary">Thời hạn kết thúc</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="date"
                      value={expiry}
                      className="fw-bold shadow-none border-secondary-subtle py-2"
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <span className="input-group-text bg-light text-muted"><FaCalendarAlt /></span>
                  </div>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 fw-bold py-2 shadow-sm rounded-3">
                  <FaPlus className="me-2" /> KÍCH HOẠT PHÁT HÀNH
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* === CỘT PHẢI: BẢNG DANH SÁCH MÃ SANG TRỌNG === */}
        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
            <Card.Body className="p-0">
              {loading ? (
                <div className="p-5 text-center"><Loader /></div>
              ) : error ? (
                <div className="p-3"><Message variant="danger">{error}</Message></div>
              ) : (
                <Table responsive hover className="align-middle mb-0 text-center">
                  <thead className="table-light text-secondary uppercase small fw-bold">
                    <tr>
                      <th className="text-start ps-4 py-3">TÊN VOUCHER</th>
                      <th>MỨC GIẢM</th>
                      <th>HẠN SỬ DỤNG</th>
                      <th>TRẠNG THÁI</th>
                      <th className="pe-4">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons && coupons.map((coupon) => {
                      const isValid = checkStatus(coupon.expiry);
                      return (
                        <tr key={coupon._id} className="border-bottom">
                          <td className="text-start ps-4 py-3">
                            <span className="px-2 py-1 rounded bg-success bg-opacity-10 text-success fw-bold font-monospace" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
                              {coupon.name}
                            </span>
                          </td>
                          <td className="fw-bold text-danger fs-6">{coupon.discount}%</td>
                          <td className="text-muted small">
                            <FaCalendarAlt className="me-1" />
                            {new Date(coupon.expiry).toLocaleDateString('vi-VN')}
                          </td>
                          <td>
                            {isValid ? (
                              <Badge bg="success" className="bg-opacity-10 text-success px-2 py-1.5 rounded-2 fw-semibold">
                                <FaCheckCircle className="me-1" /> Khả dụng
                              </Badge>
                            ) : (
                              <Badge bg="danger" className="bg-opacity-10 text-danger px-2 py-1.5 rounded-2 fw-semibold">
                                <FaTimesCircle className="me-1" /> Hết hạn
                              </Badge>
                            )}
                          </td>
                          <td className="pe-4">
                            <Button
                              variant="outline-danger"
                              className="btn-sm border-0 rounded-circle p-2"
                              onClick={() => deleteHandler(coupon._id)}
                            >
                              <FaTrashAlt size={14} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {coupons && coupons.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <FaTicketAlt size={40} className="text-black-50 opacity-25 mb-2" />
                          <p className="mb-0 small">Hệ thống chưa phát hành mã giảm giá nào.</p>
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

export default CouponListScreen;