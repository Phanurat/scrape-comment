// main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  // สร้างหน้าต่าง BrowserWindow
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // สำหรับความปลอดภัย
    },
  });

  // เปิดลิงก์ Facebook
  win.loadURL('https://www.facebook.com/pfbid0KBwCN4x6PP7CcpMv4vfACXPRWZ8CtYzfH2j32ccfxWbuELyj7bJ19RkAqzyddcwbl');
}

// รันเมื่อ Electron พร้อม
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
