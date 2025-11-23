import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const client = await clientPromise;
    const db = client.db("userDB");
    let query = {};
    if (role) {
      query.role = role;
    }
    query = { $and: [{ role: { $exists: true } }, { role: { $ne: "super-admin" } }] };
    const profiles = await db.collection("profiles").find(query).toArray();
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Profile fetched successfully", profiles });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
