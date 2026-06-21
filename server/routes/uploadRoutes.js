import path from 'path'
import express from 'express'
import multer from 'multer'

const router = express.Router()

// 1. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/') // Lưu vào thư mục 'uploads' ở root
  },
  filename(req, file, cb) {
    // Đổi tên file: tên-gốc + ngày-giờ + đuôi-file (tránh trùng tên)
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

// 2. Hàm kiểm tra đuôi file (chỉ cho phép ảnh jpg, jpeg, png)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Images only!') // Báo lỗi nếu không phải ảnh
  }
}

// 3. Khởi tạo Multer
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
})

// 4. Route upload (POST /api/upload)
router.post('/', upload.single('image'), (req, res) => {
  // Trả về đường dẫn file để Frontend lưu vào ô input
  res.send(`/${req.file.path.replace(/\\/g, '/')}`) 
})

export default router