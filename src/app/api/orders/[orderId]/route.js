import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendOrderStatusChangeEmail } from "../../nodemailer/service";

export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const { status } = await request.json();

    if (!ObjectId.isValid(params.orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(params.orderId) },
        { $set: { status } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    const order = await db.collection("orders").findOne({ _id: new ObjectId(params.orderId) });
    if (order.customerDetails.email) {
      await sendOrderStatusChangeEmail(order.customerDetails.email, "تحديث حالة طلبك", order);
    }

    return NextResponse.json({
      message:
        "Order status updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in PATCH /api/orders/[orderId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(params.orderId)
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const updateData = await request.json();

    if (!ObjectId.isValid(params.orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    delete updateData._id;

    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(params.orderId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const updatedOrder = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(params.orderId) });

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error(
      "Error in PUT /api/orders/[orderId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
