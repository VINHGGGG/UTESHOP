import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.tsx'
import './index.css' // Hoặc file css tổng của cậu

// 1. Import Redux
import { Provider } from 'react-redux'
// @ts-ignore  <-- (Nhớ giữ lại cái này nếu cậu xài cách 2 ở tin nhắn trước nha)
import store from './store.js' 

// 2. Import Router (CÚ HACK CHO ELECTRON)
import { HashRouter } from 'react-router-dom'

// 3. Import Axios và cấu hình đường dẫn Backend
import axios from 'axios'
axios.defaults.baseURL = 'https://uteshop-api.onrender.com'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Phải dùng HashRouter thay vì BrowserRouter nhé */}
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>,
)