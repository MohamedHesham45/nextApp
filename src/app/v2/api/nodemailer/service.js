import generateContactUsEmailTemplate from "./contact-us-html";
import nodemailer from "nodemailer";
import generateOrderEmailSitaraMallTemplate from "./sitaraMallOrder.";
import generateOrderEmailUserTemplate from "./userOrder-html";
import generateOrderStatusChangeEmailUserTemplate from "./userOrderChangeStatuse-html";
import generateOrderUpdateEmailSitaraMallTemplate from "./sitaraMallOrderUpdate";
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

export async function sendEmail(email, subject, message,name,type) {
    const mailOptions = {
        to: process.env.EMAIL_USER,
        subject: subject,
        html: generateContactUsEmailTemplate(name, email, message),
    };
    await transporter.sendMail(mailOptions);
}

export async function sendOrderEmail(email, subject, orderData) {
    const mailOptionsSitaraMall = {
        to: process.env.EMAIL_USER,
        subject: "تقديم طلب جديد",
        html: generateOrderEmailSitaraMallTemplate(orderData),
    };
    if(email){
        const mailOptionsUser = {
            to: email, 
            subject: subject,
            html: generateOrderEmailUserTemplate(orderData),
        };
        await transporter.sendMail(mailOptionsUser);
    }
    await transporter.sendMail(mailOptionsSitaraMall);
}
export async function sendOrderUpdateEmail(email, subject, orderData) {
    const mailOptionsSitaraMall = {
        to: process.env.EMAIL_USER,
        subject: "تعديل طلب رقم "+orderData._id,
        html: generateOrderUpdateEmailSitaraMallTemplate(orderData),
    };
    if(email){
        const mailOptionsUser = {
            to: email, 
            subject: subject,
            html: generateOrderEmailUserTemplate(orderData),
        };
        await transporter.sendMail(mailOptionsUser);
    }
    await transporter.sendMail(mailOptionsSitaraMall);
}


export async function sendOrderStatusChangeEmail(email, subject, orderData) {
    const mailOptionsUser = {
        to: email, 
        subject: subject,
        html: generateOrderStatusChangeEmailUserTemplate(orderData),
    };
    await transporter.sendMail(mailOptionsUser);
}