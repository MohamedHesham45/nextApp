import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const client = await clientPromise;
  const db = client.db("userDB");
  const profile = await db.collection("profiles").findOne({ userId: new ObjectId(params.id) });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({message:"Profile fetched successfully",profile});
}
export async function PUT(request, { params }) {
  try {
    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db("userDB");
    const result = await db.collection("profiles").updateOne(
      { userId: new ObjectId(params.id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if(updateData.role ){
      await db.collection("users").updateOne({ _id: new ObjectId(params.id) }, { $set: {role:updateData.role } });
    }
    if(updateData.name){
      await db.collection("users").updateOne({ _id: new ObjectId(params.id) }, { $set: { name: updateData.name } });
    }
    if(updateData.email){
      await db.collection("users").updateOne({ _id: new ObjectId(params.id) }, { $set: { email: updateData.email } });
    }
    const updatedProfile = await db.collection("profiles").findOne({ userId: new ObjectId(params.id) });
    return NextResponse.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("userDB");
    const result = await db.collection("profiles").deleteOne({ userId: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

