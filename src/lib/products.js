import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to serialize MongoDB documents
function serializeDocument(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id.toString(),
    categoryId: doc.categoryId ? doc.categoryId.toString() : doc.categoryId
  };
}

export async function fetchProductById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
    return serializeDocument(product);
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    return null;
  }
}

export async function fetchCategoryById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const category = await db.collection("categories").findOne({ _id: new ObjectId(id) });
    return serializeDocument(category);
  } catch (error) {
    console.error("Error in fetchCategoryById:", error);
    return null;
  }
}

export async function fetchProductsByCategory(categoryId) {
  try {
    const client = await clientPromise;
    const db = client.db("productDB");
    const products = await db.collection("products")
      .find({ categoryId: categoryId })
      .sort({ _id: -1 })
      .toArray();
    
    // Serialize each product in the array
    return products.map(product => serializeDocument(product));
  } catch (error) {
    console.error("Error in fetchProductsByCategory:", error);
    return [];
  }
}

export async function fetchCategoryWithProducts(categoryId) {
  try {
    const [category, products] = await Promise.all([
      fetchCategoryById(categoryId),
      fetchProductsByCategory(categoryId)
    ]);

    if (!category) return null;

    return {
      category,
      products
    };
  } catch (error) {
    console.error("Error in fetchCategoryWithProducts:", error);
    return null;
  }
} 