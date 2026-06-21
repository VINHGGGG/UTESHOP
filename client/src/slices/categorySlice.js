import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Lấy danh sách
export const listCategories = createAsyncThunk('category/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/api/categories');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data.message || error.message);
  }
});

// 2. Tạo mới
export const createCategory = createAsyncThunk('category/create', async (name, { getState, rejectWithValue }) => {
  try {
    const { user: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.post('/api/categories', { name }, config);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data.message || error.message);
  }
});

// 3. Xóa
export const deleteCategory = createAsyncThunk('category/delete', async (id, { getState, rejectWithValue }) => {
  try {
    const { user: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    await axios.delete(`/api/categories/${id}`, config);
    return id; // Trả về ID để filter xóa khỏi state
  } catch (error) {
    return rejectWithValue(error.response?.data.message || error.message);
  }
});

const categorySlice = createSlice({
  name: 'category',
  initialState: { categories: [], loading: false, error: null, successCreate: false },
  reducers: {
    resetCategoryStatus: (state) => { state.successCreate = false; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(listCategories.pending, (state) => { state.loading = true; })
      .addCase(listCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.successCreate = true;
        state.categories.push(action.payload); // Thêm luôn vào list đỡ phải load lại
      })
      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((x) => x._id !== action.payload);
      });
  },
});

export const { resetCategoryStatus } = categorySlice.actions;
export default categorySlice.reducer;