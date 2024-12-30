import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        const governorates = await db.collection("governorate").find({}).toArray();
        governorates.forEach(async governorate=>{
            governorate.shippingPrices=await Promise.all(governorate.shippingPrices.map(async shippingPrice=>{
                const shippingType=await db.collection("shippingType").findOne({ _id: new ObjectId(shippingPrice.shippingTypeId) });
                return {
                    shippingTypeId: shippingPrice.shippingTypeId,
                    shippingType: shippingType.name,
                    description: shippingType.description,
                    price: shippingPrice.price
                }
            })) 
        })
        return NextResponse.json(governorates);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try{
        let { nameAr, nameEn } = await request.json();
        const client = await clientPromise;
        const db = client.db("address");
        const existingGovernorate = await db.collection("governorate").findOne({ nameAr });
        if(existingGovernorate){
            return NextResponse.json({ error: "Governorate already exists" }, { status: 400 });
        }
        let governorate = await db.collection("governorate").insertOne({ nameAr, nameEn, shippingPrices: [] });
        governorate=await db.collection("governorate").findOne({ _id: governorate.insertedId });
        return NextResponse.json(governorate);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}