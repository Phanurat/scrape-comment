require('dotenv').config();
const puppeteer = require('puppeteer');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

// --- Electron GUI ---
app.whenReady().then(() => {
    createWindow();
});

// --- IPC รับค่าจาก GUI ---
ipcMain.handle('scrape-facebook', async (event, { url }) => {
    if (!url) return { success: false, msg: "กรุณากรอก URL" };

    // เปิด Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // ตั้ง user agent ให้เหมือนมือถือ
    await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
        'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );

    // โหลด cookies จาก .env
    const cookies = [
        { name: "c_user", value: process.env.C_USER, domain: ".facebook.com", path: "/" },
        { name: "xs", value: process.env.XS, domain: ".facebook.com", path: "/" },
        { name: "datr", value: process.env.DATR, domain: ".facebook.com", path: "/" },
        { name: "sb", value: process.env.SB, domain: ".facebook.com", path: "/" },
        { name: "fr", value: process.env.FR, domain: ".facebook.com", path: "/" }
    ];
    await page.setCookie(...cookies);

    // ไปที่โพสต์
    await page.goto(url, { waitUntil: 'networkidle2' });

    // รอค้างไว้บนหน้า
    console.log('Facebook page loaded. Browser will stay open.');

    // ไม่ปิด browser → ให้ user interact เอง
    return { success: true, msg: "Facebook page loaded, browser stays open" };
});
