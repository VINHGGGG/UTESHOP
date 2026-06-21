import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Lấy danh sách Coupon
export const listCoupons = createAsyncThunk(
  'coupons/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const { data } = await axios.get('/api/coupons', config);
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

// 2. Tạo Coupon mới
export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (couponData, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const { data } = await axios.post('/api/coupons', couponData, config);
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

// 3. Xóa Coupon
export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      await axios.delete(`/api/coupons/${id}`, config);
      return id; // Trả về ID để filter xóa khỏi state
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    coupons: [],
    loading: false,
    error: null,
    successCreate: false, // Để báo hiệu tạo xong thì reset form
  },
  reducers: {
    // Reset trạng thái tạo thành công (để tạo tiếp mã khác không bị lỗi)
    couponCreateReset: (state) => {
      state.successCreate = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(listCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(listCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(listCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.successCreate = true;
        state.coupons.push(action.payload); // Thêm ngay vào list đỡ phải load lại
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        // Lọc bỏ mã vừa xóa khỏi danh sách hiện tại
        state.coupons = state.coupons.filter((x) => x._id !== action.payload);
      });
  },
});

export const { couponCreateReset } = couponSlice.actions;
export default couponSlice.reducer;