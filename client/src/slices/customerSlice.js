import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Thunk tìm kiếm khách hàng bằng SĐT
export const searchCustomerByPhone = createAsyncThunk(
  'customer/searchByPhone',
  async (phone, { rejectWithValue, getState }) => {
    try {
      // Lấy token từ userInfo (để qua cửa middleware protect của backend)
      const { user: { userInfo } } = getState(); 
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/customers/search?phone=${phone}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// 2. Thunk tạo mới khách hàng thành viên tại quầy
export const createCustomer = createAsyncThunk(
  'customer/create',
  async ({ name, phone }, { rejectWithValue, getState }) => {
    try {
      const { user: { userInfo } } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/customers', { name, phone }, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// 3. Khởi tạo Slice
const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    customerInfo: null, // Lưu thông tin khách hàng tìm thấy ở đây
    loading: false,
    error: null,
    createSuccess: false, // Trạng thái tạo mới thành công
  },
  reducers: {
    clearCustomer: (state) => {
      state.customerInfo = null;
      state.error = null;
      state.createSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý Search Customer
      .addCase(searchCustomerByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCustomerByPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInfo = action.payload;
      })
      .addCase(searchCustomerByPhone.rejected, (state, action) => {
        state.loading = false;
        state.customerInfo = null;
        state.error = action.payload;
      })
      // Xử lý Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInfo = action.payload; // Tạo xong thì tự động chọn luôn khách đó
        state.createSuccess = true;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      });
  },
});

export const { clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;