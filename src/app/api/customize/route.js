import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
export async function POST(req) {
  try{
    const { name, value } = await req.json();
    const client = await clientPromise;
    const db = client.db("customize");
    const existingCustomize = await db.collection("additionalFields").findOne({ name });
    if (existingCustomize) {
      return NextResponse.json({ error: "Customize already exists" }, { status: 400 });
    }
    const result = await db.collection("additionalFields").insertOne({ name, value });
    const customize = await db.collection("additionalFields").findOne({ _id: result.insertedId });

    return NextResponse.json({ message: "Customize added successfully", customize });
  }catch(error){
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try{
    const searchParams = new URL(req.url).searchParams;
    const name = searchParams.get("name");
    const client = await clientPromise;
    const db = client.db("customize");
    let query = {};
    if (name) {
      query.name = name;
    }
    const customize = await db.collection("additionalFields").find(query).toArray();
    return NextResponse.json(customize);
}catch(error){
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
