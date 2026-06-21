import React, { useState } from 'react'
import { Form, Button, Container, Alert } from 'react-bootstrap'
import axios from 'axios'
import FormContainer from '../components/FormContainer'

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setMessage(null)
      
      const { data } = await axios.post('/api/users/forgotpassword', { email })
      
      setMessage(data.data) // "Email đã được gửi"
      setLoading(false)
    } catch (err) {
      setError(err.response?.data.message || err.message)
      setLoading(false)
    }
  }

  return (
    <FormContainer>
      <h1>Quên mật khẩu</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}
      
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='email' className='mb-3'>
          <Form.Label>Nhập địa chỉ Email của bạn</Form.Label>
          <Form.Control
            type='email'
            placeholder='Nhập email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Button type='submit' variant='primary' disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi link reset'}
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ForgotPasswordScreen