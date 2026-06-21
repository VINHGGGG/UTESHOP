import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';

const Product = ({ product }) => {
  const formatCurrency = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <Card className='my-3 p-3 rounded border-0 shadow-sm h-100 text-center product-card'>
      <Link to={`/product/${product._id}`} className='overflow-hidden d-block'>
        <Card.Img 
          src={product.image} 
          variant='top' 
          alt={product.name}
          style={{ height: '200px', objectFit: 'contain', transition: 'transform 0.3s' }}
          className="hover-zoom" // Cậu có thể thêm CSS hover zoom nếu thích
        />
      </Link>

      <Card.Body className='d-flex flex-column justify-content-end'>
        {/* Tên sản phẩm - Màu đen */}
        <Link to={`/product/${product._id}`} className='text-decoration-none'>
          <Card.Title as='div' className='product-title text-dark fw-bold mb-2' style={{ fontSize: '0.95rem' }}>
            {product.name}
          </Card.Title>
        </Link>

        {/* Giá tiền - Màu xanh đậm (hoặc đổi thành text-danger nếu muốn giá màu đỏ) */}
        <Card.Text as='h5' className='fw-bold text-primary mt-auto'>
          {formatCurrency(product.price)}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;