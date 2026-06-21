import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { closeShift } from '../slices/shiftSlice';
import { clearCartItems } from '../slices/cartSlice';
import { logout } from '../slices/userSlice';

const CloseShiftModal = ({ show, handleClose, currentShift }) => {
  const [endAmountReal, setEndAmountReal] = useState('');
  const [difference, setDifference] = useState(0);
  const [note, setNote] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tự động tính chênh lệch real-time khi thu ngân gõ số tiền đếm được
  useEffect(() => {
    if (currentShift && endAmountReal !== '') {
      const expected = currentShift.expectedAmount || 0;
      setDifference(Number(endAmountReal) - expected);
    } else {
      setDifference(0);
    }
  }, [endAmountReal, currentShift]);
  const inPhieuGiaoCa = (shiftData) => {
    // Tạo một cửa sổ mới tạm thời để dựng giao diện in
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Tính toán thời gian
    const openTime = new Date(shiftData.openedAt).toLocaleString('vi-VN');
    const closeTime = new Date(shiftData.closedAt).toLocaleString('vi-VN');
    
    // Trạng thái thừa thiếu tiền
    let txtChenhLech = "Khớp két 100%";
    if (shiftData.difference > 0) txtChenhLech = `Thừa tiền: +${shiftData.difference.toLocaleString('vi-VN')} đ`;
    if (shiftData.difference < 0) txtChenhLech = `Thiếu tiền: ${shiftData.difference.toLocaleString('vi-VN')} đ`;

    // Dựng layout HTML cho mẫu báo cáo (Khổ K80 phổ biến của máy in bill)
    printWindow.document.write(`
      <html>
        <head>
          <title>BIÊN BẢN BÀN GIAO CA & KIỂM KẾT</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 10px; font-size: 13px; color: #000; }
            .text-center { text-align: center; }
            .fw-bold { font-weight: bold; }
            .title { font-size: 16px; margin-bottom: 5px; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .flex-space { display: flex; justify-content: space-between; margin: 4px 0; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 30px; text-align: center; }
            .sign-box { width: 45%; font-size: 12px; }
          </style>
        </head>
        <body>
          <h3 class="text-center title">BIÊN BẢN BÀN GIAO CA</h3>
          <p class="text-center fw-bold">--- KẾT QUẢ KIỂM KẾT TÀI CHÍNH ---</p>
          <div class="divider"></div>
          
          <div class="flex-space"><span>Mã ca trực:</span> <span class="fw-bold">#${shiftData._id?.substring(18)}</span></div>
          <div class="flex-space"><span>Thu ngân bàn giao:</span> <span class="fw-bold">Nhân viên POS</span></div>
          <div class="flex-space"><span>Giờ mở ca:</span> <span>${openTime}</span></div>
          <div class="flex-space"><span>Giờ chốt ca:</span> <span>${closeTime}</span></div>
          
          <div class="divider"></div>
          <p class="fw-bold text-center">📊 DOANH THU HỆ THỐNG GHI NHẬN</p>
          
          <div class="flex-space"><span>💰 Tiền mồi đầu ca:</span> <span class="fw-bold">${shiftData.startAmount?.toLocaleString('vi-VN')} đ</span></div>
          <div class="flex-space"><span>💵 Doanh thu Tiền mặt:</span> <span>+${shiftData.cashSales?.toLocaleString('vi-VN')} đ</span></div>
          <div class="flex-space"><span>💳 Doanh thu Quẹt thẻ:</span> <span>+${shiftData.cardSales?.toLocaleString('vi-VN')} đ</span></div>
          <div class="flex-space"><span>📲 Doanh thu CK:</span> <span>+${shiftData.transferSales?.toLocaleString('vi-VN')} đ</span></div>
          <div class="divider"></div>
          <div class="flex-space fw-bold"><span>📈 Tổng doanh số bán:</span> <span>${shiftData.totalSales?.toLocaleString('vi-VN')} đ</span></div>
          
          <div class="divider"></div>
          <p class="fw-bold text-center">🧮 ĐỐI SOÁT QUỸ TIỀN MẶT</p>
          
          <div class="flex-space"><span>💵 Tiền mặt lý thuyết:</span> <span class="fw-bold">${shiftData.expectedAmount?.toLocaleString('vi-VN')} đ</span></div>
          <div class="flex-space"><span>🔍 Tiền mặt ĐẾM THỰC TẾ:</span> <span class="fw-bold">${shiftData.endAmountReal?.toLocaleString('vi-VN')} đ</span></div>
          <div class="divider"></div>
          <div class="flex-space fw-bold" style="font-size: 14px;">
            <span>⚠️ Chênh lệch két:</span> 
            <span>${txtChenhLech}</span>
          </div>
          
          <div class="divider"></div>
          <p><strong>Ghi chú giải trình:</strong> ${shiftData.note || 'Không có ghi chú.'}</p>
          
          <div class="footer-sign">
            <div class="sign-box">
              <span class="fw-bold">Người bàn giao</span><br><br><br><br>
              (Ký & ghi rõ họ tên)
            </div>
            <div class="sign-box">
              <span class="fw-bold">Người nhận bàn giao</span><br><br><br><br>
              (Ký & ghi rõ họ tên)
            </div>
          </div>
          
          <p class="text-center" style="margin-top: 30px; font-size: 10px; font-style: italic;">Ngày in phiếu: ${new Date().toLocaleString('vi-VN')}</p>
        </body>
      </html>
    `);
    
    // Kích hoạt lệnh in của trình duyệt/Electron
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (endAmountReal === '' || isNaN(endAmountReal)) {
      alert('Vui lòng nhập số tiền thực tế trong két!');
      return;
    }
    
    if (window.confirm('Bạn chắc chắn muốn chốt ca làm việc này? Hành động này không thể hoàn tác.')) {
      dispatch(closeShift({ endAmountReal: Number(endAmountReal), note }))
        .unwrap()
        .then((res) => {
          console.log("✅ Đã chốt ca thành công gửi từ Backend:", res);
          alert("Đã chốt ca thành công! Hệ thống sẽ tiến hành xuất phiếu giao ca.");
          
          // 🌟 GỌI HÀM IN BÁO CÁO KẾT CA TẠI ĐÂY:
          inPhieuGiaoCa(res);
          dispatch(clearCartItems());
          handleClose();
          dispatch(logout());
          navigate('/login');
        })
        .catch((err) => {
          console.error("❌ Lỗi khi đóng ca:", err);
          alert("Lỗi chốt ca: " + err);
        });
    }
  };

  if (!currentShift) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>🗄️ Chốt Ca Làm Việc & Kiểm Két Tiền</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <h5>📊 Báo Cáo Doanh Thu Hệ Thống</h5>
              <hr />
              <p>💰 Tiền mồi đầu ca: <strong>{currentShift.startAmount?.toLocaleString()} đ</strong></p>
              <p>💵 Doanh thu Tiền mặt: <span className="text-success fw-bold">+{currentShift.cashSales?.toLocaleString()} đ</span></p>
              <p>💳 Doanh thu Quẹt thẻ: +{currentShift.cardSales?.toLocaleString()} đ</p>
              <p>📲 Doanh thu Chuyển khoản: +{currentShift.transferSales?.toLocaleString()} đ</p>
              <h6 className="text-primary">📈 Tổng doanh thu bán hàng: {currentShift.totalSales?.toLocaleString()} đ</h6>
            </Col>
            
            <Col md={6} className="border-start">
              <h5>🧮 Đối Soát Két Tiền Mặt</h5>
              <hr />
              <Alert variant="warning" className="py-2">
                💵 Tiền mặt lý thuyết phải có trong két:<br />
                <strong style={{ fontSize: '1.2rem' }}>{currentShift.expectedAmount?.toLocaleString()} đ</strong>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-danger">Tiền mặt THỰC TẾ đếm được trong két (VNĐ):</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Nhập số tiền thực tế đếm được..."
                  value={endAmountReal}
                  onChange={(e) => setEndAmountReal(e.target.value)}
                  required
                />
              </Form.Group>

              {endAmountReal !== '' && (
                <Alert variant={difference === 0 ? 'success' : difference > 0 ? 'info' : 'danger'}>
                  📊 Kết quả đối soát: {' '}
                  <strong style={{ fontSize: '1.1rem' }}>
                    {difference === 0 ? 'Khớp két 100%' : difference > 0 ? `Thừa tiền: +${difference.toLocaleString()} đ` : `Hụt két (Thiếu): ${difference.toLocaleString()} đ`}
                  </strong>
                </Alert>
              )}
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Ghi chú bàn giao ca (Lý do nếu thừa/thiếu tiền):</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Nhập ghi chú giải trình nếu két tiền bị hụt..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Hủy bỏ</Button>
          <Button variant="danger" type="submit" className="fw-bold">🔒 Khóa Ca & Xuất Báo Cáo</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CloseShiftModal;