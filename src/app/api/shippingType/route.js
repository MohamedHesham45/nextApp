import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        const shippingTypes = await db.collection("shippingType").find({}).toArray();
        return NextResponse.json(shippingTypes);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try{
        let { name , description } = await request.json();
        const client = await clientPromise;
        const db = client.db("address");
        const existingShippingType = await db.collection("shippingType").findOne({ name });
        if(existingShippingType){
            return NextResponse.json({ error: "Shipping type already exists" }, { status: 400 });
        }
        let shippingType = await db.collection("shippingType").insertOne({ name, description });
        shippingType=await db.collection("shippingType").findOne({ _id: shippingType.insertedId });
        await db.collection("governorate").updateMany({},{ $push: { shippingPrices: { shippingTypeId: shippingType._id.toString(), price: 0 } } });
        return NextResponse.json(shippingType);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}