import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(req, { params }) {
  try{
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("customize");
    const customize = await db.collection("additionalFields").findOne({ _id: new ObjectId(id) });
    if(!customize){
      return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ customize });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء جلب الحقل" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try{  
    const { id } = params;
    const update = await req.json();
    const client = await clientPromise;
    const db = client.db("customize");
    delete update._id;
    const customize = await db.collection("additionalFields").updateOne({ _id: new ObjectId(id) }, { $set: update });
  if(customize.modifiedCount===0){
    return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
  }
  const updatedCustomize = await db.collection("additionalFields").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ customize: updatedCustomize });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث الحقل" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try{
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("customize");
    const customize = await db.collection("additionalFields").deleteOne({ _id: new ObjectId(id) });
    if(customize.deletedCount===0){
      return NextResponse.json({ message: "الحقل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ message: "تم حذف الحقل بنجاح" });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء حذف الحقل" }, { status: 500 });
  }
}