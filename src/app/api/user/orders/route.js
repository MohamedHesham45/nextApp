import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("productDB");
    const orders = await db
      .collection("orders")
      .find({ "customerDetails.email": userId })
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
