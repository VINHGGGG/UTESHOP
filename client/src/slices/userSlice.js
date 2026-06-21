import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Action: ĐĂNG NHẬP
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users/login', { email, password }, config);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 2. Action: ĐĂNG KÝ
export const register = createAsyncThunk(
  'user/register',
  async ({ name, email, password }, { dispatch, rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users', { name, email, password }, config);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      dispatch(login.fulfilled(data)); 
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 3. Lấy danh sách Users
export const listUsers = createAsyncThunk(
  'user/listUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/users', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 4. Xóa User
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/users/${id}`, config);
      return id; 
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 5. Update User (Admin sửa quyền/tên)
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      const { data } = await axios.put(`/api/users/${user._id}`, user, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 6. Get User Details
export const getUserDetails = createAsyncThunk(
  'user/getUserDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.get(`/api/users/${id}`, config);
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// 7. Cập nhật Profile cá nhân (User tự sửa)
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (user, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      // Gửi PUT request lên /api/users/profile
      const { data } = await axios.put('/api/users/profile', user, config);
      
      // Cập nhật lại LocalStorage với thông tin mới
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

// --- SLICE ---
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: userInfoFromStorage,
    loading: false,
    error: null,
    users: [], 
    userDetails: {}, 
    successDelete: false, 
    successUpdate: false, 
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.users = []; 
    },
    userReset: (state) => { 
      state.successDelete = false;
      state.successUpdate = false;
      state.userDetails = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // List Users
      .addCase(listUsers.pending, (state) => { state.loading = true; })
      .addCase(listUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(listUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.successDelete = true;
        state.users = state.users.filter((x) => x._id !== action.payload);
      })

      // Update User
      .addCase(updateUser.pending, (state) => { state.loading = true; })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successUpdate = true;
        state.userDetails = action.payload; 
      })
      .addCase(updateUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Get Details
      .addCase(getUserDetails.pending, (state) => { state.loading = true; })
      .addCase(getUserDetails.fulfilled, (state, action) => { state.loading = false; state.userDetails = action.payload; })
      .addCase(getUserDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // --- UPDATE PROFILE ---
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successUpdate = true; // Cờ báo thành công
        state.userInfo = action.payload; // Cập nhật luôn thông tin đăng nhập
        state.userDetails = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// --- FIX Ở DÒNG DƯỚI NÀY NÈ ---
export const { logout, userReset } = userSlice.actions; // Nhớ export cả 2 nha
export default userSlice.reducer;