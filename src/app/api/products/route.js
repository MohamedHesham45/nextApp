import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // const featured = searchParams.get("featured");
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db("productDB");

    let query = {};
    // if (featured === "true") {
    //   // You might want to add a 'featured' field to your products and use it here
    //   query = {
        
    //   };
    // }
    if (category) {
      query.category = category;
    }

    const products = await db
      .collection("products")
      .find(query)
      .sort({referenceCode:-1})
      .toArray();

    const productsWithDefaults = await Promise.all(products.map(
      async (product) => {
        const category=await db.collection("categories").findOne({_id:new ObjectId(product.categoryId)})
        return {
          ...product,
          price: product.price ?? 0,
          categoryId:category,
          category:
        product.category || "غير مصنف",
        discountPercentage:
        product.discountPercentage ?? 0,
          priceAfterDiscount:
            product.priceAfterDiscount ?? 0,
          quantity: product.quantity ?? 0,
        };
      }
    ));

    return NextResponse.json(
      productsWithDefaults
    );
  } catch (error) {
    console.error(
      "Error in GET /api/products:",
      error
    );
    return NextResponse.json(
      { message: "اعد المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    let {title,description,categoryId,category,price,priceAfterDiscount,quantity,images}=await request.json();

    const client = await clientPromise;
    const db = client.db("productDB");
    const existingCategory=await db.collection("categories").findOne({_id:new ObjectId(categoryId)})
    if(!existingCategory){
      return NextResponse.json({message:"الفئة غير موجودة"},{status:404})
    }
    if(existingCategory.name!==category){
      return NextResponse.json({message:"اسم الفئة لا يتطابق"},{status:400})
    }
    price=parseInt(price)
    if(isNaN(price)){
      return NextResponse.json({message:"السعر ليس رقمًا"},{status:400})
    }
    priceAfterDiscount=parseInt(priceAfterDiscount)
   
    quantity=parseInt(quantity)
    if(!quantity){
      quantity=0
    }
    if(priceAfterDiscount>price){
      return NextResponse.json({message:"السعر بعد الخصم لا يمكن أن يكون أكبر من السعر"},{status:400})
    }
    if(priceAfterDiscount<0){
      return NextResponse.json({message:"السعر بعد الخصم لا يمكن أن يكون أقل من 0"},{status:400})
    }
    if(price<0){
      return NextResponse.json({message:"السعر لا يمكن أن يكون أقل من 0"},{status:400})
    }
    if(quantity<0){
      return NextResponse.json({message:"الكمية لا يمكن أن تكون أقل من 0"},{status:400})
    }
    const existingProduct=await db.collection("products").findOne({title})
    if(existingProduct){
      return NextResponse.json({message:"منتج بهذا العنوان موجود بالفعل"},{status:400},)
    }

    const latestProduct = await db
      .collection("products")
      .findOne({}, { sort: { referenceCode: -1 } });

    let latestNumber = 0;
    if (latestProduct && latestProduct.referenceCode) {
      latestNumber = parseInt(
        latestProduct.referenceCode.slice(2),
        10
      );
    }
    const referenceCode = `AB${(latestNumber + 1)
      .toString()
      .padStart(2, "0")}`;
      let discountPercentage=0
      if(priceAfterDiscount!=0){
        discountPercentage=((price-priceAfterDiscount)/price)*100
      }
    const newProduct = {
      title,
      description,
      images,
      category,
      categoryId,
      price,
      referenceCode,
      discountPercentage,
      priceAfterDiscount,
      quantity
    };

    const result = await db.collection("products").insertOne(newProduct);

    return NextResponse.json({
      ...newProduct,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      { message: "اعد المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}
