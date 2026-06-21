import React, { useEffect, useState, useRef } from 'react' // 👇 Thêm useRef
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Alert, Button } from 'react-bootstrap'

const VerifyScreen = () => {
  const [status, setStatus] = useState('loading') 
  const { token } = useParams()
  
  // 👇 Dùng biến này để đảm bảo chỉ gọi API đúng 1 lần
  const isCalled = useRef(false) 

  useEffect(() => {
    // Nếu đã gọi rồi thì return luôn, không chạy đoạn dưới nữa
    if (isCalled.current) return 

    const verifyAccount = async () => {
      // Đánh dấu là đã gọi
      isCalled.current = true 

      try {
        await axios.get(`/api/users/verify/${token}`)
        setStatus('success')
      } catch (error) {
        // Chỉ set lỗi nếu chưa từng thành công (tránh trường hợp React render lại)
        setStatus('error')
      }
    }

    verifyAccount()
  }, [token])

  return (
    <Container className='text-center mt-5'>
      {status === 'loading' && <h2>Đang xác thực...</h2>}
      
      {status === 'success' && (
        <Alert variant='success'>
          <h4>Xác thực thành công! 🎉</h4>
          <p>Tài khoản của bạn đã được kích hoạt.</p>
          <Link to='/login'>
            <Button variant='success'>Đăng nhập ngay</Button>
          </Link>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant='danger'>
          <h4>Xác thực thất bại! 😔</h4>
          <p>Link xác thực không hợp lệ hoặc đã hết hạn.</p>
          {/* Nút về trang chủ hoặc đăng nhập */}
          <Link to='/login' className='btn btn-primary'>
             Về trang đăng nhập
          </Link>
        </Alert>
      )}
    </Container>
  )
}

export default VerifyScreen