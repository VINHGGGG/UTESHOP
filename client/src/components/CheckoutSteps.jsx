import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3 }) => {
  // Style chung cho các bước
  const stepStyle = {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    textDecoration: 'none', // Bỏ gạch chân
  };

  // Style cho thanh nối (Line)
  const lineStyle = (isActive) => ({
    flexGrow: 1,
    height: '3px',
    backgroundColor: isActive ? '#198754' : '#e9ecef', // Xanh nếu đã qua, Xám nếu chưa
    margin: '0 15px',
    borderRadius: '5px'
  });

  return (
    <div className="d-flex justify-content-center align-items-center mb-5 mt-3">
      
      {/* --- BƯỚC 1: ĐĂNG NHẬP --- */}
      <div style={stepStyle} className={step1 ? 'text-success' : 'text-muted'}>
        {step1 ? <i className="fas fa-check-circle me-2"></i> : <span className="me-2">1.</span>}
        Đăng nhập
      </div>

      {/* Dây nối 1-2 */}
      <div style={lineStyle(step1 && step2)}></div>

      {/* --- BƯỚC 2: ĐỊA CHỈ & THANH TOÁN --- */}
      <div style={stepStyle} className={step2 ? 'text-success' : 'text-muted'}>
        {step2 ? <i className="fas fa-check-circle me-2"></i> : <span className="me-2">2.</span>}
        Địa chỉ & Thanh toán
      </div>

      {/* Dây nối 2-3 */}
      <div style={lineStyle(step2 && step3)}></div>

      {/* --- BƯỚC 3: HOÀN TẤT --- */}
      <div style={stepStyle} className={step3 ? 'text-success' : 'text-muted'}>
        {step3 ? <i className="fas fa-check-circle me-2"></i> : <span className="me-2">3.</span>}
        Hoàn tất
      </div>

    </div>
  );
};

export default CheckoutSteps;