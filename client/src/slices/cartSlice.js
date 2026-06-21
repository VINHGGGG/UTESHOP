import { createSlice } from '@reduxjs/toolkit';

// 1. Lấy danh sách sản phẩm từ LocalStorage (nếu có)
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

// 2. Lấy địa chỉ giao hàng từ LocalStorage (nếu có)
const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

// 3. Khởi tạo State ban đầu
const initialState = {
  cartItems: cartItemsFromStorage,          // Giỏ hàng
  shippingAddress: shippingAddressFromStorage, // Địa chỉ
  paymentMethod: 'COD',                     // Mặc định thanh toán tiền mặt
  coupon: localStorage.getItem('coupon') ? JSON.parse(localStorage.getItem('coupon')) : null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // --- THÊM SẢN PHẨM ---
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      // Lưu lại vào LocalStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    // --- XÓA SẢN PHẨM ---
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    // --- LƯU ĐỊA CHỈ GIAO HÀNG ---
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },

    // --- LƯU PHƯƠNG THỨC THANH TOÁN ---
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },

    saveCoupon: (state, action) => {
      state.coupon = action.payload; // Payload sẽ là object { code: 'SALE10', discount: 10 }
      localStorage.setItem('coupon', JSON.stringify(action.payload));
    },

    // --- DỌN SẠCH GIỎ HÀNG (Khi logout hoặc đặt hàng xong) ---
    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.setItem('cartItems', JSON.stringify([]));
      state.coupon = null;
      localStorage.removeItem('coupon');
    },
  },
});

export const { addToCart, removeFromCart, clearCartItems, saveShippingAddress, savePaymentMethod, saveCoupon } = cartSlice.actions;

export default cartSlice.reducer;