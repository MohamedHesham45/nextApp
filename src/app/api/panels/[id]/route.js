import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(req, { params }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db("customize");
  const panel = await db.collection("panels").findOne({ _id: new ObjectId(id) });
  if(!panel){
    return NextResponse.json({ message: "اللوحة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json(panel);
}

export async function PUT(req, { params }) {
  try{
    const { id } = params;
    const update = await req.json();
    const client = await clientPromise;
    const db = client.db("customize");
    delete update._id;
    const panel = await db.collection("panels").updateOne({ _id: new ObjectId(id) }, { $set: update });
  if(panel.modifiedCount===0){
    return NextResponse.json({ message: "اللوحة غير موجودة" }, { status: 404 });
  }
  const updatedPanel = await db.collection("panels").findOne({ _id: new ObjectId(id) });
  return NextResponse.json(updatedPanel);
}catch(error){
  return NextResponse.json({ message: "حدث خطأ أثناء تحديث اللوحة" }, { status: 500 });
}
}

export async function DELETE(req, { params }) {
  try{
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("customize");
    const panel = await db.collection("panels").deleteOne({ _id: new ObjectId(id) });
    if(panel.deletedCount===0){
      return NextResponse.json({ message: "اللوحة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json({ message: "تم حذف اللوحة بنجاح" });
  }catch(error){
    return NextResponse.json({ message: "حدث خطأ أثناء حذف اللوحة" }, { status: 500 });
  }
}