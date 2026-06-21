import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Row, Col, Modal, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaHandshake, FaPhone, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';
import { listSuppliers, createSupplier, supplierReset } from '../../slices/supplierSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const SupplierListScreen = () => {
  const dispatch = useDispatch();

  // --- STATE BẬT TẮT MODAL THÊM NCC ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhoneInput] = useState('');
  const [address, setAddress] = useState('');

  const supplierList = useSelector((state) => state.supplier);
  const { suppliers, loading, error, successCreate } = supplierList;

  useEffect(() => {
    dispatch(listSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (successCreate) {
      setShowAddModal(false);
      // Reset các trường nhập form
      setName('');
      setContactName('');
      setPhoneInput('');
      setAddress('');
      dispatch(supplierReset());
    }
  }, [successCreate, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Vui lòng điền đủ Tên, Số điện thoại và Địa chỉ nhà cung cấp!');
      return;
    }
    dispatch(createSupplier({ name, contactName, phone, address }));
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
      {/* BANNER HEADER */}
      <Card className="mb-4 border-0 shadow-sm bg-white p-3 rounded">
        <Row className="align-items-center">
          <Col md={8} className="d-flex align-items-center">
            <div className="bg-info bg-opacity-10 p-3 rounded me-3">
              <FaHandshake className="text-info fs-3" />
            </div>
            <div>
              <h4 className="text-dark mb-1 fw-bold">Danh Sách Nhà Cung Cấp</h4>
              <small className="text-muted">Quản lý danh sách đối tác cung ứng hàng hóa và thông tin liên hệ đại diện kinh doanh</small>
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button 
              variant="info" 
              className="text-white fw-bold px-3 py-2 shadow-sm d-inline-flex align-items-center"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="me-2" /> Thêm Đối Tác Mới
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Card className="border-0 shadow-sm rounded overflow-hidden">
          <Table hover responsive className="align-middle mb-0" style={{ backgroundColor: '#fff' }}>
            <thead className="table-dark">
              <tr>
                <th className="ps-3" style={{ backgroundColor: '#17a2b8' }}>TÊN ĐỐI TÁC CUNG CẤP</th>
                <th style={{ backgroundColor: '#17a2b8' }}>NGƯỜI ĐẠI DIỆN</th>
                <th style={{ backgroundColor: '#17a2b8' }}>SỐ ĐIỆN THOẠI</th>
                <th style={{ backgroundColor: '#17a2b8' }}>ĐỊA CHỈ TRỤ SỞ</th>
                <th className="text-center" style={{ backgroundColor: '#17a2b8' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {suppliers && suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">Hệ thống chưa ghi nhận nhà cung cấp nào.</td>
                </tr>
              ) : (
                suppliers?.map((sup) => (
                  <tr key={sup._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td className="ps-3 fw-bold text-dark">{sup.name}</td>
                    <td className="text-secondary"><FaUserAlt className="me-1 small" /> {sup.contactName || '---'}</td>
                    <td className="fw-semibold text-primary"><FaPhone className="me-1 small" /> {sup.phone}</td>
                    <td className="text-muted" style={{ fontSize: '13px' }}><FaMapMarkerAlt className="me-1 small" /> {sup.address}</td>
                    <td className="text-center">
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">Đang hợp tác</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* ================= MODAL NỔI THÊM ĐỐI TÁC MỚI ================= */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">➕ Đăng Ký Nhà Cung Cấp Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tên Công ty/Nhà Cung Cấp <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ví dụ: Công ty TNHH Nước Giải Khát Suntory Pepsico" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tên Người Đại Diện/Sale liên hệ</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ví dụ: Anh Tuấn Anh Pepsi" 
                value={contactName} 
                onChange={(e) => setContactName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Số Điện Thoại Liên Hệ <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập số điện thoại đối tác..." 
                value={phone} 
                onChange={(e) => setPhoneInput(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Địa Chỉ Trụ Sở / Giao Hàng <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="Nhập địa chỉ văn phòng hoặc kho xuất hàng của đối tác..." 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="info" type="submit" className="w-100 text-white fw-bold py-2 mt-2 shadow-sm">
              🚀 LƯU ĐỐI TÁC VÀO HỆ THỐNG
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SupplierListScreen;