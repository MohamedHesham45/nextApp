import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(request, { params }) {
  try{
    console.log("GET request received");
    const client = await clientPromise;
    const db = client.db("productDB");
    const category = await db.collection("categories").findOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ message: "Category fetched successfully", category });
  }catch(error){
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try{
    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db("productDB");
    await db.collection("categories").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });
    // if(updateData.name){
    //   await db.collection("products").updateMany({ categoryId: params.id }, { $set: { categoryName: updateData.name } });
    // }
    return NextResponse.json({ message: "Category updated successfully" });
  }catch(error){
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try{
    const client = await clientPromise;
    const db = client.db("productDB");
    await db.collection("categories").deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ message: "Category deleted successfully" });
  }catch(error){
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
