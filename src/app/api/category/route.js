import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try{
    const client = await clientPromise;
    const db = client.db("productDB");
    const categories = await db.collection("categories").find().toArray();
    return NextResponse.json({ message: "Categories fetched successfully", categories });
  }catch(error){
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try{
    console.log("POST request received");
    let { name , minCount } = await request.json();
    const client = await clientPromise;
    const db = client.db("productDB");
    const existingCategory = await db.collection("categories").findOne({ name });
    if(existingCategory){
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    if(!name){
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if(!minCount){
        minCount = 1;
    }
    await db.collection("categories").insertOne({ name , minCount });
    return NextResponse.json({ message: "Category created successfully" });
  }catch(error){
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
