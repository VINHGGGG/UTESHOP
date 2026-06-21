import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = ({ children }) => {
  const userLogin = useSelector((state) => state.user)
  const { userInfo } = userLogin

  return userInfo && userInfo.isAdmin ? (
    children
  ) : (
    <Navigate to='/login' replace />
  )
}

export default AdminRoute
