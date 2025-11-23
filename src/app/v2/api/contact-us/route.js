import { NextResponse } from "next/server";

import { sendEmail } from "../nodemailer/service";

export async function POST(request) {
    const { name, email, message } = await request.json();


    // Send email
    try {
        await sendEmail(email, `Contact Us Form Submission from ${name}`, message,name,'contact-us');
        return NextResponse.json({ message: 'تم إرسال الرسالة بنجاح' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'حدث خطأ أثناء إرسال الرسالة' }, { status: 500 });
    }
}