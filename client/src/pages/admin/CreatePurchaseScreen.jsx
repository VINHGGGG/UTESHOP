import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Card, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaSave, FaTruck, FaSearch, FaBoxes } from 'react-icons/fa';
import { listSuppliers } from '../../slices/supplierSlice';
import { listProducts } from '../../slices/productSlice';
import { createPurchaseOrder, purchaseReset } from '../../slices/purchaseSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const CreatePurchaseScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- CÁC STATE CỦA ĐƠN NHẬP KHO ---
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [searchProductKey, setSearchProductKey] = useState('');
  const [importStatus, setImportStatus] = useState('Completed'); // Mặc định vào kho luôn

  // --- LẤY DỮ LIỆU TỪ REDUX STORE ---
  const supplierList = useSelector((state) => state.supplier);
  const { suppliers, loading: loadingSuppliers, error: errorSuppliers } = supplierList;

  const productList = useSelector((state) => state.product);
  const { products, loading: loadingProducts } = productList;

  const purchaseCreate = useSelector((state) => state.purchase);
  const { successCreate, loading: loadingCreate, error: errorCreate } = purchaseCreate;

  useEffect(() => {
    dispatch(listSuppliers());
    dispatch(listProducts('')); // Lấy toàn bộ sản phẩm để chọn nhanh
  }, [dispatch]);

  useEffect(() => {
    if (successCreate) {
      dispatch(purchaseReset());
      navigate('/admin/purchase'); // Nhập kho xong quay về nhật ký
    }
  }, [successCreate, navigate, dispatch]);

  // --- THAO TÁC THÊM SẢN PHẨM VÀO PHIẾU NHẬP ---
  const addItemHandler = (product) => {
    const existItem = purchaseItems.find((x) => x.product === product._id);

    if (existItem) {
      // Nếu sản phẩm đã có trong danh sách chờ, tăng số lượng lên 1
      setPurchaseItems(
        purchaseItems.map((x) =>
          x.product === product._id ? { ...x, qty: x.qty + 1 } : x
        )
      );
    } else {
      // Nếu chưa có, thêm mới với giá vốn mặc định tạm lấy từ giá bán / 1.3 (hoặc 0 tùy cậu)
      setPurchaseItems([
        ...purchaseItems,
        {
          product: product._id,
          name: product.name,
          qty: 1,
          importPrice: Math.round(product.price ? product.price * 0.7 : 0), // Giả định giá nhập bằng 70% giá bán lẻ
        },
      ]);
    }
  };

  // --- CẬP NHẬT SỐ LƯỢNG / GIÁ NHẬP TRỰC TIẾP TRÊN BẢNG ---
  const updateQtyHandler = (id, qty) => {
    setPurchaseItems(
      purchaseItems.map((item) =>
        item.product === id ? { ...item, qty: Number(qty) < 1 ? 1 : Number(qty) } : item
      )
    );
  };

  const updatePriceHandler = (id, price) => {
    setPurchaseItems(
      purchaseItems.map((item) =>
        item.product === id ? { ...item, importPrice: Number(price) < 0 ? 0 : Number(price) } : item
      )
    );
  };

  // --- XÓA MÓN KHỎI DANH SÁCH CHỜ ---
  const removeItemHandler = (id) => {
    setPurchaseItems(purchaseItems.filter((x) => x.product !== id));
  };

  // --- TÍNH TỔNG TIỀN PHIẾU NHẬP ---
  const totalImportPrice = purchaseItems.reduce(
    (acc, item) => acc + item.qty * item.importPrice,
    0
  );

  // --- GỬI ĐƠN LÊN BACKEND ---
  const submitHandler = (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      alert('Vui lòng chọn Nhà cung cấp trước khi lưu phiếu!');
      return;
    }
    if (purchaseItems.length === 0) {
      alert('Danh sách hàng nhập đang trống!');
      return;
    }

    dispatch(
      createPurchaseOrder({
        supplier: selectedSupplier,
        items: purchaseItems,
        status: importStatus,
      })
    );
  };

  // Bộ lọc sản phẩm theo ô tìm kiếm nhanh
  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchProductKey.toLowerCase())
  );

  return (
    <div 
      className="p-3 bg-light" 
      style={{ 
        height: 'calc(100vh - 56px)', 
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {errorCreate && <Message variant="danger">{errorCreate}</Message>}
      {loadingCreate && <Loader />}

      <Row className="h-100 g-3">
        {/* ================= KHỐI BÊN TRÁI: CHỌN NCC & TÌM SẢN PHẨM ================= */}
        <Col md={8} className="d-flex flex-column h-100" style={{ overflowY: 'auto' }}>
          {/* 1. Khối Chọn Nhà Cung Cấp */}
          <Card className="border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
            <h6 className="fw-bold text-success mb-2">
              <FaTruck className="me-2" /> 1. Chọn Đối Tác Cung Cấp Hàng Hóa
            </h6>
            {loadingSuppliers ? (
              <Loader />
            ) : errorSuppliers ? (
              <Message variant="danger">{errorSuppliers}</Message>
            ) : (
              <Form.Select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="form-control-lg border-2"
                style={{ borderColor: '#28a745' }}
              >
                <option value="">-- Bấm vào đây để chọn nhà cung cấp hàng --</option>
                {suppliers?.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name} ({sup.phone})
                  </option>
                ))}
              </Form.Select>
            )}
          </Card>

          {/* 2. Khối Chọn Sản Phẩm Đẩy Vào Kho */}
          <Card className="border-0 shadow-sm p-3 bg-white rounded-3 flex-grow-1 d-flex flex-column">
            <h6 className="fw-bold text-primary mb-2">
              <FaBoxes className="me-2" /> 2. Tìm & Thêm Hàng Hóa Vào Phiếu
            </h6>
            <InputGroup className="mb-3">
              <InputGroup.Text className="bg-primary text-white border-0">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Gõ tên hoặc quét mã vạch sản phẩm cần nhập kho..."
                value={searchProductKey}
                onChange={(e) => setSearchProductKey(e.target.value)}
              />
            </InputGroup>

            {/* Danh sách lưới sản phẩm để click chọn nhanh */}
            <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '350px' }}>
              <Row className="g-2">
                {filteredProducts?.slice(0, 12).map((prod) => (
                  <Col xs={4} key={prod._id}>
                    <Card 
                      className="h-100 border text-center p-2 action-card" 
                      style={{ cursor: 'pointer', fontSize: '13px' }}
                      onClick={() => addItemHandler(prod)}
                    >
                      <div className="fw-bold text-truncate text-dark">{prod.name}</div>
                      <small className="text-muted">Tồn: {prod.countInStock || 0}</small>
                      <div className="text-primary mt-1 fw-semibold">
                        + Thêm vào phiếu
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>

        {/* ================= KHỐI BÊN PHẢI (FIXED PANEL): SỬA SỐ LƯỢNG & TỔNG TIỀN ================= */}
        <Col md={4} className="d-flex flex-column h-100">
          <Card className="border-0 shadow-sm h-100 bg-white rounded-3 p-3 d-flex flex-column">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-2">
              📋 Danh Sách Chờ Nhập Kho ({purchaseItems.length})
            </h6>

            {/* Bảng chỉnh sửa số lượng, giá vốn */}
            <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
              {purchaseItems.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-shopping-cart fs-1 mb-2 d-block text-opacity-20 text-dark"></i>
                  Chưa có sản phẩm nào được chọn để nhập.
                </div>
              ) : (
                <Table responsive hover size="sm" className="align-middle">
                  <thead>
                    <tr className="table-light" style={{ fontSize: '12px' }}>
                      <th>Tên món</th>
                      <th style={{ width: '70px' }}>SL</th>
                      <th style={{ width: '100px' }}>Giá Nhập</th>
                      <th className="text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item) => (
                      <tr key={item.product} style={{ fontSize: '13px' }}>
                        <td className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                          {item.name}
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.qty}
                            onChange={(e) => updateQtyHandler(item.product, e.target.value)}
                            className="text-center px-1"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.importPrice}
                            onChange={(e) => updatePriceHandler(item.product, e.target.value)}
                            className="text-end px-1"
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removeItemHandler(item.product)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>

            {/* Phần Tóm Tắt Tài Chính & Chốt Đơn */}
            <div className="border-top pt-3 bg-white mt-auto">
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold text-muted">Trạng thái chứng từ:</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={importStatus} 
                  onChange={(e) => setImportStatus(e.target.value)}
                >
                  <option value="Completed">Cộng kho luôn (Completed)</option>
                  <option value="Pending">Lưu nháp / Chờ duyệt (Pending)</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center my-3 p-2 bg-light rounded">
                <span className="fw-bold text-secondary">TỔNG TIỀN VỐN:</span>
                <span className="fw-bold text-success fs-4">
                  {totalImportPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-100 fw-bold py-2 shadow"
                onClick={submitHandler}
                disabled={purchaseItems.length === 0}
              >
                <FaSave className="me-2" /> XÁC NHẬN NHẬP KHO
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreatePurchaseScreen;