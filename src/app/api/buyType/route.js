import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try{
    console.log(req);
    const { name } = await req.json();
    const client = await clientPromise;
    const db = client.db("buyType");
    const existingBuyType = await db.collection("buyType").findOne({ name });
    if (existingBuyType) {
      return NextResponse.json({ message: "الحقل موجود بالفعل" }, { status: 400 });
    }
    const result = await db.collection("buyType").insertOne({ name });
    const buyType = await db.collection("buyType").findOne({ _id: result.insertedId });
    return NextResponse.json({ message: "تم إضافة الحقل بنجاح", buyType });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء إضافة الحقل" }, { status: 500 });
  }
}

export async function GET(req) {
  try{
   
    const client = await clientPromise;
    const db = client.db("buyType");
    
    const buyType = await db.collection("buyType").find().toArray();
    return NextResponse.json(buyType);
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء جلب الحقول" }, { status: 500 });
  }
}