import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <Container>
        {/* Phần đăng ký nhận tin */}
        <div className="bg-secondary p-4 rounded mb-4">
            <Row className="align-items-center">
                <Col md={6}>
                    <h5>Đăng ký nhận bản tin UTESHOP</h5>
                    <p className="mb-0">Nhận ngay thông tin về các chương trình khuyến mãi</p>
                </Col>
                <Col md={6}>
                    <Form className="d-flex">
                        <Form.Control type="email" placeholder="Email của bạn..." className="me-2" />
                        <Button variant="dark">Đăng ký</Button>
                    </Form>
                </Col>
            </Row>
        </div>

        <Row>
          <Col md={4}>
            <h5>VỀ UTESHOP</h5>
            <ul className="list-unstyled">
              <li>CN1 - HCM</li>
              <li>CN2 - AG</li>
              <li>CN3 - LĐ</li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>HỆ THỐNG TỔNG ĐÀI MIỄN PHÍ</h5>
            <p>Tổng đài mua hàng: 0814 941 xxx</p>
            <p>Tổng đài hỗ trợ: 0385 122 xxx</p>
          </Col>
          <Col md={4}>
            <h5>KẾT NỐI VỚI CHÚNG TÔI</h5>
            <div style={{ fontSize: '1.5rem' }}>
                <i className="fab fa-facebook me-3"></i>
                <i className="fab fa-youtube me-3"></i>
                <i className="fab fa-tiktok"></i>
            </div>
          </Col>
        </Row>
        <Row className="mt-3">
            <Col className="text-center">
                Copyright &copy; UTESHOP
            </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;