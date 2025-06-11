import { fetchCategoryWithProducts } from "@/lib/products";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    const data = await fetchCategoryWithProducts(categoryId);

    if (!data) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in category API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 