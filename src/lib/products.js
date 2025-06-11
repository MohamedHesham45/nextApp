import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function fetchProductById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
    if (!product) return null;
    return product;
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    return null;
  }
} 