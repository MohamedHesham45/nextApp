import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendOrderEmail } from "../nodemailer/service";
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
      shippingCost,
      totalPrice,
      userId,
      saveToProfile,
    } = await request.json();
    if (saveToProfile) {
      const userDb = client.db("userDB");
      const user = await userDb.collection("profiles").findOne({ userId: new ObjectId(userId) });
      if (user) {
        await userDb.collection("profiles").updateOne({ userId: new ObjectId(userId) }, { $set: { governorate: customerDetails.governorate, neighborhood: customerDetails.neighborhood, centerArea: customerDetails.centerArea } });
      }
    }
    const newOrder = {
      customerDetails: {
        ...customerDetails,
        userId,
      },
      orderItems,
      shippingCost,
      totalPrice,
      orderDate: new Date(),
      status: "Pending",
    };
    const product = await db.collection("products").findOne({ _id: new ObjectId(orderItems[0].productId) });
    if (product) {
      await db.collection("products").updateOne({ _id: new ObjectId(orderItems[0].productId) }, { $set: { quantity: product.quantity - orderItems[0].quantity } });
    }

    const result = await db
      .collection("orders")
      .insertOne(newOrder);
    // await sendOrderEmail(customerDetails.email||"", "تفاصيل الطلب", newOrder);
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
