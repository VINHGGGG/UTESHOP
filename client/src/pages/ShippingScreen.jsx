import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, ListGroup, Image, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress, savePaymentMethod, clearCartItems } from '../slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder, orderCreateReset } from '../slices/orderSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ShippingScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems, coupon } = cart;
  
  // 👇 Đảm bảo gọi đúng state user (kiểm tra store.js của cậu xem là 'user' hay 'auth')
  const userLogin = useSelector((state) => state.user); 
  const { userInfo } = userLogin;

  const orderCreate = useSelector((state) => state.order);
  const { loading, success, error, order } = orderCreate;

  // --- 1. KHỞI TẠO STATE ---
  // Logic: Ưu tiên lấy từ shippingAddress (nếu đã nhập), nếu không thì lấy từ userInfo, cuối cùng là rỗng
  const [name, setName] = useState(shippingAddress.name || userInfo?.name || '');
  const [email, setEmail] = useState(shippingAddress.email || userInfo?.email || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [phone, setPhone] = useState(shippingAddress.phone || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '700000');
  const [country, setCountry] = useState(shippingAddress.country || 'Việt Nam');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // --- 2. EFFECT: Tự động điền Tên/Email khi userInfo load xong ---
  useEffect(() => {
    if (userInfo) {
      if (!name) setName(userInfo.name);
      if (!email) setEmail(userInfo.email);
    }
  }, [userInfo]); // Chạy lại khi userInfo thay đổi

  useEffect(() => {
    if (success) {
      dispatch(orderCreateReset());
      dispatch(clearCartItems());
      navigate('/profile'); 
    }
  }, [navigate, success, dispatch, order]);

  // --- TÍNH TOÁN TIỀN ---
  const addDecimals = (num) => (Math.round(num * 100) / 100);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 10000000 ? 0 : 30000;
  const discountAmount = coupon ? itemsPrice * (coupon.discount / 100) : 0;
  const totalPrice = itemsPrice + shippingPrice - discountAmount;
  const taxPrice = 0; 

  const formatCurrency = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // 1. Lưu vào Redux Cart (QUAN TRỌNG: Thêm name và email vào đây)
    dispatch(saveShippingAddress({ 
        name, email, address, city, phone, postalCode, country 
    }));
    dispatch(savePaymentMethod(paymentMethod));

    // 2. Tạo đơn hàng
    dispatch(
      createOrder({
        orderItems: cartItems.map((item) => ({
            product: item.product || item._id, // Đảm bảo cartSlice đã sửa thành .product
            name: item.name,
            image: item.image,
            price: item.price,
            qty: item.qty,
        })),
        shippingAddress: {
            name,   // 👈 Gửi tên người nhận lên server
            email,  // 👈 Gửi email người nhận
            address,
            city,
            phone,
            postalCode,
            country,
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    );
  };

  return (
    <Container className='py-3'>
      <CheckoutSteps step1 step2 />

      <Row>
        <Col md={8}>
            <h4 className='mb-3'>Chọn phương thức thanh toán</h4>
            <Card className='mb-4 border-0 shadow-sm'>
                <Card.Body>
                    <Form.Check 
                        type='radio'
                        label='Trả tiền mặt khi nhận hàng (COD)'
                        id='COD'
                        name='paymentMethod'
                        value='COD'
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className='mb-2 fw-bold'
                    />
                </Card.Body>
            </Card>

            <h4 className='mb-3'>Thông tin giao hàng</h4>
            <Card className='border-0 shadow-sm'>
                <Card.Body>
                    <Form onSubmit={submitHandler} id="shipping-form">
                        
                        {/* 👇 ĐÃ SỬA: Cho phép nhập/sửa tên */}
                        <Form.Group controlId='name' className='mb-3'>
                            <Form.Label>Họ và tên người nhận</Form.Label>
                            <Form.Control 
                                type='text' 
                                placeholder='Nhập họ tên'
                                value={name} 
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                         {/* 👇 ĐÃ SỬA: Cho phép nhập/sửa email */}
                        <Form.Group controlId='email' className='mb-3'>
                            <Form.Label>Địa chỉ Email</Form.Label>
                            <Form.Control 
                                type='email' 
                                placeholder='Nhập email'
                                value={email} 
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId='address' className='mb-3'>
                            <Form.Label>Địa chỉ nhận hàng</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Số nhà, tên đường...'
                                value={address}
                                required
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId='city' className='mb-3'>
                                    <Form.Label>Tỉnh / Thành phố</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='VD: TP.HCM'
                                        value={city}
                                        required
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId='phone' className='mb-3'>
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Số điện thoại'
                                        value={phone}
                                        required
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Col>

        {/* --- CỘT PHẢI: SUMMARY (Giữ nguyên logic của cậu) --- */}
        <Col md={4}>
          <Card className='border-0 shadow-sm mt-3 mt-md-0'>
            <Card.Header className='bg-white border-bottom-0 pt-3'>
                <h5 className='fw-bold'>Đơn hàng của bạn</h5>
            </Card.Header>
            <Card.Body>
                <ListGroup variant='flush'>
                    {cartItems.map((item, index) => (
                        <ListGroup.Item key={index} className='px-0'>
                            <Row>
                                <Col xs={3}>
                                    <Image 
                                      src={item.image} 
                                      alt={item.name} 
                                      fluid 
                                      rounded 
                                    />
                                </Col>
                                <Col>
                                    <div className='text-truncate' style={{maxWidth: '150px'}}>{item.name}</div>
                                    <small className='text-muted'>x{item.qty}</small>
                                </Col>
                                <Col className='text-end fw-bold text-muted'>
                                    {formatCurrency(item.price * item.qty)}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}

                    <ListGroup.Item className='px-0 d-flex justify-content-between mt-3'>
                        <span>Tạm tính:</span>
                        <span className='fw-bold'>{formatCurrency(itemsPrice)}</span>
                    </ListGroup.Item>
                    
                    <ListGroup.Item className='px-0 d-flex justify-content-between'>
                        <span>Phí vận chuyển:</span>
                        <span className='fw-bold'>{shippingPrice === 0 ? 'Miễn phí' : formatCurrency(shippingPrice)}</span>
                    </ListGroup.Item>

                    {coupon && (
                        <ListGroup.Item className='px-0 d-flex justify-content-between text-success'>
                            <span>Mã giảm ({coupon.code}):</span>
                            <span className='fw-bold'>- {formatCurrency(discountAmount)}</span>
                        </ListGroup.Item>
                    )}

                    <ListGroup.Item className='px-0 d-flex justify-content-between border-top mt-2 pt-3'>
                        <span className='fs-5 fw-bold'>Tổng cộng:</span>
                        <span className='fs-5 fw-bold text-danger'>{formatCurrency(totalPrice)}</span>
                    </ListGroup.Item>
                </ListGroup>

                {error && <Message variant='danger' className='mt-3'>{error}</Message>}
                {loading && <Loader />}
                
                <Button 
                    type='submit'             
                    form='shipping-form'      
                    variant='dark' 
                    className='w-100 mt-3 py-2 fw-bold text-uppercase'
                    disabled={cartItems.length === 0 || loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShippingScreen;