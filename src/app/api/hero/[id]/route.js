import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("heroDB");
    const hero = await db.collection("home").findOne({ _id: new ObjectId(params.id) });
    if(!hero){
      return NextResponse.json({message:"البيانات غير موجودة"},{status:404})
    }
    return NextResponse.json(hero);
  } catch (error) {
    console.error("Error in GET /api/hero/[id]:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء جلب البيانات" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("heroDB");
    const updateData = await request.json();
    const existingHero = await db.collection("home").findOne({ _id: new ObjectId(params.id) });
    if (!existingHero) {
      return NextResponse.json({ message: "البيانات غير موجودة" }, { status: 404 });
    }
     await db.collection("home").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });
     const updatedHero = await db.collection("home").findOne({ _id: new ObjectId(params.id) });
     return NextResponse.json({ hero: updatedHero });
  } catch (error) {
    console.error("Error in PUT /api/hero/[id]:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث البيانات" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("heroDB");
    const deletedHero = await db.collection("home").deleteOne({ _id: new ObjectId(params.id) });
    if(deletedHero.deletedCount === 0){
      return NextResponse.json({message:"البيانات غير موجودة"},{status:404})
    }
    return NextResponse.json({ message: "تم حذف البيانات بنجاح" });
  } catch (error) {
    console.error("Error in DELETE /api/hero/[id]:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء حذف البيانات" }, { status: 500 });
  }
}
