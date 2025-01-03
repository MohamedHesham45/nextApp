import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try{
        const { id } = params;
        const client = await clientPromise;
        const db = client.db("address");
        const neighborhood = await db.collection("neighborhood").findOne({ _id: new ObjectId(id) });
        if(!neighborhood){
            return NextResponse.json({ message: "المنطقة غير موجودة" }, { status: 404 });
        }
        return NextResponse.json(neighborhood);
    }catch(error){
        return NextResponse.json({ message: "حدث خطأ أثناء جلب المنطقة" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try{
        const { id } = params;
        const updateData = await request.json();
        delete updateData._id;
        const client = await clientPromise;
        const db = client.db("address");
        if(updateData.nameAr || updateData.nameEn){
            const existingNeighborhoodName = await db.collection("neighborhood").findOne({$and: [{_id:{$ne:new ObjectId(id)}},{$or: [{ nameAr: updateData.nameAr }, { nameEn: updateData.nameEn }] }] });
            if(existingNeighborhoodName){
                return NextResponse.json({ message: "المنطقة بهذا العنوان موجودة بالفعل" }, { status: 400 });
            }
        }
        const neighborhood = await db.collection("neighborhood").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if(neighborhood.modifiedCount===0){
            return NextResponse.json({ message: "المنطقة غير موجودة" }, { status: 404 });
        }
        return NextResponse.json({message:"تم تحديث المنطقة بنجاح"});
    }catch(error){
        return NextResponse.json({ message: "حدث خطأ أثناء تحديث المنطقة" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try{
        const { id } = params;
        const client = await clientPromise;
        const db = client.db("address");
        const neighborhood = await db.collection("neighborhood").deleteOne({ _id: new ObjectId(id) });
        if(neighborhood.deletedCount===0){
            return NextResponse.json({ error: "Neighborhood not found" }, { status: 404 });
        }
        return NextResponse.json({message:"تم حذف المنطقة بنجاح"});
    }catch(error){
        return NextResponse.json({ message: "حدث خطأ أثناء حذف المنطقة" }, { status: 500 });
    }
}