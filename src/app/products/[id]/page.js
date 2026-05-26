import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { products as configProducts } from '@/config/products';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

async function seedProductsIfNeeded() {
  try {
    // Delete any legacy products not present in the current config
    await Product.deleteMany({ id: { $nin: configProducts.map(p => p.id) } });
  } catch (err) {
    console.error('Failed to cleanup legacy products:', err);
  }

  for (const p of configProducts) {
    try {
      await Product.updateOne(
        { id: p.id },
        {
          $set: {
            name: p.name,
            category: p.category || 'Uncategorized',
            price: p.price,
            description: p.description,
            imageUrl: p.imageUrl,
            images: p.images || [],
            videoUrls: p.videoUrls || [],
          },
          $setOnInsert: {
            id: p.id,
            variants: p.variants || [],
            stock: {
              sizeS: p.stock.S,
              sizeM: p.stock.M,
              sizeL: p.stock.L,
              sizeXL: p.stock.XL,
            },
          }
        },
        { upsert: true }
      );
    } catch (err) {
      if (err.code === 11000 || err.message?.includes('11000')) {
        // Safe to ignore concurrent upsert race condition
        console.log(`[Info] Concurrent seeding for ${p.id} handled.`);
      } else {
        throw err;
      }
    }
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  await dbConnect();
  await seedProductsIfNeeded();
  const product = await Product.findOne({ id }).lean();
  if (!product) {
    return {
      title: 'Product Not Found | Cockroach India Store',
    };
  }
  return {
    title: `${product.name} | Cockroach India Store`,
    description: `Buy ${product.name} online from ₹${product.price} at Cockroach India Store. Heavy cotton, fast delivery across India. ${product.description.substring(0, 100)}...`,
    alternates: {
      canonical: `/products/${product.id}`,
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  await dbConnect();
  await seedProductsIfNeeded();
  const product = await Product.findOne({ id }).lean();
  if (!product) {
    notFound();
  }

  // Get related products
  const relatedProducts = await Product.find({ id: { $ne: id } }).limit(4).lean();

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  // Product JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Cockroach India Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.cockroachindia.shop/products/${product.id}`,
      "priceCurrency": "INR",
      "price": String(product.price),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Cockroach India Store"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={serializedProduct} relatedProducts={serializedRelated} />
    </>
  );
}
