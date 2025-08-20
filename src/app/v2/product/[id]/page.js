import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductDetails from "./ProductDetails";
import { fetchProductById } from "@/lib/products";

export async function generateMetadata({ params }) {
  const product = await fetchProductById(params.id);

  if (!product) {
    return {
      title: "المنتج غير موجود - سيتار مول",
      description: "هذا المنتج غير متوفر حالياً.",
    };
  }

  const shareUrl = `https://sitaramall.com/product/${product._id}`;
  const shareTitle = `${product.title} - سيتار مول`;
  const shareDescription = product.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  const shareImage = product.images && product.images[0]
    ? `https://sitaramall.com/${product.images[0].replace(/^\//, '')}`
    : 'https://sitaramall.com/default-product.jpg';

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
          alt: product.title,
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
}

export default async function Page() {
  

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductDetails/>
    </Suspense>
  );
}