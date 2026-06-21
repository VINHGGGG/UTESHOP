import React, { useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { getDashboardStats } from '../../slices/orderSlice';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy data từ Redux
  const orderState = useSelector((state) => state.order);
  const { loading, error, stats } = orderState;

  const userLogin = useSelector((state) => state.user || state.auth);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(getDashboardStats());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  // Màu sắc cho biểu đồ tròn (Phương thức thanh toán)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 📊 XỬ LÝ DỮ LIỆU BIỂU ĐỒ CỘT: 7 ngày gần nhất từ Backend (Nếu trống sẽ hiển thị trục ngang bằng 0)
  const chartMonthlyData = stats?.weeklySales && stats.weeklySales.length > 0 
    ? stats.weeklySales 
    : [
        { name: 'Thứ 2', doanhThu: 0 },
        { name: 'Thứ 3', doanhThu: 0 },
        { name: 'Thứ 4', doanhThu: 0 },
        { name: 'Thứ 5', doanhThu: 0 },
        { name: 'Thứ 6', doanhThu: 0 },
        { name: 'Thứ 7', doanhThu: 0 },
        { name: 'Chủ Nhật', doanhThu: 0 },
      ];

  // 💳 XỬ LÝ DỮ LIỆU BIỂU ĐỒ TRÒN: Phương thức thanh toán thật từ Backend
  const chartPaymentData = stats?.paymentStats && stats.paymentStats.length > 0
    ? stats.paymentStats
    : [
        { name: 'Chưa có dữ liệu', value: 100 } // Hiển thị vòng xám mặc định nếu chưa bán đơn nào
      ];

  const chartColors = stats?.paymentStats && stats.paymentStats.length > 0 ? COLORS : ['#e0e0e0'];

  // Style đổ bóng hiện đại cho các khối
  const cardShadowStyle = {
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: 'none',
    transition: 'transform 0.2s ease-in-out'
  };

  return (
    <div 
      style={{ 
        height: 'calc(100vh - 56px)', 
        overflowY: 'auto',            
        backgroundColor: '#f8f9fa',   
        scrollBehavior: 'smooth'
      }}
    >
      <div className="p-4 mx-auto" style={{ maxWidth: '1600px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ fontWeight: '700', color: '#2b2b2b' }}>Tổng quan hệ thống UTEShop</h1>
            <p className="text-muted m-0">Chào mừng trở lại, {userInfo?.name || 'Quản lý'}!</p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : stats ? (
          <>
            {/* ================= KHU VỰC 4 THẺ CHỈ SỐ DỮ LIỆU THẬT ================= */}
            <Row className="g-3 mb-4">
              {/* 1. NHÂN VIÊN */}
              <Col lg={3} sm={6} xs={12}>
                <Card className='text-white bg-primary h-100' style={cardShadowStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>NHÂN VIÊN</span>
                        <h2 className="mt-2" style={{ fontWeight: '700', fontSize: '32px' }}>{stats.userCount || 0}</h2>
                      </div>
                      <i className="fas fa-users fa-2x opacity-50"></i>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '10px' }}>📈 Tổng số nhân viên đang làm việc</div>
                  </Card.Body>
                </Card>
              </Col>

              {/* 2. DOANH THU */}
              <Col lg={3} sm={6} xs={12}>
                <Card className='text-white bg-success h-100' style={cardShadowStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>TỔNG DOANH THU</span>
                        <h2 className="mt-2" style={{ fontWeight: '700', fontSize: '26px' }}>{(stats.totalSales || 0).toLocaleString('vi-VN')} đ</h2>
                      </div>
                      <i className="fas fa-dollar-sign fa-2x opacity-50"></i>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '10px' }}>🎯 Không bao gồm trả hàng và hủy đơn</div>
                  </Card.Body>
                </Card>
              </Col>

              {/* 3. ĐƠN HÀNG */}
              <Col lg={3} sm={6} xs={12}>
                <Card className='text-white bg-info h-100' style={cardShadowStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>HÓA ĐƠN ĐÃ BÁN</span>
                        <h2 className="mt-2" style={{ fontWeight: '700', fontSize: '32px' }}>{stats.orderCount || 0}</h2>
                      </div>
                      <i className="fas fa-shopping-bag fa-2x opacity-50"></i>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '10px' }}>🛒 Không bao gồm các đơn hàng bị hủy</div>
                  </Card.Body>
                </Card>
              </Col>

              {/* 4. SẢN PHẨM */}
              <Col lg={3} sm={6} xs={12}>
                <Card className='text-white bg-warning h-100' style={cardShadowStyle}>
                  <Card.Body className="d-flex flex-column justify-content-between p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>SẢN PHẨM KINH DOANH</span>
                        <h2 className="mt-2" style={{ fontWeight: '700', fontSize: '32px' }}>{stats.productCount || 0}</h2>
                      </div>
                      <i className="fas fa-box fa-2x opacity-50"></i>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '10px' }}>📦 Số lượng mặt hàng trong kho</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ================= KHU VỰC BIỂU ĐỒ ================= */}
            <Row className="g-4 mb-4">
              {/* Biểu đồ Doanh thu cột */}
              <Col lg={8} md={12}>
                <Card style={{ ...cardShadowStyle, backgroundColor: '#fff' }} className="p-4">
                  <Card.Title className="text-dark mb-4" style={{ fontWeight: '600', fontSize: '16px' }}>
                    📊 Biểu đồ Doanh thu 7 ngày gần nhất
                  </Card.Title>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#6c757d' }} />
                        <YAxis tickFormatter={(val) => `${val.toLocaleString('vi-VN')} đ`} tick={{ fill: '#6c757d' }} />
                        <Tooltip formatter={(value) => [Number(value).toLocaleString('vi-VN') + ' đ', 'Doanh thu']} />
                        <Legend />
                        <Bar dataKey="doanhThu" fill="#28a745" radius={[6, 6, 0, 0]} name="Doanh thu" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* Biểu đồ Tỷ lệ Phương thức thanh toán */}
              <Col lg={4} md={12}>
                <Card style={{ ...cardShadowStyle, backgroundColor: '#fff' }} className="p-4 h-100 d-flex flex-column justify-content-between">
                  <Card.Title className="text-dark mb-2" style={{ fontWeight: '600', fontSize: '16px' }}>
                    💳 Tỷ lệ Phương thức Thanh toán
                  </Card.Title>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chartPaymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartPaymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => stats?.paymentStats?.length > 0 ? `${value}%` : '0%'} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="d-flex justify-content-around mt-2" style={{ fontSize: '13px', fontWeight: '500' }}>
                    {stats?.paymentStats && stats.paymentStats.length > 0 ? (
                      stats.paymentStats.map((item, index) => (
                        <span key={item.name} className="d-flex align-items-center gap-1">
                          <span style={{ width: '10px', height: '10px', backgroundColor: COLORS[index], borderRadius: '50%', display: 'inline-block' }}></span>
                          {item.name} ({item.value}%)
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">Chưa phát sinh giao dịch</span>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* ================= KHU VỰC CHI TIẾT BẢNG SẠCH MOCK DATA ================= */}
            <Row className="g-4">
              {/* Top sản phẩm bán chạy */}
              <Col md={6} xs={12}>
                <Card style={{ ...cardShadowStyle, backgroundColor: '#fff' }} className="p-4">
                  <Card.Title className="text-dark mb-3" style={{ fontWeight: '600', fontSize: '16px' }}>
                    🔥 Sản phẩm bán chạy nổi bật
                  </Card.Title>
                  <Table responsive hover className="align-middle mb-0">
                    <thead>
                      <tr className="text-muted" style={{ fontSize: '13px' }}>
                        <th>Tên sản phẩm</th>
                        <th className="text-end">Số lượng đã bán</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px', fontWeight: '500' }}>
                      {stats.topProducts && stats.topProducts.length > 0 ? (
                        stats.topProducts.map((p) => (
                          <tr key={p._id}>
                            <td>{p.name}</td>
                            <td className="text-end text-danger" style={{ fontWeight: '700' }}>{p.qtySold} sản phẩm</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center text-muted py-4">
                             Có đơn hàng nào đâu mà bán chạy, đi bán mở hàng đi cậu ơi! 🎉
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Col>

              {/* Đơn hàng vừa phát sinh */}
              <Col md={6} xs={12}>
                <Card style={{ ...cardShadowStyle, backgroundColor: '#fff' }} className="p-4">
                  <Card.Title className="text-dark mb-3" style={{ fontWeight: '600', fontSize: '16px' }}>
                    ⚡ Giao dịch vừa phát sinh tại quầy
                  </Card.Title>
                  <div className="d-flex flex-column gap-3">
                    {stats.latestOrders && stats.latestOrders.length > 0 ? (
                      stats.latestOrders.map((order) => (
                        <div key={order._id} className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <div>
                            <span className="fw-bold text-primary" style={{ fontSize: '14px' }}>#{order._id.substring(0, 8).toUpperCase()}</span>
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                              {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod}
                            </div>
                          </div>
                          <span className="fw-bold" style={{ color: '#2b2b2b' }}>{order.totalPrice.toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-4">
                        Chưa có giao dịch nào được ghi nhận tại quầy POS.
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        ) : null}

      </div>
    </div>
  );
};

export default DashboardScreen;