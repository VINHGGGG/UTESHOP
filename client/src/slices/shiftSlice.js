import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🌟 Hàm tiện ích để lấy Token từ localStorage giống các Slice khác của cậu
const getAuthConfig = () => {
  // Cậu check xem dự án của cậu lưu thông tin user trong localStorage là gì nha
  // Thông thường là 'userInfo' hoặc 'userLogin'. Ở đây tớ check bẫy cả 2 luôn:
  const localData = localStorage.getItem('userInfo') || localStorage.getItem('userLogin');
  if (localData) {
    const parsed = JSON.parse(localData);
    const token = parsed.token || parsed.userInfo?.token;
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return {};
};

// 🌟 1. Lấy thông tin ca trực hiện tại
export const getCurrentShift = createAsyncThunk(
  'shift/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const { data } = await axios.get('/api/shifts/current', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🌟 2. Mở ca trực mới
export const openShift = createAsyncThunk(
  'shift/open',
  async (startAmount, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const { data } = await axios.post('/api/shifts/open', { startAmount }, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🌟 3. Chốt ca / Đóng ca trực
export const closeShift = createAsyncThunk(
  'shift/close',
  async ({ endAmountReal, note }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const { data } = await axios.put('/api/shifts/close', { endAmountReal, note }, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const shiftSlice = createSlice({
  name: 'shift',
  initialState: { currentShift: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getCurrentShift
      .addCase(getCurrentShift.pending, (state) => { state.loading = true; })
      .addCase(getCurrentShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(getCurrentShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentShift = null; // Nếu lỗi (ví dụ chưa mở ca), ép về null
      })
      // openShift
      .addCase(openShift.pending, (state) => { state.loading = true; })
      .addCase(openShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(openShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // closeShift
      .addCase(closeShift.fulfilled, (state) => {
        state.currentShift = null; // Đóng xong ca thì xóa ca hiện tại về null
      });
  },
});

export default shiftSlice.reducer;