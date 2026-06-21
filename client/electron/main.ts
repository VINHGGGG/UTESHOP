import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ipcMain } from 'electron';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Đăng ký cổng tiếp nhận từ giao diện React gửi lên
ipcMain.handle('auto-export-pdf', async (event, customFileName: string) => {
  try {
    // Lấy cửa sổ đang hiển thị giao diện gửi yêu cầu
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) throw new Error("Không tìm thấy cửa sổ ứng dụng.");

    // Định nghĩa thư mục lưu trữ tự động hóa đơn (Ví dụ: D:/Hoadon_POS)
    // Cậu có thể tùy ý sửa đường dẫn này nhé.
    const targetDir = path.join(app.getPath('documents'), 'UTESHOP_Invoices'); 

    // Tự động tạo thư mục nếu máy tính chưa có thư mục này
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Đường dẫn đầy đủ của file PDF hóa đơn sẽ xuất ra
    const filePath = path.join(targetDir, `${customFileName}.pdf`);

    // Thực hiện in ngầm (Silent Print) giao diện trực tiếp ra dữ liệu file PDF
    const data = await window.webContents.printToPDF({
      printBackground: true, // Giữ nguyên màu nền, hình ảnh CSS của hóa đơn
      margins: {
        marginType: 'none' // 'default', 'none', hoặc 'printableArea'
        }
    });

    // Ghi trực tiếp dữ liệu PDF thành file xuống ổ đĩa (Không hiện pop-up hỏi người dùng)
    fs.writeFileSync(filePath, data);

    return { success: true, filePath };
  } catch (error: any) {
    console.error('Lỗi xuất hóa đơn tự động:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow)
