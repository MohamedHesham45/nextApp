// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import nodemailer from "nodemailer";

// export async function POST(request) {
//     const { name, email, message } = await request.json();

//     // Create a Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail', // or any other email service
//         auth: {
//             user: process.env.EMAIL_USER, // your email
//             pass: process.env.EMAIL_PASS, // your email password
//         },
//     });

//     // Set up email data
//     const mailOptions = {
//         from: email,
//         to: process.env.EMAIL_USER, // your email
//         subject: `Contact Us Form Submission from ${name}`,
//         text: message,
//     };

//     // Send email
//     try {
//         await transporter.sendMail(mailOptions);
//         return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
//     }
// }