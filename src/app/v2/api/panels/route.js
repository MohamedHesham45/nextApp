import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    const client = await clientPromise;
    const db = client.db("customize");
    const panels = await db.collection("panels").find({}).toArray();
    return NextResponse.json(panels);
}

export async function POST(request) {
    const { image, title, subtitle } = await request.json();
    const client = await clientPromise;
    const db = client.db("customize");
    const panel = await db.collection("panels").insertOne({ image, title, subtitle });
    return NextResponse.json(panel);
}