import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import multer from "multer";
import nextConnect from "next-connect";
import fs from "fs/promises";
import path from "path";
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
      .toArray();

    const productsWithDefaults = products.map(
      (product) => ({
        ...product,
        price: product.price ?? 0,
        category:
        product.category || "Uncategorized",
        discountPercentage:
        product.discountPercentage ?? 0,
        priceAfterDiscount:
        product.priceAfterDiscount ?? 0,
        quantity: product.quantity ?? 0,
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
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/", // Folder to store uploads
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Custom filename
    },
  }),
});

const apiRoute = nextConnect({
  onError: (error, req, res) => {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
});
apiRoute.use(upload.array("images")); // Accept multiple files

async function saveFiles(files) {
  const filePaths = [];
  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const filePath = `/uploads/${Date.now()}-${file.name}`;
    const fullPath = path.join(process.cwd(), "public", filePath);

    await fs.writeFile(fullPath, fileBuffer);
    filePaths.push(filePath);
  }
  return filePaths;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll("images"); // Retrieve all uploaded images
    const filePaths = await saveFiles(images); // Save all images

    const client = await clientPromise;
    const db = client.db("productDB");
    let {
      title,
      description,
      categoryId,
      category,
      price,
      priceAfterDiscount,
      quantity
    } = Object.fromEntries(formData.entries());
    const existingCategory=await db.collection("categories").findOne({_id:new ObjectId(categoryId)})
    if(!existingCategory){
      return NextResponse.json({error:"Category not found"},{status:404})
    }
    if(existingCategory.name!==category){
      return NextResponse.json({error:"Category name does not match"},{status:400})
    }
    price=parseInt(price)
    if(isNaN(price)){
      return NextResponse.json({error:"Price is not a number"},{status:400})
    }
    priceAfterDiscount=parseInt(priceAfterDiscount)
   
    quantity=parseInt(quantity)
    if(!quantity){
      quantity=0
    }
    if(priceAfterDiscount>price){
      return NextResponse.json({error:"Price after discount cannot be greater than price"},{status:400})
    }
    if(priceAfterDiscount<0){
      return NextResponse.json({error:"Price after discount cannot be less than 0"},{status:400})
    }
    if(price<0){
      return NextResponse.json({error:"Price cannot be less than 0"},{status:400})
    }
    if(quantity<0){
      return NextResponse.json({error:"Quantity cannot be less than 0"},{status:400})
    }
    const existingProduct=await db.collection("products").findOne({title})
    if(existingProduct){
      return NextResponse.json({error:"Product with this title already exists"},{status:400})
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
    const discountPercentage=((price-priceAfterDiscount)/price)*100
    const newProduct = {
      title,
      description,
      images: filePaths, // Save all file paths
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
