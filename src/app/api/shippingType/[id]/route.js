import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        const shippingType = await db.collection("shippingType").findOne({ _id: new ObjectId(params.id) });
        return NextResponse.json(shippingType);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try{
        const updateData = await request.json();
        const client = await clientPromise;
        const db = client.db("address");
        delete updateData._id;
        if(updateData.name){
            const existingShippingType = await db.collection("shippingType").findOne({$and:[{name:updateData.name},{_id:{$ne:new ObjectId(params.id)}}] });
            if(existingShippingType){
                return NextResponse.json({ error: "Shipping type already exists" }, { status: 400 });
            }
        }
        await db.collection("shippingType").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });
        const shippingType=await db.collection("shippingType").findOne({ _id: new ObjectId(params.id) });
        return NextResponse.json({message:"Shipping type updated successfully",shippingType});
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        const shippingType = await db.collection("shippingType").deleteOne({ _id: new ObjectId(params.id) });
        if(shippingType.deletedCount===0){
            return NextResponse.json({ error: "Shipping type not found" }, { status: 404 });
        }
        await db.collection("governorate").updateMany({},{ $pull: { shippingPrices: { shippingTypeId: params.id } } });
        return NextResponse.json({message:"Shipping type deleted successfully"});
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}