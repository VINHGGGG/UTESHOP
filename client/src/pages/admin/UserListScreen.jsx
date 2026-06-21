import React, { useEffect } from 'react';
import { Table, Button, Badge, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaUserPlus, FaUsersCog, FaUserShield, FaUserTag } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listUsers, deleteUser } from '../../slices/userSlice';

const UserListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userList = useSelector((state) => state.user);
  const { loading, error, users, successDelete } = userList;

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, successDelete, userInfo]);

  const deleteHandler = (id) => {
    if (id === userInfo._id) {
      alert('❌ Bạn không thể tự xóa tài khoản chính mình đang đăng nhập!');
      return;
    }
    if (window.confirm('🚨 CẢNH BÁO BẢO MẬT!\nXóa nhân viên này đồng nghĩa họ sẽ mất toàn bộ quyền truy cập vào máy POS.\nBạn chắc chắn muốn xóa?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    /* 🎯 FIX LỖI CUỘN: Giới hạn chiều cao vùng nội dung và kích hoạt thanh cuộn dọc */
    <div 
      className="p-4" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        height: 'calc(100vh - 56px)', 
        overflowY: 'auto', 
        scrollBehavior: 'smooth' 
      }}
    >
      {/* HEADER BANNER TÍCH HỢP NÚT THÊM MỚI */}
      <Card className="mb-4 border-0 shadow-sm bg-white p-3 rounded">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
              <FaUsersCog className="text-primary fs-3" />
            </div>
            <div>
              <h4 className="text-dark mb-1 fw-bold">Nhân Sự & Quyền Truy Cập</h4>
              <small className="text-muted">Quản lý danh sách nhân viên vận hành máy POS và phân hệ chức vụ</small>
            </div>
          </div>
          
          {/* NÚT THÊM NHÂN VIÊN MỚI (Admin tự cấp tài khoản) */}
          <Link to="/admin/user/create">
            <Button variant="primary" className="fw-bold d-flex align-items-center shadow-sm py-2">
              <FaUserPlus className="me-2" /> Cấp Tài Khoản Mới
            </Button>
          </Link>
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Card className="border-0 shadow-sm rounded overflow-hidden mb-4">
          <Table hover responsive className='align-middle mb-0' style={{ backgroundColor: '#fff' }}>
            <thead className="table-dark">
              <tr>
                <th className="ps-3" style={{ backgroundColor: '#1a2d42' }}>MÃ NHÂN VIÊN</th>
                <th style={{ backgroundColor: '#1a2d42' }}>HỌ VÀ TÊN</th>
                <th style={{ backgroundColor: '#1a2d42' }}>EMAIL ĐĂNG NHẬP</th>
                <th className="text-center" style={{ backgroundColor: '#1a2d42' }}>PHÂN HỆ CHỨC VỤ</th>
                <th className="text-center" style={{ width: '130px', backgroundColor: '#1a2d42' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {users && users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td className="ps-3 fw-bold text-secondary" style={{ fontSize: '13px' }}>
                    #{user._id.substring(user._id.length - 8).toUpperCase()}
                  </td>
                  <td className="fw-bold text-dark">{user.name}</td>
                  <td>
                    <a href={`mailto:${user.email}`} className="text-decoration-none fw-semibold text-secondary">
                      {user.email}
                    </a>
                  </td>
                  <td className="text-center">
                    {/* 🎯 SỬA CHỔ NÀY: Biến đổi thành Badge ghi rõ chức vụ cho chuẩn 2 actor POS */}
                    {user.isAdmin ? (
                      <Badge bg="danger" className="px-2 py-1fw-bold d-inline-flex align-items-center">
                        <FaUserShield className="me-1" /> Quản trị viên (Admin)
                      </Badge>
                    ) : (
                      <Badge bg="success" className="bg-opacity-10 text-success px-2 py-1 fw-bold d-inline-flex align-items-center">
                        <FaUserTag className="me-1" /> Nhân viên thu ngân
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <Link to={`/admin/user/${user._id}/edit`}>
                      <Button variant='outline-primary' className='btn-sm me-1 border-0 shadow-sm' title="Sửa thông tin">
                        <FaEdit />
                      </Button>
                    </Link>
                    
                    <Button
                      variant='outline-danger'
                      className='btn-sm border-0 shadow-sm'
                      onClick={() => deleteHandler(user._id)}
                      title="Xóa tài khoản nhân viên"
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default UserListScreen;