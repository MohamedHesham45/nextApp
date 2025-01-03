import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const product = await db.collection("products").findOne({ _id: new ObjectId(params.id) });
    if(!product){
      return NextResponse.json({message:"المنتج غير موجود"},{status:404})
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء جلب المنتج" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const updateData = await request.json();
    if(updateData.price){
      updateData.price=parseInt(updateData.price)
    }
    if(updateData.priceAfterDiscount){
      updateData.priceAfterDiscount=parseInt(updateData.priceAfterDiscount)
    }
  
    const existingProduct=await db.collection("products").findOne({_id:new ObjectId(params.id)})
    if(!existingProduct){
      return NextResponse.json({message:"المنتج غير موجود"},{status:404})
    }
    const title=updateData.title
    if(title){
      const existingProductWithTitle=await db.collection("products").findOne({$and:[{title},{_id:{$ne:new ObjectId(params.id)}}]})
      if(existingProductWithTitle){
        return NextResponse.json({message:"منتج بهذا العنوان موجود بالفعل"},{status:400})
      }
    }
    const priceAfterDiscount=updateData.priceAfterDiscount
    const price=updateData.price
    if(priceAfterDiscount>=0){
      if(priceAfterDiscount==0){
        updateData.discountPercentage=0
      }else{
        if(price){
          const discountPercentage=((price-priceAfterDiscount)/price)*100
          updateData.discountPercentage=discountPercentage
        }else{
          const discountPercentage=((existingProduct.price-priceAfterDiscount)/existingProduct.price)*100
          updateData.discountPercentage=discountPercentage
        }
      }
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
        { message: "المنتج غير موجود" },
        { status: 404 }
      );
    }
    const updatedProduct=await db.collection("products").findOne({_id:new ObjectId(params.id)})

    return NextResponse.json({
      message: "تم تحديث المنتج بنجاح",
      product:updatedProduct
    });
  } catch (error) {
    console.error("Error in PUT /api/products/[id]:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث المنتج" },
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
        { message: "رقم المنتج غير صالح" },
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
        { message: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/products/[id]:",
      error
    );
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف المنتج" },
      { status: 500 }
    );
  }
}
