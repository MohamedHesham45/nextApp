import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import CategoryDetails from "./CategoryDetails";
import { fetchCategoryWithProducts } from "@/lib/products";

export async function generateMetadata({ params }) {
  try {
    const data = await fetchCategoryWithProducts(params.id);
    
    if (!data || !data.category) {
      return {
        title: "فئة المنتجات - سيتار مول",
        description: "اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار",
      };
    }

    const categoryName = data.category.name.startsWith('ال') ? 
      data.category.name : 
      `ال${data.category.name}`;

    const shareUrl = `https://sitaramall.com/category/${params.id}`;
    const shareTitle = `${categoryName} - سيتار مول`;
    const shareDescription = `تسوق ${categoryName} - اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار`;
    
    // Get the first product image as category image, or use default
    const shareImage = data.products && data.products[0]?.images && data.products[0].images[0]
      ? `https://sitaramall.com/${data.products[0].images[0].replace(/^\//, '')}`
      : 'https://sitaramall.com/default-category.jpg';

    return {
      title: shareTitle,
      description: shareDescription,
      openGraph: {
        title: shareTitle,
        description: shareDescription,
        url: shareUrl,
        images: [
          {
            url: shareImage,
            width: 800,
            height: 600,
            alt: categoryName,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: shareTitle,
        description: shareDescription,
        images: [shareImage],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "فئة المنتجات - سيتار مول",
      description: "اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار",
    };
  }
}

export default async function Page() {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryDetails />
      </Suspense>
    ); 
}
