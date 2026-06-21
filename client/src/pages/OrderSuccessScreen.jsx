import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { clearCartItems, saveCoupon } from '../slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';


const OrderSuccessScreen = () => {
  const dispatch = useDispatch();

  // Khi vào trang này, tự động dọn sạch giỏ hàng và mã giảm giá
  useEffect(() => {
    dispatch(clearCartItems());
    dispatch(saveCoupon(null));
  }, [dispatch]);

  return (
    <Container className='mt-5'>
      <CheckoutSteps step1 step2 step3 />
      {/* --- NỘI DUNG CHÍNH --- */}
      <Row className='justify-content-center text-center'>
        <Col md={8}>
          <div className='p-5 rounded shadow-sm bg-white border'>
            <div className='mb-4'>
                {/* Icon dấu tích màu đen (Hoặc dùng text-success nếu thích màu xanh) */}
                <i className="fas fa-check-circle text-dark" style={{fontSize: '4rem'}}></i>
            </div>
            
            {/* Tiêu đề màu đen */}
            <h2 className='mb-3 fw-bold text-dark'>ĐẶT HÀNG THÀNH CÔNG</h2>
            
            <p className='lead text-muted mb-4'>
              Cám ơn khách hàng đã cho chúng tôi cơ hội được phục vụ. <br/>
              Nhân viên UTEShop sẽ liên hệ cho Quý Khách để xác nhận đơn hàng trong thời gian sớm nhất.
            </p>

            <div className='alert alert-secondary border-0' role='alert'>
                Mọi thắc mắc vui lòng liên hệ hotline: <strong>1800 8888</strong>
            </div>

            <Link to='/'>
              {/* Nút màu đen chuẩn men */}
              <Button 
                variant='dark' 
                className='mt-3 px-5 py-2 fw-bold text-uppercase'
              >
                <i className="fas fa-shopping-cart me-2"></i> Tiếp tục mua hàng
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccessScreen;