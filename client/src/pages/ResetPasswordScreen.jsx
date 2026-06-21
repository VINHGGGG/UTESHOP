import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import axios from 'axios'
import FormContainer from '../components/FormContainer'

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  
  const { token } = useParams() // Lấy token từ URL
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Mật khẩu không khớp')
      return
    }

    try {
      await axios.put(`/api/users/resetpassword/${token}`, { password })
      alert('Đổi mật khẩu thành công! Hãy đăng nhập lại.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data.message || err.message)
    }
  }

  return (
    <FormContainer>
      <h1>Đặt lại mật khẩu</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {message && <Alert variant='danger'>{message}</Alert>}

      <Form onSubmit={submitHandler}>
        <Form.Group controlId='password'>
          <Form.Label>Mật khẩu mới</Form.Label>
          <Form.Control
            type='password'
            placeholder='Nhập mật khẩu mới'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId='confirmPassword'>
          <Form.Label>Nhập lại mật khẩu</Form.Label>
          <Form.Control
            type='password'
            placeholder='Nhập lại mật khẩu'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3'>
          Đổi mật khẩu
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ResetPasswordScreen