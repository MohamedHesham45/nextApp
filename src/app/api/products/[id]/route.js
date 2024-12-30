import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const product = await db.collection("products").findOne({ _id: new ObjectId(params.id) });
    if(!product){
      return NextResponse.json({error:"Product not found"},{status:404})
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const formData = await request.formData();

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    const existingProduct=await db.collection("products").findOne({_id:new ObjectId(params.id)})
    if(!existingProduct){
      return NextResponse.json({error:"Product not found"},{status:404})
    }
    const title=formData.get("title")
    if(title){
      const existingProductWithTitle=await db.collection("products").findOne({$and:[{title},{_id:{$ne:new ObjectId(params.id)}}]})
      if(existingProductWithTitle){
        return NextResponse.json({error:"Product with this title already exists"},{status:400})
      }
    }
    const updateData = {};
    const priceAfterDiscount=formData.get("priceAfterDiscount")
    const price=formData.get("price")
    if(priceAfterDiscount){
      if(price){
        const discountPercentage=((price-priceAfterDiscount)/price)*100
        updateData.discountPercentage=discountPercentage
      }
      else{
        const discountPercentage=((existingProduct.price-priceAfterDiscount)/existingProduct.price)*100
        updateData.discountPercentage=discountPercentage
      }
    }

    // Build the update object dynamically
    const images = formData.getAll("images");

    for (const [key, value] of formData.entries()) {
      if (key !== "images") {
        updateData[key] = isNaN(value) ? value : parseFloat(value); // Parse numbers if applicable
      }
    }

    // Handle images update if provided
    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (image instanceof File) {
            const buffer = await image.arrayBuffer();
            const fileBuffer = Buffer.from(buffer);
            const filePath = `/uploads/${Date.now()}-${image.name}`;
            const fullPath = path.join(process.cwd(), "public", filePath);

            await fs.writeFile(fullPath, fileBuffer);
            return filePath;
          }
          return image;
        })
      );
      updateData.images = uploadedImages;
    }

    // Update the product
    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    const updatedProduct=await db.collection("products").findOne({_id:new ObjectId(params.id)})

    return NextResponse.json({
      message: "Product updated successfully",
      product:updatedProduct
    });
  } catch (error) {
    console.error("Error in PUT /api/products/[id]:", error);
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
