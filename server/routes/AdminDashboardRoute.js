import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Screens
import AdminDashboard from '../screens/admin/AdminDashboard'

// Component bảo vệ route admin
import AdminRoute from './AdminRoute'

const AdminDashboardRoute = () => {
  return (
    <Routes>
      <Route
        path='/admin/dashboard'
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  )
}

export default AdminDashboardRoute
