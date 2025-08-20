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
    return NextResponse.json({ message: "حدث خطأ أثناء جلب الفئات" }, { status: 500 });
  }
}

export async function POST(request) {
  try{
    let { name , minCount } = await request.json();
    const client = await clientPromise;
    const db = client.db("productDB");
    const existingCategory = await db.collection("categories").findOne({ name });
    if(existingCategory){
      return NextResponse.json({ message: "الفئة موجودة بالفعل" }, { status: 400 });
    }
    if(!name){
      return NextResponse.json({ message: "العنوان مطلوب" }, { status: 400 });
    }
    if(!minCount){
        minCount = 1;
    }
    const result = await db.collection("categories").insertOne({ name , minCount });
    const newCategory = {
      _id: result.insertedId, // MongoDB ObjectId
      name,
      minCount,
    };
    return NextResponse.json(newCategory, { status: 200 });
    // return NextResponse.json({ message: "Category created successfully" });
  }catch(error){
    console.error("Error creating category:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إضافة الفئة" }, { status: 500 });
  }
}
