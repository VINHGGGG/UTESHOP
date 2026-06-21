import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, Modal, Card } from 'react-bootstrap';
import { FaTicketAlt, FaPlus, FaTrashAlt, FaCalendarAlt, FaPercentage, FaCheckCircle, FaTimesCircle, FaUserTag, FaReceipt, FaHistory, FaShoppingBasket, FaMoneyBillWave } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { listProducts } from '../slices/productSlice';
import '../POSHomeScreen.css'; 
import { addToCart, removeFromCart, clearCartItems } from '../slices/cartSlice';
import { createOrder } from '../slices/orderSlice';
import { listCoupons } from '../slices/couponSlice';
import { getCurrentShift } from '../slices/shiftSlice';
import OpenShiftModal from '../components/OpenShiftModal';
import CloseShiftModal from '../components/CloseShiftModal';
import { searchCustomerByPhone, createCustomer, clearCustomer } from '../slices/customerSlice';
import { listCategories } from '../slices/categorySlice';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [amountGiven, setAmountGiven] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const { keyword } = useParams();
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  
  // --- STATE QUẢN LÝ THÀNH VIÊN VÀ ĐƠN HÀNG ---
  const [phoneInput, setPhoneInput] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isUsePoints, setIsUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [isShipping, setIsShipping] = useState(false); 
  const [couponInput, setCouponInput] = useState(''); 
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [isFreeShip, setIsFreeShip] = useState(false);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
  const [shippingAddressInput, setShippingAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('Hồ Chí Minh');
  const [shippingPrice, setShippingPrice] = useState(0);
  const [postalCodeInput, setPostalCodeInput] = useState('00000'); 

  const shiftWatch = useSelector((state) => state.shiftWatch || {});
  const { currentShift, loading: shiftLoading } = shiftWatch;
  const productList = useSelector((state) => state.product);
  const { loading, error, products } = productList;
  const categoryStore = useSelector((state) => state.category || state.categoryList || state.categories || {});
  const categories = Array.isArray(categoryStore) ? categoryStore : (categoryStore.categories || []);
  const couponList = useSelector((state) => state.coupon || {});
  const { coupons = [] } = couponList;

  const cart = useSelector((state) => state.cart);
  const cartItems = cart?.cartItems || [];

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;
  const customerState = useSelector((state) => state.customer);
  const { customerInfo, error: customerError } = customerState;

  const addToCartHandler = (product) => {
    const existItem = cartItems.find((x) => x && x._id === product._id);
    const qty = existItem ? existItem.qty + 1 : 1;
    dispatch(addToCart({ ...product, qty })); 
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const updateQtyHandler = (item, newQty) => {
    const qty = Number(newQty);
    if (qty > 0 && qty <= item.countInStock) {
        dispatch(addToCart({ ...item, qty }));
    }
  };

  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, không thể lưu tạm đơn hàng!');
      return;
    }

    const newHeldOrder = {
      id: 'LT_' + Date.now().toString().slice(-6), 
      holdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      items: [...cartItems],
      customerInfo: customerInfo ? { ...customerInfo } : null,
      phoneInput: phoneInput,
      isUsePoints: isUsePoints,
      total: cartTotal
    };

    setHeldOrders([...heldOrders, newHeldOrder]);
    dispatch(clearCartItems());
    dispatch(clearCustomer());
    setPhoneInput('');
    setIsUsePoints(false);
    alert(`📥 Đã lưu tạm đơn ${newHeldOrder.id} thành công!`);
  };

  const handleRecallOrder = (order) => {
    if (cartItems.length > 0) {
      const confirmOverwrite = window.confirm(
        '⚠️ Giỏ hàng hiện tại đang có hàng hóa. Khôi phục đơn lưu tạm sẽ ghi đè dữ liệu, cậu có chắc không?'
      );
      if (!confirmOverwrite) return;
    }

    dispatch(clearCartItems());
    order.items.forEach(item => {
      dispatch(addToCart({ ...item, qty: item.qty }));
    });

    if (order.customerInfo) {
      setPhoneInput(order.phoneInput);
      dispatch(searchCustomerByPhone(order.phoneInput));
      setIsUsePoints(order.isUsePoints);
    } else {
      dispatch(clearCustomer());
      setPhoneInput('');
      setIsUsePoints(false);
    }

    setHeldOrders(heldOrders.filter(o => o.id !== order.id));
    setShowHeldOrdersModal(false);
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Cậu có chắc chắn muốn HỦY toàn bộ hóa đơn này không?')) {
        dispatch(clearCartItems());
        dispatch(clearCustomer());
        setPhoneInput('');
        setIsUsePoints(false);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const pointsDiscount = isUsePoints && customerInfo && customerInfo.points >= 100 
    ? Math.min(customerInfo.points * 200, cartTotal) 
    : 0;

  const couponDiscount = appliedCoupon 
    ? Math.floor(((cartTotal - pointsDiscount) * appliedCoupon.discount) / 100)
    : 0;

  const finalShippingPrice = isShipping ? (isFreeShip ? 0 : Number(shippingPrice || 0)) : 0;
  const finalTotal = cartTotal - pointsDiscount - couponDiscount + finalShippingPrice;
  const pointsEarned = Math.floor(finalTotal / 10000);
  
  const changeAmount = paymentMethod === 'cash' 
    ? (Number(amountGiven) || 0) - finalTotal
    : 0;

  const handleSearchCustomer = (e) => {
    const value = e.target.value;
    setPhoneInput(value);
    if (value.length >= 10) {
      dispatch(searchCustomerByPhone(value));
    } else if (value.length === 0) {
      dispatch(clearCustomer());
      setIsUsePoints(false);
    }
  };

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerName || !phoneInput) return;

    const resultAction = await dispatch(createCustomer({ 
      name: newCustomerName, 
      phone: phoneInput 
    }));

    if (createCustomer.fulfilled.match(resultAction)) {
      setShowAddCustomerModal(false);
      setNewCustomerName('');
      alert('🎉 Đăng ký thành viên mới thành công!');
    } else {
      const errorMsg = resultAction.payload || 'Có lỗi xảy ra!';
      alert('❌ Lỗi đăng ký: ' + errorMsg);
    }
  };

  const handleOpenCheckoutModal = () => {
    if (cartItems.length === 0) {
        alert('Giỏ hàng trống, chưa thể thực hiện thanh toán!');
        return;
    }
    setPaymentMethod('cash'); 
    setShowModal(true);
    setAmountGiven(finalTotal); 
  };

  const handleApplyCoupon = () => {
    if (!couponInput) {
      alert('Vui lòng nhập mã giảm giá!');
      return;
    }
    const found = coupons.find(c => c.name === couponInput.trim().toUpperCase());
    if (!found) {
      alert('❌ Mã giảm giá không tồn tại!');
      setAppliedCoupon(null);
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(found.expiry).setHours(0,0,0,0) < today) {
      alert('❌ Mã ưu đãi này đã hết hạn sử dụng!');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    alert(`🎉 Áp mã thành công: Giảm ${found.discount}%!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handleConfirmCheckout = async () => {
    if (paymentMethod === 'cash') {
        if (changeAmount < 0 || !amountGiven) {
            alert('❌ Tiền khách đưa chưa đủ!');
            return { success: false };
        }
    }

    const vnPaymentMethod = paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'banking' ? 'Chuyển khoản' : 'Quẹt thẻ';
    const finalGiven = paymentMethod === 'cash' ? Number(amountGiven) : finalTotal;
    const finalChange = paymentMethod === 'cash' ? changeAmount : 0;
    const orderType = isShipping ? 'Online' : 'POS'; 
    
    const shippingDetails = isShipping ? {
        address: shippingAddressInput || 'Địa chỉ giao hàng',
        city: cityInput || 'Hồ Chí Minh',
        postalCode: postalCodeInput || '70000',
        country: 'VN',
        phone: customerInfo ? customerInfo.phone : phoneInput || '0000000000',
    } : {
        address: 'Mua trực tiếp tại quầy POS',
        city: 'POS',
        postalCode: '00000',
        country: 'VN',
        phone: customerInfo ? customerInfo.phone : '0000000000',
    };

    const finalShippingPrice = isShipping ? Number(shippingPrice) : 0;

    const orderData = {
        orderType: orderType, 
        orderItems: cartItems.map(item => ({
            product: item._id,
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            barcode: item.barcode || '', 
            unit: item.unit || 'Cái'     
        })),
        shippingAddress: shippingDetails,
        paymentMethod: vnPaymentMethod,
        itemsPrice: cartTotal,
        taxPrice: 0,
        couponDiscount: couponDiscount,
        couponName: appliedCoupon ? appliedCoupon.name : undefined,
        shippingPrice: finalShippingPrice,
        totalPrice: finalTotal + finalShippingPrice, 
        customerId: customerInfo ? customerInfo._id : undefined,
        isUsePoints: isUsePoints,
    };

    try {
        const createdOrder = await dispatch(createOrder(orderData)).unwrap();

        setReceiptData({
            orderType: orderType,
            items: [...cartItems],
            total: cartTotal,
            discount: pointsDiscount,
            couponDiscount: couponDiscount,
            couponName: appliedCoupon ? appliedCoupon.name : '',
            shippingPrice: finalShippingPrice,
            finalTotal: orderData.totalPrice,
            paymentMethod: vnPaymentMethod,
            given: finalGiven,
            change: finalChange,
            date: new Date().toLocaleString('vi-VN'),
            orderId: createdOrder._id,
            customerName: customerInfo ? customerInfo.name : isShipping ? 'Khách giao tận nơi' : 'Khách vãng lai',
            customerPoints: customerInfo ? customerInfo.points : 0,
            pointsEarned: customerInfo ? pointsEarned : 0,
            shippingAddress: orderData.shippingAddress.address 
        });

        alert(`🎉 Tạo hóa đơn thành công!`);
        
        setTimeout(async () => {
            try {
                const now = new Date();
                const year = now.getFullYear().toString().slice(-2);
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                
                const shortOrderId = createdOrder?._id ? createdOrder._id.slice(-6).toUpperCase() : 'OD';
                const prefix = orderType === 'Online' ? 'SHIP' : 'HD';
                const invoiceName = `${prefix}_${year}${month}${day}_${hours}${minutes}_${shortOrderId}`;

                const result = await window.electronAPI.autoExportPDF(invoiceName, cartItems.length);

                if (result.success) {
                    console.log(`Hóa đơn lưu tự động tại: ${result.filePath}`);
                } else {
                    alert(`❌ Lỗi xuất PDF: ${result.error}`);
                }
            } catch (pdfError) {
                console.error("Lỗi xuất PDF hóa đơn:", pdfError);
            } finally {
                dispatch(getCurrentShift());
                dispatch(clearCartItems());
                dispatch(clearCustomer());
                dispatch(listProducts()); 
                setShowModal(false);
                setAmountGiven('');
                setPhoneInput('');
                setIsUsePoints(false);
                if(typeof setShippingPrice === 'function') setShippingPrice(0); 
            }
        }, 300);
        
    } catch (error) {
        alert('❌ Lỗi tạo đơn hàng: ' + (error?.message || error || 'Vui lòng thử lại'));
    }
  };

  useEffect(() => {
    dispatch(listProducts(keyword));
    if (userInfo) {
      dispatch(listCoupons());
      dispatch(listCategories()); 

      if (!userInfo.isAdmin) {
        dispatch(getCurrentShift());
      }
    }
  }, [dispatch, keyword, userInfo]);

  return (
    <div className="container-fluid h-100 p-0" style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
      <Row className="g-0 h-100">
        
        {/* ========================================================
            CỘT TRÁI: HIỂN THỊ DANH SÁCH HÀNG HÓA
            ======================================================== */}
        <Col md={7} lg={8} className="d-flex flex-column h-100 p-3 border-end" style={{ overflow: 'hidden' }}>
          
          {currentShift && userInfo && !userInfo.isAdmin && (
            <div className="bg-light w-100 p-1 mb-3 border rounded d-flex justify-content-between align-items-center shadow-sm" style={{ fontSize: '0.85rem' }}>
              <div>
                <FaCalendarAlt className="text-success me-2 animate-pulse" />
                <span className="text-success fw-bold">● Ca đang chạy</span> | Thu ngân: <span className="text-primary fw-bold">{userInfo.name}</span> | Mở: {new Date(currentShift.openedAt).toLocaleTimeString('vi-VN')}
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-success fw-bold">
                  Két lý thuyết: {currentShift.expectedAmount?.toLocaleString('vi-VN')} đ
                </div>
                <Button variant="danger" size="sm" className="fw-bold px-2 py-0.5" style={{ fontSize: '0.75rem' }} onClick={() => setShowCloseShiftModal(true)}>
                  🔒 Chốt Ca
                </Button>
              </div>
            </div>
          )}

          <div className="mb-2 d-flex gap-2 pb-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Button 
              variant={!keyword ? "primary" : "outline-secondary"} 
              size="sm" 
              className="rounded-pill px-3"
              onClick={() => navigate('/')}
            >
              Tất cả nhóm
            </Button>
            {categories && categories.map((cat) => (
              <Button 
                key={cat._id} 
                variant={keyword === cat.name ? "primary" : "outline-secondary"} 
                size="sm" 
                className="rounded-pill px-3"
                onClick={() => navigate(`/search/${cat.name}`)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2 flex-shrink-0">
            <h6 className="fw-bold text-dark m-0 text-uppercase tracking-wider" style={{ fontSize: '0.8rem' }}>
              {keyword ? `Mặt hàng thuộc: "${keyword}"` : "Mặt hàng đang kinh doanh"}
            </h6>
            {keyword && (
              <Button variant="link" size="sm" className="p-0 text-decoration-none small" onClick={() => navigate('/')}>
                🔄 Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="d-flex flex-column flex-grow-1 border rounded bg-white shadow-sm overflow-hidden">
            <div className="d-flex bg-dark text-white p-2 fw-bold text-center small align-items-center" 
                 style={{ position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
              <div style={{ width: '60px' }}>Hình</div>
              <div className="text-start ps-2" style={{ flex: 1 }}>Tên sản phẩm / Tồn kho</div>
              <div style={{ width: '150px', textAlign: 'right', paddingRight: '15px' }}>Giá bán / Thêm</div>
            </div>

            <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 190px)' }}>
              {loading ? (
                <h6 className='text-center py-5 text-muted'>Đang tải dữ liệu hàng hóa...</h6>
              ) : error ? (
                <div className="alert alert-danger m-2">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h6>Không tìm thấy mặt hàng phù hợp! 😓</h6>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="d-flex align-items-center p-2 border-bottom hover-product-row" style={{ transition: 'background 0.2s' }}>
                    <div style={{ width: '50px', height: '50px', flexShrink: 0, overflow: 'hidden', borderRadius: '4px', background: '#f5f5f5' }}>
                      <img 
                        src={
                          !product.image 
                            ? 'https://placehold.co/50x50/e0e0e0/666666?text=SP'
                            : product.image.startsWith('http') 
                              ? product.image 
                              : `http://localhost:5000${product.image.replace(/\\/g, '/')}`
                        } 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://placehold.co/50x50/e0e0e0/666666?text=SP';
                        }}
                      />
                    </div>

                    <div className="ps-3 text-start" style={{ flex: 1, minWidth: 0 }}>
                      <h6 className="m-0 text-truncate fw-bold" style={{ fontSize: '0.9rem', color: '#212529' }}>{product.name}</h6>
                      <small className="text-muted">Đơn vị: <span className="text-dark fw-semibold">{product.unit || 'Cái'}</span> | Tồn: <span className={product.countInStock > 10 ? "text-success fw-bold" : "text-danger fw-bold"}>{product.countInStock}</span></small>
                    </div>

                    <div className="d-flex align-items-center justify-content-end" style={{ width: '150px' }}>
                      <span className="fw-bold text-primary me-2" style={{ fontSize: '0.95rem' }}>
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '28px', height: '28px' }}
                        onClick={() => addToCartHandler(product)}
                      >
                        <FaPlus size={11} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        {/* ========================================================
            CỘT PHẢI: CHI TIẾT HÓA ĐƠN VÀ ĐÁY GHIM CỐ ĐỊNH CHỐNG TRÀN
            ======================================================== */}
        <Col md={4} lg={4} className="d-flex flex-column h-100 bg-white p-3 shadow-lg" style={{ overflow: 'hidden' }}>
          
          {/* Header hóa đơn */}
          <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom flex-shrink-0">
            <h6 className="m-0 fw-bold text-dark text-uppercase tracking-wide">
              <FaReceipt className="me-2 text-warning" /> Hóa đơn thanh toán
            </h6>
            <Button 
              variant={heldOrders.length > 0 ? "warning" : "outline-secondary"} 
              size="sm" 
              className="fw-bold px-2 py-0.5 d-flex align-items-center gap-1" 
              style={{ fontSize: '0.75rem' }}
              onClick={() => setShowHeldOrdersModal(true)}
            >
              <FaHistory /> Đơn chờ ({heldOrders.length})
            </Button>
          </div>

          {/* 🌟 VÙNG CUỘN 1: TỰ ĐỘNG THU CO KHI CÓ THÔNG TIN THÀNH VIÊN HIỆN LÊN */}
          <div className="flex-grow-1 d-flex flex-column mb-2" style={{ overflowY: 'auto', minHeight: 0 }}>
              
              {/* Giỏ hàng sản phẩm (Có thanh cuộn riêng nếu quá dài) */}
              <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: '60px' }}>
                  {cartItems.length === 0 ? (
                      <div className="text-center text-muted py-5 my-auto">
                          <FaShoppingBasket size={40} className="mb-2 text-black-50" style={{ opacity: 0.15 }} />
                          <p className="small m-0">Giỏ hàng trống</p>
                      </div>
                  ) : (
                      cartItems.map((item) => (
                          <div key={item._id} className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded bg-light" style={{ gap: '8px' }}>
                              <div style={{ flex: '1', minWidth: 0, textAlign: 'left' }}>
                                  <span className="fw-bold d-block text-truncate text-dark" style={{ fontSize: '0.8rem' }}>{item.name}</span>
                                  <small className="text-primary fw-semibold">{item.price.toLocaleString('vi-VN')}đ</small>
                              </div>
                              
                              <div style={{ width: '60px', flexShrink: 0 }}>
                                  <input 
                                      type="number" 
                                      min="1" 
                                      max={item.countInStock}
                                      value={item.qty} 
                                      onChange={(e) => updateQtyHandler(item, e.target.value)}
                                      className="form-control form-control-sm text-center p-0 fw-bold shadow-none" 
                                      style={{ height: '26px', fontSize: '0.8rem' }}
                                  />
                              </div>
                              
                              <div style={{ flexShrink: 0 }}>
                                  <Button 
                                      variant="link" 
                                      size="sm"
                                      className="text-danger p-0"
                                      onClick={() => removeFromCartHandler(item._id)}
                                  >
                                      <FaTrashAlt size={13} />
                                  </Button>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              {/* ⭐ XỔ THÔNG TIN THÀNH VIÊN LÊN TRÊN: Nằm ngay trên khối nhập SĐT và lấn vào không gian của giỏ hàng */}
              {customerInfo && (
                <div className="p-2 border rounded bg-white text-start shadow-sm flex-shrink-0 animate-fade-in mt-2" style={{ borderLeft: '4px solid #198754', background: '#fcfdfd' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: '0.8rem' }}>Khách hàng: <strong className="text-dark">{customerInfo.name}</strong></span>
                    <span className="badge bg-success" style={{ fontSize: '0.65rem', padding: '3px 6px' }}>{customerInfo.rank || 'Bạch Kim'}</span>
                  </div>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem' }}>
                    <span className="text-muted">Điểm tích lũy: <strong className="text-success">{customerInfo.points}đ</strong></span>
                    <span className="text-muted">Đơn này: <strong className="text-primary">+{pointsEarned}</strong></span>
                  </div>
                  
                  {customerInfo.points > 0 && (
                    <Form.Check 
                      type="checkbox"
                      id="use-points-checkbox"
                      disabled={customerInfo.points < 100}
                      label={`Dùng điểm giảm ${(customerInfo.points * 200).toLocaleString('vi-VN')} đ`}
                      checked={isUsePoints}
                      onChange={(e) => setIsUsePoints(e.target.checked)}
                      className="mt-1 text-danger fw-bold small shadow-none"
                      style={{ fontSize: '0.75rem' }}
                    />
                  )}
                </div>
              )}
          </div>

          {/* 🌟 VÙNG KHỐI 2: ĐÁY CỐ ĐỊNH CHẶT (ÉP CỨNG FLEX-SHRINK-0), KHÔNG BAO GIỜ BỊ TRÀN HAY MẤT NÚT */}
          <div className="pt-2 bg-white border-top flex-shrink-0" style={{ overflowY: 'auto'}}>
              
              {/* Ô nhập Số điện thoại tìm kiếm luôn ghim ở đây */}
              <div className="mb-2">
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Nhập số điện thoại khách..."
                    value={phoneInput}
                    onChange={handleSearchCustomer}
                    className="fw-bold text-center border-secondary"
                    style={{ height: '34px', fontSize: '0.85rem' }}
                  />
                  {customerError && phoneInput.length >= 10 && (
                    <Button variant="danger" size="sm" className="text-nowrap fw-bold" style={{ fontSize: '0.8rem' }} onClick={() => setShowAddCustomerModal(true)}>
                      + Đăng ký
                    </Button>
                  )}
                </div>
              </div>

              {/* Khung hiển thị tổng tiền */}
              <div className="p-2 bg-light border rounded mb-2">
                  {pointsDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-1 small text-muted text-start" style={{ fontSize: '0.75rem' }}>
                      <span>Giảm giá thành viên:</span>
                      <span className="text-success fw-bold">-{pointsDiscount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary fw-bold" style={{ fontSize: '0.8rem' }}>Tổng tiền thanh toán:</span>
                      <span className="text-danger fs-4 fw-bold">
                          {finalTotal.toLocaleString('vi-VN')} đ
                      </span>
                  </div>
              </div>

              {/* Nút lớn THANH TOÁN */}
              <Button 
                  variant="success" 
                  size="md" 
                  className="w-100 fw-bold mb-2 shadow-sm py-2 d-flex align-items-center justify-content-center gap-2 text-uppercase" 
                  style={{ fontSize: '0.95rem' }}
                  onClick={handleOpenCheckoutModal}
              >
                  <FaMoneyBillWave /> THANH TOÁN (F9)
              </Button>
              
              {/* 2 Nút Lưu đơn tạm và Hủy đơn: Ghim cứng ở hàng cuối cùng, chắc chắn xuất hiện */}
              <div className="d-flex gap-2">
                  <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="flex-grow-1 fw-bold position-relative py-1.5"
                      style={{ fontSize: '0.8rem' }}
                      onClick={handleHoldOrder}
                  >
                      Lưu đơn tạm
                      {heldOrders.length > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                              {heldOrders.length}
                          </span>
                      )}
                  </Button>
                  <Button 
                      variant="outline-danger" 
                      size="sm"
                      className="flex-grow-1 fw-bold py-1.5"
                      style={{ fontSize: '0.8rem' }}
                      onClick={handleClearCart}
                  >
                      Hủy hóa đơn
                  </Button>
              </div>
          </div>
        </Col>
      </Row>

      {/* ================= MODAL ĐĂNG KÝ THÀNH VIÊN ================= */}
      <Modal show={showAddCustomerModal} onHide={() => setShowAddCustomerModal(false)} centered size="sm">
        <Form onSubmit={handleRegisterCustomer}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-6 fw-bold text-primary">Đăng ký thành viên</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            <Form.Group className="mb-2">
              <Form.Label className="small text-muted">Số điện thoại:</Form.Label>
              <Form.Control type="text" value={phoneInput} disabled className="text-center fw-bold bg-light" />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small">Tên khách hàng:</Form.Label>
              <Form.Control type="text" required autoFocus placeholder="Nhập tên..." value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="p-2">
            <Button variant="secondary" size="sm" onClick={() => setShowAddCustomerModal(false)}>Hủy</Button>
            <Button variant="primary" size="sm" type="submit">Kích hoạt</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL XÁC NHẬN THANH TOÁN ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary fw-bold fs-5">Xác nhận thanh toán</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          <div className="d-flex justify-content-between mb-3 fs-5 border-bottom pb-2">
            <span>Tổng cộng phải trả:</span>
            <span className="fw-bold text-danger">{finalTotal.toLocaleString('vi-VN')} đ</span>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Hình thức lên đơn:</Form.Label>
            <div className="d-flex gap-2">
              <Button 
                variant={!isShipping ? 'primary' : 'outline-primary'} 
                className="flex-fill fw-bold py-1.5 small"
                onClick={() => {
                  setIsShipping(false);
                  setShippingPrice(0);
                }}
              >
                🛒 Mua tại quầy
              </Button>
              <Button 
                variant={isShipping ? 'warning' : 'outline-warning'} 
                className="flex-fill fw-bold py-1.5 small"
                onClick={() => setIsShipping(true)}
              >
                🚚 Đặt giao hàng (Ship)
              </Button>
            </div>
          </Form.Group>

          {isShipping && (
            <Card className="mb-3 border-warning bg-warning bg-opacity-10 shadow-sm">
              <Card.Body className="p-2.5">
                <h6 className="text-dark fw-bold mb-2 small">📌 Thông tin người nhận</h6>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0 text-muted">Địa chỉ giao hàng *</Form.Label>
                  <Form.Control 
                    type="text" 
                    size="sm"
                    placeholder="Số nhà, tên đường..." 
                    value={shippingAddressInput}
                    required={isShipping}
                    onChange={(e) => setShippingAddressInput(e.target.value)}
                  />
                </Form.Group>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small mb-0 text-muted">Tỉnh / Thành phố</Form.Label>
                      <Form.Control 
                        type="text" 
                        size="sm"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small mb-0 text-muted">Phí ship (đ)</Form.Label>
                      <Form.Control 
                        type="number" 
                        size="sm"
                        placeholder="30000" 
                        disabled={isFreeShip} 
                        value={isFreeShip ? 0 : (shippingPrice === 0 ? '' : shippingPrice)}
                        onChange={(e) => setShippingPrice(Number(e.target.value))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Check 
                  type="checkbox"
                  id="free-ship-checkbox"
                  label="Miễn phí ship (FreeShip)"
                  checked={isFreeShip}
                  onChange={(e) => setIsFreeShip(e.target.checked)}
                  className="mt-2 text-primary fw-bold small"
                />
              </Card.Body>
            </Card>
          )}

          <div className="mb-3 p-2 border rounded bg-white shadow-sm">
            <label className="fw-bold text-secondary small mb-1 d-block">
              <FaTicketAlt className="text-danger me-1" /> Mã giảm giá (Voucher)
            </label>
            <div className="d-flex gap-2">
              <Form.Control 
                type="text"
                size="sm"
                placeholder="Nhập mã..."
                value={couponInput}
                disabled={appliedCoupon !== null} 
                onChange={(e) => setCouponInput(e.target.value)}
                className="fw-bold text-uppercase"
              />
              {appliedCoupon ? (
                <Button variant="danger" size="sm" onClick={handleRemoveCoupon}>Hủy</Button>
              ) : (
                <Button variant="dark" size="sm" onClick={handleApplyCoupon}>Áp dụng</Button>
              )}
            </div>
            {appliedCoupon && (
              <div className="text-success small fw-bold mt-1">
                ✓ Áp mã thành công, giảm {appliedCoupon.discount}%!
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary small d-block mb-1">Phương thức thanh toán:</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontSize: '0.85rem',
                  border: paymentMethod === 'cash' ? '2px solid #198754' : '1px solid #ced4da',
                  background: paymentMethod === 'cash' ? '#e8f5e9' : '#fff',
                  color: paymentMethod === 'cash' ? '#198754' : '#495057', fontWeight: 'bold'
                }}
              >
                💵 Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('banking')}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontSize: '0.85rem',
                  border: paymentMethod === 'banking' ? '2px solid #0d6efd' : '1px solid #ced4da',
                  background: paymentMethod === 'banking' ? '#e7f1ff' : '#fff',
                  color: paymentMethod === 'banking' ? '#0d6efd' : '#495057', fontWeight: 'bold'
                }}
              >
                🏦 Quét QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontSize: '0.85rem',
                  border: paymentMethod === 'card' ? '2px solid #ffc107' : '1px solid #ced4da',
                  background: paymentMethod === 'card' ? '#fff9db' : '#fff',
                  color: paymentMethod === 'card' ? '#856404' : '#495057', fontWeight: 'bold'
                }}
              >
                💳 Quẹt thẻ
              </button>
            </div>
          </div>

          {paymentMethod === 'cash' ? (
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Khách đưa (Tiền mặt):</Form.Label>
              <Form.Control 
                type="number" 
                autoFocus
                placeholder="Nhập số tiền..." 
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                className="text-end fw-bold text-success fs-5"
              />
            </Form.Group>
          ) : paymentMethod === 'banking' ? (
            <div className="text-center p-2 bg-light border rounded border-primary mb-2">
              <p className="m-0 text-primary fw-bold small">✨ MÃ VIETQR CHUYỂN KHOẢN</p>
              <img 
                src={`https://img.vietqr.io/image/MB-0123456789999-compact.jpg?amount=${finalTotal}&addInfo=UTEShop%20Thanh%20Toan`} 
                alt="QR Code" 
                style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '4px 0' }}
              />
              <p className="m-0 text-danger small">Số tiền: <strong>{finalTotal.toLocaleString('vi-VN')} đ</strong></p>
            </div>
          ) : (
            <div className="text-center p-3 bg-warning bg-opacity-10 border border-warning rounded text-warning-dark mb-2 small fw-bold">
              📶 Chờ thiết bị quẹt thẻ POS...
            </div>
          )}

          <div className="d-flex justify-content-between fs-5 mt-2 pt-2 border-top">
            <span className="small fw-bold">Tiền thừa trả khách:</span>
            <span className={`fw-bold ${changeAmount < 0 ? 'text-danger' : 'text-success'}`}>
                {paymentMethod !== 'card' && paymentMethod !== 'banking' && changeAmount < 0 ? "Khách đưa thiếu!" : `${changeAmount.toLocaleString('vi-VN')} đ`}
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="success" size="sm" className="px-3 fw-bold" onClick={handleConfirmCheckout} disabled={paymentMethod === 'cash' && changeAmount < 0}>
            Chốt & In Bill
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* ================= MODAL QUẢN LÝ ĐƠN HÀNG LƯU TẠM ================= */}
      <Modal show={showHeldOrdersModal} onHide={() => setShowHeldOrdersModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold text-secondary">Danh sách hóa đơn tạm giữ</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '320px', overflowY: 'auto' }} className="text-start">
          {heldOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p className="small m-0">Hiện không có hóa đơn lưu tạm!</p>
            </div>
          ) : (
            <div className="list-group">
              {heldOrders.map((order) => (
                <div key={order.id} className="list-group-item d-flex justify-content-between align-items-center p-2 mb-2 border rounded shadow-sm">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">{order.id}</span>
                      <small className="text-muted">{order.holdAt}</small>
                    </div>
                    <div className="mt-1 small" style={{ fontSize: '0.75rem' }}>
                      <strong>Khách:</strong> {order.customerInfo ? order.customerInfo.name : 'Khách vãng lai'}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-danger small">{order.total.toLocaleString('vi-VN')} đ</span>
                    <Button variant="primary" size="sm" style={{ fontSize: '0.75rem' }} className="fw-bold py-0.5 px-2" onClick={() => handleRecallOrder(order)}>
                      Mở lại
                    </Button>
                    <Button variant="outline-danger" size="sm" className="border-0 p-1" onClick={() => setHeldOrders(heldOrders.filter(o => o.id !== order.id))}>
                      <FaTrashAlt size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="secondary" size="sm" onClick={() => setShowHeldOrdersModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      <OpenShiftModal show={!shiftLoading && currentShift === null && userInfo && !userInfo.isAdmin} />
      <CloseShiftModal show={showCloseShiftModal} handleClose={() => setShowCloseShiftModal(false)} currentShift={currentShift} />
        {/* 🌟 PHÔI IN HÓA ĐƠN K80 TIÊU CHUẨN (SỬ DỤNG CSS PRINT ĐỂ KHÔNG BỊ TRẮNG FILE) */}
      {receiptData && (
        <>
          {/* Đoạn style này giúp ẩn hóa đơn trên màn hình app, nhưng khi Electron "In/Xuất PDF" thì nó tự hiện ra */}
          <style>
            {`
              @media screen {
                #receipt-print-area {
                  display: none !important;
                }
              }
              @media print {
                body * {
                  visibility: hidden;
                }
                #receipt-print-area, #receipt-print-area * {
                  visibility: visible;
                }
                #receipt-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 80mm;
                  padding: 4mm;
                  background: #fff;
                  color: #000;
                }
              }
            `}
          </style>

          <div id="receipt-print-area" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '16px' }}>UTE SHOP</h4>
              <small style={{ display: 'block', fontSize: '11px', color: '#555' }}>Đại học Sư phạm Kỹ thuật TP.HCM</small>
              <small style={{ display: 'block', fontSize: '11px', color: '#555' }}>Hotline: 0123.456.789</small>
              <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
              <h5 style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '14px' }}>HÓA ĐƠN BÁN HÀNG</h5>
              <small style={{ display: 'block', fontSize: '10px' }}>Mã HD: {receiptData.orderId}</small>
              <small style={{ display: 'block', fontSize: '10px' }}>Ngày: {receiptData.date}</small>
            </div>

            <div style={{ fontSize: '11px', marginBottom: '8px', textAlign: 'left' }}>
              <div><strong>Thu ngân:</strong> <span>{userInfo.name}</span></div>
              <div><strong>Khách hàng:</strong> {receiptData.customerName}</div>
              {receiptData.shippingAddress && receiptData.orderType === 'Online' && (
                <div><strong>Địa chỉ giao:</strong> {receiptData.shippingAddress}</div>
              )}
              <div><strong>Hình thức:</strong> {receiptData.orderType} - {receiptData.paymentMethod}</div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }}></div>
            
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '3px' }}>Tên mặt hàng</th>
                  <th style={{ textAlign: 'center', width: '30px', paddingBottom: '3px' }}>SL</th>
                  <th style={{ textAlign: 'right', width: '70px', paddingBottom: '3px' }}>T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px dashed #eee' }}>
                    <td style={{ padding: '4px 0', textAlign: 'left', wordBreak: 'break-word' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right' }}>{(item.qty * item.price).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }}></div>

            <div style={{ fontSize: '11px', textAlign: 'left', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ flex: 1 }}>Cộng tiền hàng:</span>
                <span>{receiptData.total.toLocaleString('vi-VN')} đ</span>
              </div>
              {receiptData.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
                  <span style={{ flex: 1 }}>Giảm giá điểm:</span>
                  <span>-{receiptData.discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {receiptData.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
                  <span style={{ flex: 1 }}>Voucher ({receiptData.couponName}):</span>
                  <span>-{receiptData.couponDiscount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {receiptData.shippingPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ flex: 1 }}>Phí vận chuyển:</span>
                  <span>+{receiptData.shippingPrice.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              
              <div style={{ borderBottom: '1px solid #000', margin: '4px 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span style={{ flex: 1 }}>TỔNG CỘNG:</span>
                <span>{receiptData.finalTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ flex: 1 }}>Khách đưa:</span>
                <span>{receiptData.given.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ flex: 1 }}>Tiền thừa:</span>
                <span>{receiptData.change.toLocaleString('vi-VN')} đ</span>
              </div>

              {receiptData.pointsEarned > 0 && (
                <div style={{ marginTop: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                  *** Bạn được tích thêm {receiptData.pointsEarned} điểm ***
                </div>
              )}
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
            <div style={{ textAlign: 'center', fontSize: '11px' }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI! 🎉</p>
              <small style={{ fontSize: '9px', color: '#888' }}>Powered by UTEShop POS</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;