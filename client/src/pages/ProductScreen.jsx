import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: Number(qty), image: product.image }));
    navigate('/cart');
  };

  if (!product.name) return <h2>Đang tải...</h2>;

  return (
    <>
      <div className="py-3">
        <Link className='btn btn-outline-dark my-3' to='/'><i className="fas fa-arrow-left"></i> Quay lại</Link>
      </div>

      <Row>
        {/* Cột Trái: Ảnh sản phẩm */}
        <Col md={5} className="text-center">
          <Image src={product.image} 
                alt={product.name} fluid />
        </Col>

        {/* Cột Phải: Giá & Khuyến mãi & Nút mua */}
        <Col md={7}>
          <h3 className="text-uppercase">{product.name}</h3>
          
          <h2 className="text-danger my-3" style={{ fontWeight: 'bold' }}>
             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </h2>

          {/* Khung Khuyến Mãi (Mockup giống ảnh) */}
          <div className="border p-3 rounded mb-3 bg-light">
             <h5 className="fw-bold">Nhận ngay khuyến mãi đặc biệt</h5>
             <ul className="list-unstyled mt-2">
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i> Bảo hành 2 năm chính hãng</li>
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i> Tặng phiếu mua hàng 200.000đ</li>
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i> Giảm thêm 5% khi thanh toán qua VNPay</li>
                <li><i className="fas fa-check-circle text-success me-2"></i> Thu cũ đổi mới trợ giá 1 triệu</li>
             </ul>
          </div>

          <Row className="align-items-center mb-4">
             <Col xs={4} md={3}>
                <strong>Số lượng:</strong>
             </Col>
             <Col xs={4} md={3}>
                <Form.Control as='select' value={qty} onChange={(e) => setQty(e.target.value)}>
                    {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                </Form.Control>
             </Col>
          </Row>

          <Button 
            onClick={addToCartHandler}
            className='btn-danger btn-lg w-100' 
            type='button' 
            disabled={product.countInStock === 0}
            style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
          >
            <i className="fas fa-shopping-cart me-2"></i> Thêm vào giỏ hàng
          </Button>
        </Col>
      </Row>

      {/* Phần Đánh giá chi tiết & Thông số kỹ thuật */}
      <Row className="mt-5">
        {/* Bên trái: Mô tả chi tiết (Text) */}
        <Col md={8}>
            <h4 className="mb-3">Đánh giá chi tiết: {product.name}</h4>
            <p style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                {product.description}
                <br/><br/>
                {/* Đoạn này tạm thời hardcode mẫu văn bản dài giống ảnh */}
                Sản phẩm này sở hữu thiết kế đẳng cấp với khung viền thép không gỉ, mặt lưng kính cường lực. 
                Hiệu năng mạnh mẽ nhờ con chip mới nhất, cân mọi tác vụ từ chơi game nặng đến chỉnh sửa video 4K.
                Hệ thống camera được nâng cấp vượt trội, chụp đêm siêu nét.
            </p>
        </Col>

        {/* Bên phải: Bảng thông số kỹ thuật */}
      </Row>
      <Row className="my-4">
  <Col md={8}>
    <h3>Thông số kỹ thuật</h3>
    {product.specs ? (
      <Table striped bordered hover responsive size="sm">
        <tbody>
          <tr>
            <td style={{ width: '30%', fontWeight: 'bold' }}>Màn hình</td>
            <td>{product.specs.screen}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Chip xử lý</td>
            <td>{product.specs.chip}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>RAM</td>
            <td>{product.specs.ram}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Bộ nhớ trong</td>
            <td>{product.specs.storage}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Camera</td>
            <td>{product.specs.camera}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Pin, Sạc</td>
            <td>{product.specs.battery}</td>
          </tr>
           <tr>
            <td style={{ fontWeight: 'bold' }}>Hệ điều hành</td>
            <td>{product.specs.os}</td>
          </tr>
        </tbody>
      </Table>
    ) : (
      <p>Chưa có thông tin cấu hình.</p>
    )}
  </Col>
</Row>
    </>
  );
};

export default ProductScreen;