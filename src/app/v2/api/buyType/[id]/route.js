import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(req, { params }) {
  try{
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("buyType");
    const buyType = await db.collection("buyType").findOne({ _id: new ObjectId(id) });
    if(!buyType){
      return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ buyType });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء جلب الحقل" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try{
    const { id } = params;
    const update = await req.json();
    const client = await clientPromise;
    const db = client.db("buyType");
    delete update._id;
    const buyType = await db.collection("buyType").updateOne({ _id: new ObjectId(id) }, { $set: update });
    if(buyType.modifiedCount===0){
      return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
    }
    const updatedBuyType = await db.collection("buyType").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ buyType: updatedBuyType });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث الحقل" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try{
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("buyType");
    const buyType = await db.collection("buyType").deleteOne({ _id: new ObjectId(id) });
    if(buyType.deletedCount===0){
      return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ message: "تم حذف الحقل بنجاح" });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء حذف الحقل" }, { status: 500 });
  }
}