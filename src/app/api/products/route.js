import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("productDB");
//     const products = await db
//       .collection("products")
//       .find({})
//       .toArray();

//     const productsWithDefaults = products.map(
//       (product) => ({
//         ...product,
//         price: product.price ?? 0,
//         category:
//           product.category || "Uncategorized",
//         discountPercentage:
//           product.discountPercentage ?? 0,
//       })
//     );

//     return NextResponse.json(
//       productsWithDefaults
//     );
//   } catch (error) {
//     console.error(
//       "Error in GET /api/products:",
//       error
//     );
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db("productDB");

    let query = {};
    if (featured === "true") {
      // You might want to add a 'featured' field to your products and use it here
      query = {
        /* Add condition for featured products */
      };
    }
    if (category) {
      query.category = category;
    }

    const products = await db
      .collection("products")
      .find(query)
      .toArray();

    const productsWithDefaults = products.map(
      (product) => ({
        ...product,
        price: product.price ?? 0,
        category:
          product.category || "Uncategorized",
        discountPercentage:
          product.discountPercentage ?? 0,
      })
    );

    return NextResponse.json(
      productsWithDefaults
    );
  } catch (error) {
    console.error(
      "Error in GET /api/products:",
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
      title,
      description,
      images,
      category,
      price,
      discountPercentage,
    } = await request.json();

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const result =
          await cloudinary.uploader.upload(
            image,
            {
              folder: "products",
            }
          );
        return result.secure_url;
      })
    );

    const latestProduct = await db
      .collection("products")
      .findOne(
        {},
        { sort: { referenceCode: -1 } }
      );
    let latestNumber = 0;
    if (
      latestProduct &&
      latestProduct.referenceCode
    ) {
      latestNumber = parseInt(
        latestProduct.referenceCode.slice(2),
        10
      );
    }
    const referenceCode = `AB${(latestNumber + 1)
      .toString()
      .padStart(2, "0")}`;

    const newProduct = {
      title,
      description,
      images: uploadedImages,
      category,
      price,
      referenceCode,
      discountPercentage,
    };

    const result = await db
      .collection("products")
      .insertOne(newProduct);

    return NextResponse.json({
      ...newProduct,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error(
      "Error in POST /api/products:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
