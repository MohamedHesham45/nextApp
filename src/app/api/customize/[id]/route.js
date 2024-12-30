import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(req, { params }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db("customize");
  const customize = await db.collection("additionalFields").findOne({ _id: new ObjectId(id) });
  return NextResponse.json({ customize });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const update = await req.json();
  const client = await clientPromise;
  const db = client.db("customize");
  delete update._id;
  const customize = await db.collection("additionalFields").updateOne({ _id: new ObjectId(id) }, { $set: update });
  const updatedCustomize = await db.collection("additionalFields").findOne({ _id: new ObjectId(id) });
  return NextResponse.json({ customize: updatedCustomize });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db("customize");
  const customize = await db.collection("additionalFields").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ message: "Customize deleted successfully" });
}