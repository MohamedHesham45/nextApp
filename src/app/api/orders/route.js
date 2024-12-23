import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ orderDate: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error(
      "Error in GET /api/orders:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const {
      customerDetails,
      orderItems,
      totalPrice,
      userId,
    } = await request.json();

    const newOrder = {
      customerDetails: {
        ...customerDetails,
        userId,
      },
      orderItems,
      totalPrice,
      orderDate: new Date(),
      status: "Pending",
    };

    const result = await db
      .collection("orders")
      .insertOne(newOrder);

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    console.error(
      "Error in POST /api/orders:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
