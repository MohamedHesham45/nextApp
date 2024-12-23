import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";

export async function PUT(request, { params }) {
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

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        if (image.startsWith("data:")) {
          const result =
            await cloudinary.uploader.upload(
              image,
              {
                folder: "products",
              }
            );
          return result.secure_url;
        }
        return image;
      })
    );

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            title,
            description,
            images: uploadedImages,
            category,
            price,
            discountPercentage,
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in PUT /api/products/[id]:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("products")
      .deleteOne({
        _id: new ObjectId(params.id),
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/products/[id]:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
