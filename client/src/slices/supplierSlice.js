import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Action: Lấy toàn bộ danh sách nhà cung cấp (Admin)
export const listSuppliers = createAsyncThunk(
  'suppliers/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/suppliers', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 2. Action: Tạo mới nhà cung cấp (Admin)
export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (supplierData, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      const { data } = await axios.post('/api/suppliers', supplierData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

const supplierSlice = createSlice({
  name: 'supplier',
  initialState: {
    suppliers: [],
    loading: false,
    error: null,
    successCreate: false,
  },
  reducers: {
    supplierReset: (state) => {
      state.successCreate = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- List Suppliers ---
      .addCase(listSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(listSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(listSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create Supplier ---
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.successCreate = true;
        state.suppliers.unshift(action.payload); // Đẩy nhà cung cấp mới lên đầu mảng danh sách
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { supplierReset } = supplierSlice.actions;
export default supplierSlice.reducer;