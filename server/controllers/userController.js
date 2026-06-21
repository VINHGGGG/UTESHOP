import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto' // Có sẵn trong Node.js, không cần cài
import sendEmail from '../utils/sendEmail.js'

// --- TIỆN ÍCH: Hàm tạo Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token (Đăng nhập)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401)
      throw new Error('Tài khoản chưa được xác thực. Vui lòng kiểm tra email!')
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không đúng');
  }
});

// @desc    Register a new user (Đăng ký)
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  // Tạo token ngẫu nhiên
  const verificationToken = crypto.randomBytes(20).toString('hex')

  const user = await User.create({
    name,
    email,
    password,
    verificationToken, 
    isVerified: false // Quan trọng
  })

  if (user) {
    // Tạo link xác thực
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
    // Lưu ý: Nếu deploy web thật thì đổi host thành domain frontend (ví dụ localhost:3000)

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #333;">Chào mừng bạn đến với UTEShop!</h2>
    <p>Vui lòng click vào nút bên dưới để xác thực tài khoản của bạn:</p>
    <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
      Xác thực tài khoản
    </a>
  </div>
    `

    try {
      await sendEmail({
        email: user.email,
        subject: 'Xác thực tài khoản UTEShop',
        message,
      })

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
      })
    } catch (error) {
      // Nếu gửi mail lỗi thì xóa user vừa tạo để họ đăng ký lại
      console.error("LỖI GỐC ĐÂY NÈ CẬU ơi:", error);
      await User.findByIdAndDelete(user._id)
      res.status(500)
      throw new Error('Không thể gửi email, vui lòng thử lại.')
    }
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const verifyUser = asyncHandler(async (req, res) => {
  const token = req.params.token
  
  // Tìm user có token đó
  const user = await User.findOne({ verificationToken: token })

  if (!user) {
    // Nếu token sai, trả về giao diện lỗi
    return res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
          <h1 style="color: red;">Xác thực thất bại! ❌</h1>
          <p style="font-size: 18px;">Token không hợp lệ hoặc đã hết hạn.</p>
      </div>
    `);
  }

  user.isVerified = true
  user.verificationToken = undefined // Xóa token đi
  await user.save()

  // Trả về giao diện thành công
  res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
          <h1 style="color: green;">Xác thực tài khoản thành công! 🎉</h1>
          <p style="font-size: 18px;">Tài khoản của bạn đã được kích hoạt.</p>
          <p style="color: #555;">Vui lòng đóng tab trình duyệt này và quay lại phần mềm POS để đăng nhập.</p>
      </div>
  `);
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('Không tìm thấy người dùng với email này')
  }

  // Tạo token ngẫu nhiên
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash token để lưu vào DB (Bảo mật)
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  
  // Token hết hạn sau 10 phút
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  await user.save()

  // Tạo link reset (Gửi token chưa hash qua email)
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`

  const message = `
    <h1>Bạn đã yêu cầu đặt lại mật khẩu</h1>
    <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu mới:</p>
    <a href="http://localhost:3000/reset-password/${resetToken}" clicktracking=off>${resetUrl}</a>
    <p>Link này sẽ hết hạn sau 10 phút.</p>
  `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu UTEShop',
      message,
    })

    res.status(200).json({ success: true, data: 'Email đã được gửi!' })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    res.status(500)
    throw new Error('Không thể gửi email')
  }
})

// 2. Đặt lại mật khẩu mới
const resetPassword = asyncHandler(async (req, res) => {
  // Lấy token từ URL, hash nó ra để so sánh với cái trong DB
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Kiểm tra xem còn hạn không
  })

  if (!user) {
    res.status(400)
    throw new Error('Token không hợp lệ hoặc đã hết hạn')
  }

  // Đặt pass mới
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  res.status(201).json({ success: true, message: 'Mật khẩu đã được cập nhật thành công!' })
})

// @desc    Get user profile (Lấy thông tin cá nhân)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user được lấy từ middleware 'protect'
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile (Cập nhật thông tin cá nhân)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Nếu có gửi tên mới thì lấy, không thì giữ nguyên tên cũ
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Nếu có gửi password mới thì cập nhật
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users (Lấy danh sách tất cả user - Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Xóa user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await User.deleteOne({ _id: user._id }) // Mongoose mới dùng deleteOne
    res.json({ message: 'Đã xóa người dùng' })
  } else {
    res.status(404)
    throw new Error('Không tìm thấy người dùng')
  }
})

// @desc    Lấy chi tiết user (để Admin sửa)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  // Không trả về password
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('Không tìm thấy người dùng')
  }
})

// @desc    Cập nhật user (Admin thực hiện)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    // Cập nhật quyền Admin
    // Lưu ý: check kỹ kiểu boolean
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('Không tìm thấy người dùng')
  }
})

// --- XUẤT CÁC HÀM RA NGOÀI ---
export { 
    authUser, 
    registerUser,
    verifyUser, 
    getUserProfile, 
    updateUserProfile, 
    getUsers,
    deleteUser,   // <--- Mới
    getUserById,  // <--- Mới
    updateUser,
    forgotPassword, 
    resetPassword
};