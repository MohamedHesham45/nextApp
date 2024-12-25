import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request) {
  const { email, password } = await request.json();
  const client = await clientPromise;
  const db = client.db("userDB");
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const profile = await db.collection("profiles").findOne({ userId: user._id });
  return NextResponse.json({ message: "Login successful", token, profile });
}
