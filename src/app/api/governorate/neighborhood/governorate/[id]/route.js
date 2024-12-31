import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        let neighborhoods = await db.collection("neighborhood").find({ governorateID: params.id }).toArray();
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
