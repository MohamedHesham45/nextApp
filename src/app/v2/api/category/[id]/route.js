import { fetchCategoryWithProducts } from "@/lib/products";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // validate id
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = (searchParams.get("search") || "").trim();

    const client = await clientPromise;
    const db = client.db("productDB");

    // find category first
    const category = await db.collection("categories").findOne({ _id: new ObjectId(id) });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // build product query:
    // match products where categoryId equals the id string OR equals the ObjectId(id)
    const categoryObjectId = new ObjectId(id);
    const categoryMatcher = { $or: [{ categoryId: id }, { categoryId: categoryObjectId }] };

    // if search provided, require title or description match
    const andClauses = [categoryMatcher];
    if (search) {
      const regex = { $regex: search, $options: "i" };
      andClauses.push({ $or: [{ title: regex }, { description: regex }] });
    }

    const finalQuery = andClauses.length > 1 ? { $and: andClauses } : categoryMatcher;

    const totalProducts = await db.collection("products").countDocuments(finalQuery);

    const products = await db
      .collection("products")
      .find(finalQuery)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      category,
      products,
      totalProducts,
      page,
      limit,
      hasMore: page * limit < totalProducts,
    });
  } catch (error) {
    console.error("Error in category GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db("productDB");
    await db.collection("categories").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });
    if (updateData.name) {
      await db.collection("products").updateMany({ categoryId: params.id }, { $set: { category: updateData.name } });
    }
    const updatedCategory = await db.collection("categories").findOne({ _id: new ObjectId(params.id) });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث الفئة" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    await db.collection("categories").deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ message: "تم حذف الفئة بنجاح" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء حذف الفئة" }, { status: 500 });
  }
}
