import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, Badge, InputGroup, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { listProducts, deleteProduct, createProduct, productReset } from '../../slices/productSlice';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBox, FaExclamationTriangle, FaBarcode } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const productList = useSelector((state) => state.product);
  const { products, loading, error, successDelete, successCreate, product: createdProduct } = productList;

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(productReset());

    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    }

    if (successCreate) {
      navigate(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch(listProducts());
    }
  }, [dispatch, navigate, userInfo, successDelete, successCreate, createdProduct]);

  const deleteHandler = (id) => {
    if (window.confirm('🚨 HÀNG HÓA SẼ BỊ XÓA VĨNH VIỄN!\nBạn có chắc muốn xóa mặt hàng này khỏi kho dữ liệu?')) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    if (window.confirm('Tạo một khung sản phẩm mới để nhập liệu?')) {
      dispatch(createProduct());
    }
  };

  // 🎯 1. CẬP NHẬT BỘ LỌC SẢN PHẨM (So sánh tên danh mục an toàn)
  const filteredProducts = products ? products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm) || 
      product._id?.includes(searchTerm);
    
    // Lấy tên danh mục ra để so sánh chính xác với chuỗi selectedCategory
    const productCategoryName = product.category && typeof product.category === 'object' 
      ? product.category.name 
      : product.category || '';

    const matchesCategory = selectedCategory === '' || productCategoryName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  // 🎯 2. SỬA LỖI GOM DANH MỤC: Chỉ map lấy chuỗi "name" trước khi bỏ vào Set lọc trùng
  const categories = products 
    ? [...new Set(products.map(p => {
        if (p.category && typeof p.category === 'object') {
          return p.category.name; // Lấy chuỗi tên danh mục nếu là Object đã populate
        }
        return p.category; // Chuỗi chữ thông thường nếu chưa populate
      }).filter(Boolean))] 
    : [];

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER BANNER - CỐ ĐỊNH */}
      <Row className='align-items-center mb-3 bg-white p-3 rounded shadow-sm mx-0'>
        <Col>
          <h4 className="text-dark mb-1 fw-bold">
            <FaBox className="text-primary me-2" /> Danh Mục Hàng Hóa & Tồn Kho
          </h4>
          <small className="text-muted">Quản lý mã vạch, đơn vị tính, giá cả và số lượng sản phẩm trong siêu thị</small>
        </Col>
        <Col className='text-end'>
          <Button variant="primary" className="fw-bold px-4" onClick={createProductHandler}>
            <FaPlus className="me-2" /> Thêm Mặt Hàng Mới
          </Button>
        </Col>
      </Row>

      {/* THANH BỘ LỌC - CỐ ĐỊNH */}
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Quét mã vạch hoặc gõ tên sản phẩm, mã ID cần tìm..."
                  className="border-start-0 ps-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Tất cả nhóm hàng hóa --</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-grid">
              <div className="text-end align-self-center text-muted fw-bold">
                Tổng: <span className="text-primary">{filteredProducts.length}</span> mã hàng
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}

      {/* KHỐI CHỨA BẢNG ĐÃ ĐƯỢC THÊM TÍNH NĂNG CUỘN DỌC */}
      {!loading && !error && (
        <Card className="border-0 shadow-sm rounded overflow-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', width: '100%' }}>
            <Table hover responsive className='align-middle mb-0' style={{ backgroundColor: '#fff', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="ps-3" style={{ width: '100px', backgroundColor: '#1a2d42' }}>Ảnh</th>
                  <th style={{ width: '140px', backgroundColor: '#1a2d42' }}><FaBarcode className="me-1" /> Mã vạch / ID</th>
                  <th style={{ backgroundColor: '#1a2d42' }}>Tên sản phẩm / Quy cách</th>
                  <th style={{ backgroundColor: '#1a2d42' }}>Nhóm hàng</th>
                  <th className="text-end" style={{ backgroundColor: '#1a2d42' }}>Giá vốn</th>
                  <th className="text-end" style={{ backgroundColor: '#1a2d42' }}>Giá bán lẻ</th>
                  <th className="text-center" style={{ backgroundColor: '#1a2d42' }}>Tồn kho</th>
                  <th className="text-center" style={{ width: '120px', backgroundColor: '#1a2d42' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Không tìm thấy sản phẩm nào khớp với bộ lọc dữ liệu!
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td className="ps-3">
                        <img 
                          src={product.image || '/images/sample.jpg'} 
                          alt={product.name} 
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=POS'; }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-secondary" style={{ fontSize: '13px' }}>
                          {product.barcode || '⚠️ Chưa gán mã'}
                        </div>
                        <small className="text-muted" style={{ fontSize: '11px' }}>ID: ...{product._id.substring(product._id.length - 6)}</small>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{product.name}</div>
                        <Badge bg="secondary" size="sm" className="bg-light text-dark border">
                          ĐVT: {product.unit || 'Cái'}
                        </Badge>
                      </td>
                      <td>
                        {/* 🎯 3. RENDERING AN TOÀN: Kiểm tra kiểu dữ liệu của category tránh crash ứng dụng */}
                        <Badge bg="info" className="bg-opacity-10 text-info px-2 py-1 fw-semibold" style={{ fontSize: '12px' }}>
                          {product.category && typeof product.category === 'object' 
                            ? product.category.name 
                            : product.category || 'Hàng phổ thông'}
                        </Badge>
                      </td>
                      <td className="text-end text-muted" style={{ fontSize: '14px' }}>
                        {product.costPrice ? `${product.costPrice.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                      <td className="text-end fw-bold text-success" style={{ fontSize: '15px' }}>
                        {product.price?.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="text-center">
                        {product.countInStock <= 0 ? (
                          <Badge bg="danger" className="px-2 py-1">Hết hàng (0)</Badge>
                        ) : product.countInStock <= 10 ? (
                          <Badge bg="warning" className="text-dark px-2 py-1">
                            <FaExclamationTriangle className="me-1" /> Sắp hết ({product.countInStock})
                          </Badge>
                        ) : (
                          <Badge bg="success" className="px-2 py-1">Sẵn có ({product.countInStock})</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Link to={`/admin/product/${product._id}/edit`}>
                          <Button variant='outline-primary' className='btn-sm me-1 border-0 shadow-sm'>
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button
                          variant='outline-danger'
                          className='btn-sm border-0 shadow-sm'
                          onClick={() => deleteHandler(product._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductListScreen;