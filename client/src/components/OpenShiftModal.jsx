import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { openShift } from '../slices/shiftSlice'; // Sửa lại đường dẫn cho đúng dự án của cậu

const OpenShiftModal = ({ show }) => {
  const [startAmount, setStartAmount] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🔍 VẾT LOG 1: Kiểm tra xem click chuột đã ăn vào hàm chưa
    console.log("👉 ĐÃ BẤM NÚT MỞ CA! Số tiền nhập:", startAmount);

    if (startAmount === '' || isNaN(startAmount) || Number(startAmount) < 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    // Thực hiện gửi lên Redux
    dispatch(openShift(Number(startAmount)))
      .unwrap() // Mẹo unwrap để lấy kết quả trực tiếp từ Thunk
      .then((data) => {
        // 🔍 VẾT LOG 2: Thành công
        console.log("✅ MỞ CA THÀNH CÔNG TỪ DB:", data);
        alert("Mở ca làm việc thành công! Hệ thống POS đã sẵn sàng.");
      })
      .catch((err) => {
        // 🔍 VẾT LOG 3: Thất bại (Ví dụ bị Backend chặn do trùng ca)
        console.error("❌ LỖI KHI MỞ CA:", err);
        alert("Lỗi mở ca: " + err);
      });
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title>🔑 Khởi Tạo Ca Làm Việc Mới</Modal.Title>
      </Modal.Header>
      {/* 🚨 ĐẢM BẢO THẺ FORM CÓ ONSUBMIT CHUẨN */}
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted">
            Vui lòng nhập tổng số <strong>tiền mặt hiện có trong két</strong> (tiền lẻ mồi đầu ca).
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Tiền mặt đầu ca (VNĐ):</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ví dụ: 500000"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {/* 🚨 ĐẢM BẢO NÚT CÓ TYPE="SUBMIT" */}
          <Button variant="primary" type="submit" className="w-100 fw-bold">
            🚀 Mở Ca & Bắt Đầu Bán Hàng
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default OpenShiftModal;