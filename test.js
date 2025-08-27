// main.js
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const fbUrl = 'https://www.facebook.com/pfbid0KBwCN4x6PP7CcpMv4vfACXPRWZ8CtYzfH2j32ccfxWbuELyj7bJ19RkAqzyddcwbl';
  win.loadURL(fbUrl);

  win.webContents.on('did-finish-load', async () => {
    console.log('Page loaded.');

    // กำหนดเวลา delay เป็นมิลลิวินาที (เช่น 5000 = 5 วินาที)
    const delay = 5000;

    console.log(`Waiting ${delay / 1000} seconds before saving HTML...`);
    setTimeout(async () => {
      try {
        const html = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
        const filePath = path.join(__dirname, 'facebook_page.html');
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`HTML saved to ${filePath}`);
      } catch (err) {
        console.error('Error saving HTML:', err);
      }
    }, delay);
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
