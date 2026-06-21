import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Action: Lấy danh sách sản phẩm (Public)
export const listProducts = createAsyncThunk(
  'products/list',
  async (keyword = '', { rejectWithValue }) => { // 👈 Nhận keyword vào (mặc định là rỗng)
    try {
      // 👇 QUAN TRỌNG: Phải nối keyword vào URL
      const { data } = await axios.get(`/api/products?keyword=${keyword}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 2. Action: Lấy chi tiết 1 sản phẩm (Dùng cho trang Edit) -> MỚI
export const listProductDetails = createAsyncThunk(
  'products/details',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 3. Action: Xóa sản phẩm (Admin)
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/products/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 4. Action: Tạo sản phẩm mẫu (Admin) -> MỚI
export const createProduct = createAsyncThunk(
  'products/create',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Gửi post request rỗng để tạo sample data
      const { data } = await axios.post(`/api/products`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 5. Action: Cập nhật sản phẩm (Admin) -> MỚI
export const updateProduct = createAsyncThunk(
  'products/update',
  async (product, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      // product._id lấy từ object truyền vào
      const { data } = await axios.put(`/api/products/${product._id}`, product, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// --- SLICE ---
const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    product: {}, // Lưu chi tiết 1 sản phẩm
    loading: false,
    error: null,
    successDelete: false,
    successCreate: false, // Cờ báo tạo thành công
    successUpdate: false, // Cờ báo sửa thành công
  },
  reducers: {
    // Reset các trạng thái
    productReset: (state) => {
      state.successDelete = false;
      state.successCreate = false;
      state.successUpdate = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- List Products ---
      .addCase(listProducts.pending, (state) => {
        state.loading = true;
        state.products = [];
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Product Details (Mới) ---
      .addCase(listProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(listProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(listProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Delete Product ---
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successDelete = true;
        state.products = state.products.filter((x) => x._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create Product (Mới) ---
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successCreate = true;
        state.product = action.payload; // Sản phẩm vừa tạo
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Update Product (Mới) ---
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successUpdate = true;
        state.product = action.payload; // Sản phẩm vừa update
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { productReset } = productSlice.actions; // Dùng 1 hàm reset chung cho gọn
export default productSlice.reducer;