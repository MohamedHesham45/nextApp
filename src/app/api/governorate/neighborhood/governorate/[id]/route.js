import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try{
        const client = await clientPromise;
        const db = client.db("address");
        const neighborhoods = await db.collection("neighborhood").find({ governorateID: params.id }).toArray();
        return NextResponse.json(neighborhoods);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
