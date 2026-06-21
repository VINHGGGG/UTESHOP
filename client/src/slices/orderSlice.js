import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Action: TẠO ĐƠN HÀNG MỚI (Dùng cho nút "Đặt hàng")
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (order, { getState, rejectWithValue }) => {
    try {
      // Lấy token của user đang đăng nhập
      const { user: { userInfo } } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`, // Gửi kèm Token để Backend biết ai đặt
        },
      };

      // Gửi POST request kèm data đơn hàng
      const { data } = await axios.post('/api/orders', order, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 2. Action: LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI (Dùng cho trang Profile)
export const listMyOrders = createAsyncThunk(
  'order/listMyOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/orders/myorders', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

export const listOrders = createAsyncThunk(
  'order/listOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);
// 1. Action: LẤY CHI TIẾT ĐƠN HÀNG
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/orders/${id}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);
// 2. Action: UPDATE ĐÃ GIAO HÀNG (Admin)
export const deliverOrder = createAsyncThunk(
  'order/deliverOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Gọi PUT request
      const { data } = await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(`/api/orders/${id}`, config);
      return id; // Trả về ID để reducer biết đơn nào đã xóa
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  'order/getDashboardStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/dashboard-stats', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 🌟 Action: XỬ LÝ TRẢ HÀNG & HOÀN KHO TRÊN MÁY POS
export const returnOrder = createAsyncThunk(
  'order/returnOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Gọi PUT request sang endpoint backend tụi mình vừa viết
      const { data } = await axios.put(`/api/orders/${orderId}/return`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],      // Danh sách đơn hàng (Profile)
    loading: false,
    success: false,  // Cờ báo hiệu tạo đơn thành công
    order: null,     // Lưu thông tin đơn hàng vừa tạo
    error: null,
    loadingDeliver: false, // Loading cho nút giao hàng
    successDeliver: false, // Thành công khi giao hàng
    stats: null,
    loadingReturn: false,
    successReturn: false,
  },
  reducers: {
    orderCreateReset: (state) => { state.success = false; state.order = null; },
    orderReset: (state) => { state.orders = []; state.error = null; },
    // 👇 Reset trạng thái giao hàng để không bị loop
    orderDeliverReset: (state) => { state.successDeliver = false; state.loadingDeliver = false; },
    orderReturnReset: (state) => { state.successReturn = false; state.loadingReturn = false; }
  },
  extraReducers: (builder) => {
    builder
      // --- Xử lý CREATE ORDER ---
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true; // Báo hiệu đã tạo xong
        state.order = action.payload; // Lưu đơn hàng vừa tạo
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Xử lý LIST MY ORDERS ---
      .addCase(listMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(listMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(listOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Xử lý DELIVER ORDER ---
      .addCase(deliverOrder.pending, (state) => {
        state.loadingDeliver = true;
      })
      .addCase(deliverOrder.fulfilled, (state) => {
        state.loadingDeliver = false;
        state.successDeliver = true;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loadingDeliver = false;
        state.error = action.payload;
      })
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loadingDelete = true;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.loadingDelete = false;
        state.successDelete = true;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loadingDelete = false;
        state.errorDelete = action.payload;
      })
      .addCase(returnOrder.pending, (state) => {
        state.loadingReturn = true;
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.loadingReturn = false;
        state.successReturn = true;
        // Cập nhật lại thông tin object đơn hàng hiện tại sang trạng thái mới (isReturned = true)
        state.order = action.payload.updatedOrder; 
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.loadingReturn = false;
        state.error = action.payload;
        });
  },
});

export const { orderCreateReset, orderReset, orderDeliverReset, orderReturnReset } = orderSlice.actions;
export default orderSlice.reducer;