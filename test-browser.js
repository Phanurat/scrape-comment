// main.js
require('dotenv').config();
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 375,  // ความกว้าง typical ของมือถือ
    height: 667, // ความสูง typical ของมือถือ
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const fbUrl = 'https://mbasic.facebook.com/61569070632117/posts/pfbid0KBwCN4x6PP7CcpMv4vfACXPRWZ8CtYzfH2j32ccfxWbuELyj7bJ19RkAqzyddcwbl';
  // ตั้ง user agent ให้เหมือนมือถือ
  win.webContents.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  );

  win.loadURL(fbUrl);

  // เปิด DevTools (optional)
  // win.webContents.openDevTools();

  win.webContents.on('did-finish-load', async () => {
    console.log('Page loaded in mobile view.');

    try {
      // รอจนหน้าโหลดครบ
      await win.webContents.executeJavaScript(`
        new Promise(resolve => {
          if (document.readyState === 'complete') resolve();
          else window.addEventListener('load', () => resolve());
        });
      `);

      const html = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
    //   const filePath = path.join(__dirname, 'facebook_page_mobile.html');
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`HTML saved to ${filePath}`);
    } catch (err) {
      console.error('Error saving HTML:', err);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
