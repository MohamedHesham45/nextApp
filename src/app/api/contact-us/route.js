import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
    const { name, email, message } = await request.json();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        to: email, 
        subject: `Contact Us Form Submission from ${name}`,
        text: message,
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'تم إرسال الرسالة بنجاح' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'حدث خطأ أثناء إرسال الرسالة' }, { status: 500 });
    }
}