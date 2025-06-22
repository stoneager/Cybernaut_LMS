const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generateReceiptPDF = async (adminName, amount, receiverId, paymentId) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const paymentDate = new Date().toLocaleDateString();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .receipt {
        width: 1123px;
        height: 794px;
        border: 10px solid #007BFF;
        padding: 50px;
        box-sizing: border-box;
        font-family: 'Georgia', serif;
        position: relative;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
      }
      .company-name {
        font-size: 36px;
        font-weight: bold;
        color: #007BFF;
      }
      .company-info {
        font-size: 18px;
        color: #555;
      }
      .receipt-title {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 20px;
        color: #007BFF;
        text-decoration: underline;
      }
      .details {
        font-size: 20px;
        color: #222;
        line-height: 2;
        margin-left: 80px;
      }
      .highlight {
        font-weight: bold;
        color: #007BFF;
      }
      .footer {
        position: absolute;
        bottom: 40px;
        font-size: 16px;
        color: #777;
        text-align: center;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <div class="company-name">Cybernaut Corporation</div>
        <div class="company-info">
          1234 Silicon Lane, Tech City, IN - 560001<br>
          Email: support@cybernaut.com | Phone: +91-9876543210
        </div>
      </div>

      <div class="receipt-title">Payment Receipt</div>

      <div class="details">
        <div><span class="highlight">Receiver ID:</span> ${receiverId}</div>
        <div><span class="highlight">Name:</span> ${adminName}</div>
        <div><span class="highlight">Payment ID:</span> ${paymentId}</div>
        <div><span class="highlight">Payment Date:</span> ${paymentDate}</div>
        <div><span class="highlight">Amount Paid:</span> ₹${(amount / 100).toFixed(2)}</div>
        <div><span class="highlight">Payment Method:</span> UPI</div>
      </div>

      <div class="footer">
        © 2025 Cybernaut Corporation. All Rights Reserved.
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const fileName = `${Date.now()}-${adminName.replace(/\s+/g, '-')}.pdf`;
  const filePath = path.join(__dirname, `../receipts/${fileName}`);

  await page.pdf({ path: filePath, format: 'A4' });

  await browser.close();
  return filePath;
};

module.exports = generateReceiptPDF;
