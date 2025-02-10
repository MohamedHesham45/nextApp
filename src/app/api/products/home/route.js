export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(request) {
  try {
    const headers = new Headers();
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    headers.append("Pragma", "no-cache");
    headers.append("Expires", "0");
    headers.append("Surrogate-Control", "no-store");
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
            products: 1, 
            _id: 0,
          },
        },
      ])
      .toArray();

    const productsWithCategories = await Promise.all(
      products.map(async (category) => {
        let shuffledProducts = shuffleArray(category.products).slice(0, 10); // خلط وأخذ 10 فقط

        const products = await Promise.all(
          shuffledProducts.map(async (product) => {
            const categoryData = await db
              .collection("categories")
              .findOne({ _id: new ObjectId(product.categoryId) });

            return {
              ...product,
              category: categoryData,
            };
          })
        );

        return {
          ...category,
          products,
        };
      })
    );
    return new NextResponse(JSON.stringify(productsWithCategories), { headers });

  } catch (error) {
    console.error("Error in GET /api/products/home:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}
