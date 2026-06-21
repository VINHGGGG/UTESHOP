import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Action: Tạo phiếu nhập hàng mới (Admin)
export const createPurchaseOrder = createAsyncThunk(
  'purchases/create',
  async (purchaseData, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      const { data } = await axios.post('/api/purchases', purchaseData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 2. Action: Lấy danh sách toàn bộ phiếu nhập kho (Admin)
export const listPurchaseOrders = createAsyncThunk(
  'purchases/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/purchases', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 3. Action: Phê duyệt phiếu nhập kho (Từ Pending sang Completed)
export const completePurchaseOrder = createAsyncThunk(
  'purchases/complete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`/api/purchases/${id}/complete`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState: {
    purchases: [],
    loading: false,
    error: null,
    successCreate: false,
    successComplete: false,
  },
  reducers: {
    purchaseReset: (state) => {
      state.successCreate = false;
      state.successComplete = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Create Purchase Order ---
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.loading = false;
        state.successCreate = true;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- List Purchase Orders ---
      .addCase(listPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.purchases = [];
      })
      .addCase(listPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload;
      })
      .addCase(listPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Complete Purchase Order (Duyệt kho) ---
      .addCase(completePurchaseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(completePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successComplete = true;
        // Cập nhật lại trạng thái của phần tử vừa được duyệt trực tiếp trong mảng state để UI đổi màu Badge
        const index = state.purchases.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(completePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { purchaseReset } = purchaseSlice.actions;
export default purchaseSlice.reducer;