import { configureStore } from '@reduxjs/toolkit';

// 1. Import Reducer cũ (Giữ lại cái Details để trang chi tiết ko bị lỗi)
import { productDetailsReducer } from './reducers/productReducers';

// 2. Import Reducer MỚI (Lấy từ file SLICE cậu vừa tạo)
import productReducer from './slices/productSlice'; 

// 3. Các import khác giữ nguyên
import cartSliceReducer from './slices/cartSlice';
import userReducer from './slices/userSlice'; 
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice'
import couponReducer from './slices/couponSlice';
import customerReducer from './slices/customerSlice';
import supplierReducer from './slices/supplierSlice';
import purchaseReducer from './slices/purchaseSlice';
import shiftReducer from './slices/shiftSlice';


const store = configureStore({
  reducer: {
    // --- QUAN TRỌNG: ĐỔI TÊN Ở ĐÂY ---
    // Thay vì dùng 'productList' cũ, mình dùng 'product' mới
    // Ngăn này sẽ lo việc: Hiển thị danh sách & Xóa sản phẩm
    product: productReducer, 
    
    // Vẫn giữ ngăn này để xem chi tiết từng cái (chưa chuyển qua slice)
    productDetails: productDetailsReducer,
    
    cart: cartSliceReducer,
    user: userReducer, 
    order: orderReducer,
    category: categoryReducer,
    coupon: couponReducer,
    customer: customerReducer,
    supplier: supplierReducer,
    purchase: purchaseReducer,
    shiftWatch: shiftReducer,
  },
});

export default store;