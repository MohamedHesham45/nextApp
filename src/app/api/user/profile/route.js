import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  console.log(userId);
  const client = await clientPromise;
  const db = client.db("userDB");
  const profile = await db.collection("profiles").findOne({ userId: new ObjectId(userId) });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({message:"Profile fetched successfully",profile});
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  const { name, email ,phone,governorate,centerArea,neighborhood} = await request.json();
  const client = await clientPromise;
  const db = client.db("userDB");
  const profile = await db.collection("profiles").updateOne({ userId: userId }, { $set: { name, email,role,phone,governorate,centerArea,neighborhood } });
  return NextResponse.json({ message: "Profile updated successfully", profile });
}
