import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listProductDetails, updateProduct, productReset } from '../../slices/productSlice';
// 🌟 IMPORT THÊM ACTION LẤY DANH MỤC
import { listCategories } from '../../slices/categorySlice';
import axios from 'axios';
import { FaSave, FaArrowLeft, FaBarcode, FaBoxOpen } from 'react-icons/fa';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [costPrice, setCostPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(''); // Lưu trữ _id hoặc tên danh mục được chọn
  const [countInStock, setCountInStock] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const productData = useSelector((state) => state.product);
  const { loading, error, product, successUpdate } = productData;

  // 🌟 LẤY DANH SÁCH DANH MỤC TỪ REDUX STORE
  const categoryList = useSelector((state) => state.category || {});
  const { categories = [], loading: loadingCategories } = categoryList;

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    const CLOUD_NAME = 'dfgtfaozb';      
    const UPLOAD_PRESET = 'plhkfe3i';   

    formData.append('upload_preset', UPLOAD_PRESET);
    setUploading(true);

    try {
      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      setImage(data.secure_url); 
      setUploading(false);
      alert('🎉 Tải ảnh lên Cloudinary thành công rồi cậu nhé!');
    } catch (error) {
      console.error('Lỗi upload Cloudinary:', error);
      setUploading(false);
      alert('❌ Lỗi upload ảnh! Hãy kiểm tra lại Cloud Name hoặc Upload Preset nha.');
    }
  };

  useEffect(() => {
    // Gọi API lấy danh mục hàng hóa đổ vào Dropdown
    dispatch(listCategories());

    if (successUpdate) {
      dispatch(productReset());
      navigate('/admin/productlist');
    } else {
      if (!product.name || product._id !== productId) {
        dispatch(listProductDetails(productId));
      } else {
        setName(product.name || '');
        setBarcode(product.barcode || '');
        setUnit(product.unit || 'Cái');
        setCostPrice(product.costPrice || 0);
        setPrice(product.price || 0);
        setImage(product.image || '');
        setBrand(product.brand || '');
        
        // 🌟 Nếu Backend của cậu lưu Category dạng Object ID thì lấy ._id, còn nếu lưu dạng chữ thì giữ nguyên product.category
        setCategory(product.category?._id || product.category || '');
        
        setCountInStock(product.countInStock || 0);
        setExpiryDate(product.expiryDate ? product.expiryDate.substring(0, 10) : '');
        setDescription(product.description || '');
      }
    }
  }, [dispatch, navigate, productId, product, successUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      updateProduct({
        _id: productId,
        name,
        barcode,
        unit,
        costPrice,
        price,
        image,
        brand,
        category, // Giá trị được chọn từ Dropdown truyền xuống DB
        countInStock,
        expiryDate,
        description,
      })
    );
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* NÚT QUAY LẠI - CỐ ĐỊNH */}
      <div>
        <Link to='/admin/productlist' className='btn btn-light mb-3 border shadow-sm btn-sm fw-bold text-secondary'>
          <FaArrowLeft className="me-1" /> Danh sách hàng hóa
        </Link>
      </div>

      {/* VÙNG CHỨA FORM CÓ THỂ CUỘN DỌC */}
      <Row className="justify-content-center" style={{ flex: 1, overflow: 'hidden' }}>
        <Col md={10} lg={8} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card className="border-0 shadow-sm rounded" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 120px)' }}>
            <Card.Header className="bg-dark text-white p-3 fw-bold d-flex align-items-center" style={{ shrink: 0 }}>
              <FaBoxOpen className="me-2 text-info" /> CẬP NHẬT THÔNG TIN HÀNG HÓA SIÊU THỊ
            </Card.Header>
            
            {/* VÙNG BODY CHO PHÉP SCROLL NỘI BỘ FORM */}
            <Card.Body className="p-4" style={{ overflowY: 'auto', flex: 1 }}>
              
              {loading && <Loader />}
              {error && <Message variant='danger'>{error}</Message>}
              
              {!loading && (
                <Form onSubmit={submitHandler}>
                  
                  {/* PHẦN 1: THÔNG TIN CỐT LÕI HÀNG HÓA */}
                  <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">1. Thông tin chung & Nhận diện</h6>
                  <Row>
                    <Col md={7}>
                      <Form.Group className="mb-3" controlId='name'>
                        <Form.Label className="fw-bold text-secondary">Tên hàng hóa / Nhãn hiệu *</Form.Label>
                        <Form.Control type='text' required placeholder='VD: Sữa tươi Vinamilk ít đường 180ml' value={name} onChange={(e) => setName(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3" controlId='barcode'>
                        <Form.Label className="fw-bold text-secondary"><FaBarcode className="me-1" /> Mã vạch sản phẩm (Barcode)</Form.Label>
                        <Form.Control type='text' placeholder='Quét hoặc nhập mã EAN-13' value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      {/* 🌟 THAY THẾ Ô TEXT THÀNH DROPDOWN CHỌN DANH MỤC */}
                      <Form.Group className="mb-3" controlId='category'>
                        <Form.Label className="fw-bold text-secondary">Nhóm hàng / Danh mục *</Form.Label>
                        <Form.Select 
                          required
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)}
                          disabled={loadingCategories}
                        >
                          <option value="">-- Chọn nhóm hàng --</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id || cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </Form.Select>
                        {loadingCategories && <small className="text-muted">Đang tải danh mục...</small>}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId='brand'>
                        <Form.Label className="fw-bold text-secondary">Nhà sản xuất / NCC</Form.Label>
                        <Form.Control type='text' placeholder='VD: Vinamilk' value={brand} onChange={(e) => setBrand(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId='unit'>
                        <Form.Label className="fw-bold text-secondary">Đơn vị tính (ĐVT)</Form.Label>
                        <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                          <option value="Cái">Cái</option>
                          <option value="Chai">Chai</option>
                          <option value="Lon">Lon</option>
                          <option value="Gói">Gói</option>
                          <option value="Hộp">Hộp</option>
                          <option value="Thùng">Thùng</option>
                          <option value="Kg">Kilôgam (Kg)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* PHẦN 2: GIÁ CẢ VÀ TỒN KHO QUẢN LÝ TÀI CHÍNH */}
                  <h6 className="text-primary border-bottom pb-2 mb-3 mt-3 fw-bold">2. Giá cả & Quản lý kho hàng</h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId='costPrice'>
                        <Form.Label className="fw-bold text-secondary">Giá vốn nhập kho (đ)</Form.Label>
                        <Form.Control type='number' placeholder='Nhập giá mua vào' value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId='price'>
                        <Form.Label className="fw-bold text-secondary">Giá bán lẻ niêm yết (đ) *</Form.Label>
                        <Form.Control type='number' required placeholder='Nhập giá bán ra' value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId='countInStock'>
                        <Form.Label className="fw-bold text-secondary">Số lượng tồn hiện tại</Form.Label>
                        <Form.Control type='number' placeholder='Số lượng thực tế' value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId='expiryDate'>
                        <Form.Label className="fw-bold text-secondary">Hạn sử dụng (HSD)</Form.Label>
                        <Form.Control type='date' value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId='description'>
                        <Form.Label className="fw-bold text-secondary">Ghi chú bổ sung</Form.Label>
                        <Form.Control type='text' placeholder='Vị trí quầy quầy, chương trình KM...' value={description} onChange={(e) => setDescription(e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* PHẦN 3: HÌNH ẢNH */}
                  <h6 className="text-primary border-bottom pb-2 mb-3 mt-3 fw-bold">3. Hình ảnh hiển thị mặt hàng</h6>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <Form.Group className="mb-2" controlId='image'>
                        <Form.Label className="small fw-bold text-muted">Đường dẫn ảnh (Tự điền khi upload thành công)</Form.Label>
                        <Form.Control 
                          type='text' 
                          placeholder='https://res.cloudinary.com/...' 
                          value={image} 
                          onChange={(e) => setImage(e.target.value)} 
                        />
                      </Form.Group>
                      <Form.Group controlId='imageFile'>
                        <Form.Control type='file' accept="image/*" onChange={uploadFileHandler} />
                        {uploading && <Loader />}
                      </Form.Group>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="small fw-bold text-secondary mb-1">Xem trước ảnh:</div>
                      <img 
                        src={
                          !image 
                            ? 'https://placehold.co/100x100?text=No+Image'
                            : image.startsWith('http') 
                              ? image 
                              : `http://localhost:5000${image.replace(/\\/g, '/')}`
                        } 
                        alt="Preview" 
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px dashed #198754', padding: '3px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Link+Loi'; }}
                      />
                    </Col>
                  </Row>

                  {/* NÚT HOÀN TẤT */}
                  <div className="d-grid mt-4">
                    <Button type='submit' variant='primary' size="lg" className="fw-bold py-2 shadow-sm">
                      <FaSave className="me-2" /> Lưu thông tin thay đổi
                    </Button>
                  </div>

                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductEditScreen;