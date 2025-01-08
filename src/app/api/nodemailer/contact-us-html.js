function generateContactUsEmailTemplate(name, email, message) {
  return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>رسالة اتصل بنا</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f8f8;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    border: 1px solid #232f3e;
                    border-radius: 20px;
                    overflow: hidden;
                    background-color: #fff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #232f3e;
                    padding: 20px;
                    text-align: center;
                    color: #fff;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    background-color: #eeeeee;
                }
                .content p {
                    margin: 10px 0;
                    line-height: 1.6;
                    color: #333;
                    text-align: right;
                }
                .footer {
                    background-color: #232f3e;
                    padding: 10px;
                    text-align: center;
                    color: #fff;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>رسالة اتصل بنا</h1>
                </div>
                <div class="content">
                    <p> <span style="color: #ff9900;">${name}</span><strong>:الاسم</strong></p>
                    <p><span style="color: #ff9900;">${email}</span><strong>:البريد الإلكتروني</strong></p>
                    <p><strong>:الرسالة</strong></p>
                    <p style="color: #ff9900;">${message}</p>
                </div>
                <div class="footer">
                    <p>التاريخ: <span style="color: #ff9900;">${new Date().toLocaleDateString('ar-EG')}</span></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = generateContactUsEmailTemplate;
