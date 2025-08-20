import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("heroDB");
    const hero = await db.collection("home").find({}).toArray();
    return NextResponse.json(hero);
  } catch (error) {
    console.error("Error in GET /api/hero:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("heroDB");
    const { title, subtitle , image } = await request.json();
    if(!title ){
        return NextResponse.json({message:"العنوان مطلوب"},{status:400})
    }
    if(!subtitle){
      return NextResponse.json({message:"النص الفرعي مطلوب"},{status:400})
    }
    if(!image){
      return NextResponse.json({message:"الصورة مطلوبة"},{status:400})
    }
    const existingHero=await db.collection("home").findOne({title})
    if(existingHero){
      return NextResponse.json({message:"العنوان مستخدم من قبل"},{status:400})
    }
    const hero = await db.collection("home").insertOne({ title, subtitle, image });
    const heroAdded = await db.collection("home").findOne({ _id: hero.insertedId });
    return NextResponse.json({ hero: heroAdded });
  } catch (error) {
    console.error("Error in POST /api/hero:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إضافة البيانات" }, { status: 500 });
  }
}