require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

// --- Arrow function สำหรับสร้างหน้าต่าง ---
const createWindow = () => {
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
};

// --- Electron GUI ---
app.whenReady().then(() => {
    createWindow();
});

// --- IPC รับค่าจาก GUI ---
ipcMain.handle('scrape-facebook', async (event, { url, scrollTimes }) => {
    if (!url) return { success: false, msg: "กรุณากรอก URL" };

    // เปิด Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // โหลด cookies จาก .env
    const cookies = [
        { name: "c_user", value: process.env.C_USER, domain: ".facebook.com" },
        { name: "xs", value: process.env.XS, domain: ".facebook.com" },
        { name: "datr", value: process.env.DATR, domain: ".facebook.com" },
        { name: "sb", value: process.env.SB, domain: ".facebook.com" },
        { name: "fr", value: process.env.FR, domain: ".facebook.com" }
    ];
    await page.setCookie(...cookies);

    // ไปที่โพสต์
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scroll
    for (let i = 0; i < scrollTimes; i++) {
        const previousHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));
        const newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === previousHeight) break;
    }

    // เอา HTML
    const html = await page.content();
    fs.writeFileSync('facebook_post.html', html, 'utf-8');

    // --- parse ด้วย Cheerio ---
    const $ = cheerio.load(html);
    const comments = [];

    $('div.xwib8y2.xpdmqnj.x1g0dm76.x1y1aw1k').each((i, el) => {
        const $el = $(el);
        const nameEl = $el.find('span, a').first();
        const name = nameEl.text().trim() || 'Unknown';

        let uid = null;
        let commentId = null;

        const aEl = $el.find('a[href*="profile.php"]').first();
        if (aEl.length > 0) {
            const href = aEl.attr('href');
            const uidMatch = href.match(/profile\.php\?id=(\d+)/);
            if (uidMatch) uid = uidMatch[1];

            const commentMatch = href.match(/comment_id=([a-zA-Z0-9_%]+)/);
            if (commentMatch) commentId = decodeURIComponent(commentMatch[1]);
        }

        const textSet = new Set();
        $el.find('span, div').each((j, child) => {
            const text = $(child).text().trim();
            if (text && text !== name) textSet.add(text);
        });

        const comment = Array.from(textSet).join(' ');
        if (comment.length > 0 || name !== 'Unknown') {
            comments.push({ name, uid, commentId, comment });
        }
    });

    await browser.close();

    return { success: true, msg: `เซฟ HTML และ scrape คอมเมนต์เรียบร้อย (${comments.length} คอมเมนต์)`, comments };
});
