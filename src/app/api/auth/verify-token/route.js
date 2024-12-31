import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
export async function POST(request) {
    const { token } = await request.json();
    if (!token) {
        return NextResponse.json({ message: "JWT must be provided" }, { status: 400 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if(payload.exp < Date.now() / 1000) {
        return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (!payload) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db("userDB");
    const profile = await db.collection("profiles").findOne({ userId: new ObjectId(payload.userId) });
    return NextResponse.json( profile );
}