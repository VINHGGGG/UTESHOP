import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Form, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrashAlt, FaFolderPlus, FaList, FaFolder } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listCategories, createCategory, deleteCategory, resetCategoryStatus } from '../../slices/categorySlice';

const CategoryListScreen = () => {
  const [name, setName] = useState('');
  
  const dispatch = useDispatch();

  const { categories, loading, error, successCreate } = useSelector((state) => state.category);

  useEffect(() => {
    if (successCreate) {
      setName(''); // Reset ô nhập khi thêm thành công
      dispatch(resetCategoryStatus());
    }
    dispatch(listCategories());
  }, [dispatch, successCreate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch(createCategory(name));
    }
  };

  const deleteHandler = (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa danh mục này? Hệ thống sẽ mất danh mục của các sản phẩm thuộc nhóm này!')) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div 
      className="p-4" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: 'calc(100vh - 56px)', 
        overflowY: 'auto' 
      }}
    >
      <Row className="g-4">
        {/* TIÊU ĐỀ TRANG */}
        <Col md={12} className="d-flex align-items-center gap-2 border-bottom pb-3 mb-2">
          <FaFolder className="fs-3 text-dark" />
          <h2 className="fw-bold text-dark m-0">QUẢN LÝ DANH MỤC SẢN PHẨM</h2>
        </Col>
        
        {/* CỘT TRÁI: FORM THÊM MỚI */}
        <Col lg={4} md={12}>
          <Card className="border-0 shadow-sm rounded overflow-hidden">
            <Card.Header className="bg-dark text-white p-3 fw-bold d-flex align-items-center gap-2">
              <FaFolderPlus /> Thêm Danh Mục Mới
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={submitHandler}>
                <Form.Group controlId='name' className='mb-3'>
                  <Form.Label className="fw-bold text-secondary">Tên danh mục</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Nhập tên danh mục (VD: Đồ ăn, Thức uống)'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="py-2"
                    required
                  ></Form.Control>
                </Form.Group>
                
                <Button 
                  type='submit' 
                  variant='primary' 
                  className='w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm'
                >
                  <FaFolderPlus /> Thêm vào hệ thống
                </Button>
              </Form>
              {error && <Message variant='danger' className='mt-3'>{error}</Message>}
            </Card.Body>
          </Card>
        </Col>

        {/* CỘT PHẢI: DANH SÁCH CÁC DANH MỤC */}
        <Col lg={8} md={12}>
          <Card className="border-0 shadow-sm rounded overflow-hidden">
            <Card.Header className="bg-white p-3 fw-bold text-dark d-flex align-items-center gap-2 border-bottom">
              <FaList className="text-primary" /> Danh Sách Danh Mục Hiện Tại
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="p-4"><Loader /></div>
              ) : (
                <Table hover responsive className='table-sm m-0 align-middle'>
                  <thead className="table-light text-secondary" style={{ fontSize: '0.85rem' }}>
                    <tr>
                      <th className="p-3" style={{ width: '40%' }}>MÃ DANH MỤC (ID)</th>
                      <th className="p-3">TÊN DANH MỤC</th>
                      <th className="p-3 text-center" style={{ width: '15%' }}>HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td className="p-3 text-muted" style={{ fontSize: '0.85rem' }}>
                            <code>{category._id}</code>
                          </td>
                          <td className="p-3 fw-semibold text-dark">
                            {category.name}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant='outline-danger'
                              className='btn-sm border-0 rounded-circle p-2'
                              onClick={() => deleteHandler(category._id)}
                              title="Xóa danh mục này"
                            >
                              <FaTrashAlt />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center p-4 text-muted">
                          Chưa có danh mục nào được khởi tạo trong cơ sở dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CategoryListScreen;