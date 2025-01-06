import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const userId = params.id;

   

    const client = await clientPromise;
    const db = client.db("productDB");
    const orders = await db
      .collection("orders")
      .find({ "customerDetails.userId": userId })
      .sort({ orderDate: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error(
      "Error in GET /api/user/orders:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
