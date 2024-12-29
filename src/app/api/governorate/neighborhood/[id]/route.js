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
            return NextResponse.json({ error: "Neighborhood not found" }, { status: 404 });
        }
        return NextResponse.json(neighborhood);
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try{
        const { id } = params;
        const updateData = await request.json();
        const client = await clientPromise;
        const db = client.db("address");
        if(updateData.nameAr || updateData.nameEn){
            const existingNeighborhoodName = await db.collection("neighborhood").findOne({ $or: [{ nameAr: updateData.nameAr }, { nameEn: updateData.nameEn }] });
            if(existingNeighborhoodName){
                return NextResponse.json({ error: "Neighborhood name already exists" }, { status: 400 });
            }
        }
        const neighborhood = await db.collection("neighborhood").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if(neighborhood.modifiedCount===0){
            return NextResponse.json({ error: "Neighborhood not found" }, { status: 404 });
        }
        return NextResponse.json({message:"Neighborhood updated successfully"});
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
        return NextResponse.json({message:"Neighborhood deleted successfully"});
    }catch(error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}