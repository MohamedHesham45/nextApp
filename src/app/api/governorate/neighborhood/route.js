import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(request) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        let neighborhoods = await db.collection("neighborhood").find({}).toArray();
        neighborhoods = await Promise.all(neighborhoods.map(async (neighborhood) => {
            const governorate = await db.collection("governorate").findOne({ _id: new ObjectId(neighborhood.governorateID) });
            return {
                ...neighborhood,
                governorateNameAr: governorate.nameAr,
                governorateNameEn: governorate.nameEn
            }
        }));
        return NextResponse.json(neighborhoods);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try{
        let { nameAr, nameEn, governorateID} = await request.json();
        const client = await clientPromise; 
        const db = client.db("address");
        const existingNeighborhood = await db.collection("neighborhood").findOne({ nameAr });
        if(existingNeighborhood){
            return NextResponse.json({ error: "Neighborhood already exists" }, { status: 400 });
        }
        let neighborhood = await db.collection("neighborhood").insertOne({ nameAr, nameEn, governorateID });
        neighborhood=await db.collection("neighborhood").findOne({ _id: neighborhood.insertedId });
        return NextResponse.json(neighborhood);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}