import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const products = await db
      .collection("products")
      .aggregate([
       
        {
          $group: {
            _id: "$categoryId",
            products: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            category: { $first: "$products.category" },
            products: {
              $slice: ["$products", 4],
            },
            _id: 0,
          },
        },
      ])
      .toArray();
      const productsWithCategories = await Promise.all(products.map(async (product) => {
        const products= await Promise.all(product.products.map(async (product) => {
          const category=await db.collection("categories").findOne({_id:new ObjectId(product.categoryId)})
          return {
            ...product,
            categoryId:category
          }
        }))
        return {
          ...product,
          products:products
        }
      }))
    return NextResponse.json(productsWithCategories);
  } catch (error) {
    console.error("Error in GET /api/products/home:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}
