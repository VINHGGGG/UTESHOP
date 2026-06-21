import axios from 'axios'; // Nhớ import cái này để gọi API
import React, { useState } from 'react'; // Thêm useState
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card, Container } from 'react-bootstrap';
import { addToCart, removeFromCart, saveCoupon } from '../slices/cartSlice';


const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems , coupon} = cart;
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [message, setMessage] = useState(''); // Để hiện thông báo lỗi/thành công
  // Tính tổng tiền ban đầu
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  // Tính tiền được giảm
  const discountAmount = coupon ? itemsPrice * (coupon.discount / 100) : 0;

  // Tính tổng cuối cùng phải trả
  const totalPrice = itemsPrice - discountAmount;
  

  // --- HÀM XỬ LÝ CHECK COUPON ---
  const applyCouponHandler = async () => {
    try {
      const { data } = await axios.post('/api/coupons/validate', { couponCode });
      dispatch(saveCoupon({ code: data.code, discount: data.discount }));
      // Thành công -> Coupon tồn tại -> Màu xanh
      setMessage(`Áp dụng thành công! Cậu được giảm ${data.discount}% nha 🎉`);
    } catch (error) {
      dispatch(saveCoupon(null)); 
      // Lỗi -> Coupon null -> Màu đỏ
      if (error.response && error.response.status === 404) {
        setMessage('Mã này hổng đúng rồi cậu ơi 🤔');
      } else {
        setMessage('Mã này hết hạn hoặc lỗi rồi á 😭');
      }
    }
  };

  const removeCouponHandler = () => {
    dispatch(saveCoupon(null)); // Xóa khỏi Redux & LocalStorage
    setMessage(''); // Xóa thông báo cũ
    setCouponCode(''); // Xóa ô input
  };
  

  const changeQtyHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const formatCurrency = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

  return (
    <Container className='py-4'>
      <h2 className='mb-4 text-uppercase fw-bold text-secondary'>Giỏ hàng của bạn</h2>

      <Row>
        {/* --- CỘT TRÁI: DANH SÁCH SẢN PHẨM --- */}
        <Col md={8}>
          {cartItems.length === 0 ? (
            // Đổi Alert sang màu xám (secondary) cho hợp tông
            <div className='alert alert-secondary text-center'>
              Giỏ hàng đang trống trơn à. <Link to='/' className='fw-bold text-dark'>Mua sắm ngay đi!</Link>
            </div>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id} className='my-2 p-3 border rounded-3 shadow-sm bg-white'>
                  <Row className='align-items-center'>
                    {/* Hình ảnh */}
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    
                    {/* Tên sản phẩm */}
                    <Col md={4}>
                      <Link to={`/product/${item._id}`} className='text-decoration-none text-dark fw-bold'>
                        {item.name}
                      </Link>
                    </Col>

                    {/* Giá tiền */}
                    <Col md={2} className='text-end fw-bold text-secondary'>
                      {formatCurrency(item.price)}
                    </Col>

                    {/* Số lượng */}
                    <Col md={2}>
                      <Form.Select
                        value={item.qty}
                        onChange={(e) => changeQtyHandler(item, Number(e.target.value))}
                        className='form-select-sm border-secondary'
                        style={{ cursor: 'pointer' }}
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    {/* Nút xóa */}
                    <Col md={2} className='text-end'>
                      <Button
                        type='button'
                        variant='light' // Nền sáng
                        className='text-danger' // Icon màu đỏ
                        onClick={() => removeFromCartHandler(item._id)}
                      >
                        <i className='fas fa-trash'></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        {/* --- CỘT PHẢI --- */}
        <Col md={4}>
  <Card>
    <ListGroup variant='flush'>
      <ListGroup.Item>
        <h2>Tóm tắt đơn hàng</h2>
        {/* Input nhập mã giảm giá */}
        {/* --- LOGIC HIỂN THỊ MÃ GIẢM GIÁ --- */}
        <div className='mb-3'>
            {coupon ? (
                /* TRƯỜNG HỢP 1: ĐANG CÓ MÃ -> HIỆN THÔNG TIN & NÚT XÓA */
                <div className="p-2 border border-success rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                        <span className="text-success fw-bold">
                            <i className="fas fa-ticket-alt me-2"></i>
                            {coupon.code}
                        </span>
                        <span className="text-muted small ms-2">(-{coupon.discount}%)</span>
                    </div>
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={removeCouponHandler}
                        title="Gỡ bỏ mã này"
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </div>
            ) : (
                /* TRƯỜNG HỢP 2: CHƯA CÓ MÃ -> HIỆN Ô NHẬP */
                <div className="input-group">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nhập mã giảm giá..." 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                        variant="dark" 
                        onClick={applyCouponHandler}
                    >
                        Áp dụng
                    </Button>
                </div>
            )}
            
            {/* Hiển thị thông báo lỗi (chỉ hiện khi chưa có coupon hợp lệ) */}
            {!coupon && message && (
                <div className="mt-2 small text-danger fw-bold">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {message}
                </div>
            )}
            
             {/* Hiển thị thông báo thành công (chỉ hiện khi vừa add xong) */}
             {coupon && message && (
                <div className="mt-2 small text-success fw-bold">
                    <i className="fas fa-check-circle me-1"></i>
                    {message}
                </div>
            )}
        </div>

        <Row className='mb-2'>
            <Col>Tạm tính</Col>
            <Col className='text-end'>{formatCurrency(itemsPrice)}</Col>
        </Row>
        
        {/* 👇 HIỆN DÒNG GIẢM GIÁ NẾU CÓ 👇 */}
        {coupon && (
            <Row className='mb-2 text-success'>
                <Col>Giảm giá ({coupon.discount}%)</Col>
                <Col className='text-end'>- {formatCurrency(discountAmount)}</Col>
            </Row>
        )}

        <Row className='mt-3 border-top pt-3'>
            <Col><h5>Tổng cộng</h5></Col>
            {/* 👇 HIỂN THỊ GIÁ ĐÃ TRỪ 👇 */}
            <Col className='text-end text-danger'>
                <h5>{formatCurrency(totalPrice)}</h5>
            </Col>
        </Row>

      </ListGroup.Item>
      
      <ListGroup.Item>
        <Button
          type='button'
          className='btn-block w-100'
          disabled={cartItems.length === 0}
          onClick={checkoutHandler}
        >
          TIẾN HÀNH THANH TOÁN
        </Button>
      </ListGroup.Item>
    </ListGroup>
  </Card>
</Col>
      </Row>
    </Container>
  );
};

export default CartScreen;