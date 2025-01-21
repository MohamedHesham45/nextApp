function generateOrderEmailSitaraMallTemplate(orderData) {
    const { customerDetails, orderItems, orderDate, status,totalPrice } = orderData;
    const statusText = status === "Pending" ? "قيد التنفيذ" : status === "Delivered" ? "تم التوصيل" : status === "Shipped" ? "تم الشحن" : status === "Processing" ? "قيد المعالجة" : status === "Cancelled" ? "ملغي" : "منتهي";
    const itemsHtml = orderItems.map(item => `
        <tr>
            <td>
                <img src="${"https://sitaramall.com/"+item.selectedImages[0]}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
            </td>
            <td>${item.title}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تفاصيل الطلب الجديد</title>
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
                .content p, .content table {
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
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background-color: #f2f2f2;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>تقديم طلب جديد</h1>
                </div>
                <div class="content">
                    <p><strong>الاسم:</strong> ${customerDetails.name}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${customerDetails.email||"لا يوجد"}</p>
                    <p><strong>الهاتف:</strong> ${customerDetails.phone||"لا يوجد"}</p>
                    <p><strong>المحافظة:</strong> ${customerDetails.governorate||"لا يوجد"}</p>
                    ${(() => {
                        const addressParts = customerDetails.centerArea ? customerDetails.centerArea.split('،') : ['', '', '', ''];
                        return `
                            <p><strong>المنطقة:</strong> ${addressParts[0] || "لا يوجد"}</p>
                            <p><strong>الشارع:</strong> ${addressParts[1] || "لا يوجد"}</p>
                            <p><strong>العمارة:</strong> ${addressParts[2] || "لا يوجد"}</p>
                            <p><strong>الشقة:</strong> ${addressParts[3] || "لا يوجد"}</p>
                        `;
                    })()}
                    <p><strong>الحي:</strong> ${customerDetails.neighborhood||"لا يوجد"}</p>
                    <p><strong>الطريقة المفضلة للتواصل:</strong> ${customerDetails.preferredContactMethod||"لا يوجد"}</p>
                    <p><strong>طريقة الدفع:</strong> ${customerDetails.buyType||"لا يوجد"}</p>
                    <p><strong>نوع التوصيل:</strong> ${customerDetails.shippingType||"لا يوجد"}</p>
                    <p><strong>تعلمات التسليم:</strong> ${customerDetails.deliveryInstructions||"لا يوجد"}</p>
                    <p><strong>رساله اضافيه:</strong> ${customerDetails.additionalMessage||"لا يوجد"}</p>
                    <p><strong>التاريخ:</strong> ${new Date(orderDate).toLocaleDateString('ar-EG')}</p>
                    <p><strong>الحالة:</strong> ${statusText}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>صورة</th>
                                <th>اسم المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <p><strong>السعر الإجمالي:</strong> ${totalPrice.toFixed(2)}</p>
                </div>
                <div class="footer">
                    <p>التاريخ: <span style="color: #ff9900;">${new Date().toLocaleDateString('ar-EG')}</span></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export default generateOrderEmailSitaraMallTemplate;