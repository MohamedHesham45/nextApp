import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";


export async function POST(request) {
  const { name, email, password } = await request.json();
  const client = await clientPromise;
  const db = client.db("userDB");
  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.collection("users").insertOne({ name, email, password: hashedPassword ,role:"user"});
  await db.collection("profiles").insertOne({ userId: user.insertedId, name, email,role:"user" ,phone:"",governorate:"",centerArea:"",neighborhood:""});
  return NextResponse.json({ message: "User created successfully" });
}
