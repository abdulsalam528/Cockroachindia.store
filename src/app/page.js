import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { products as configProducts } from '@/config/products';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'For Everyone Who Refused to Be Squashed | Cockroach India Store',
  description: 'Shop funny graphic tees and mugs from ₹499. 240 GSM heavy cotton, ships across India in 3–5 days. Satirical merch — unbothered since 2026.',
  alternates: {
    canonical: '/',
  },
};

const legacyProductIds = [
  'cjp-cotton-armour', 'lazy-manifesto-mug', 'chronically-online-cap', 'cockroach-office-jug',
  'voice-unemployed-tee', 'parliamentary-procrastinator-jug', 'resilience-shield-cap',
  'propaganda-tote-bag', 'crawling-success-mascot', 'lazyboy-cushion-cover', 'bribed-by-caffeine-mug',
  'stronger-together-tee', 'filibuster-flask', 'unsquashable-socks', 'lazy-manifesto-notepad',
  'vip-lazy-member-badge', 'bureaucracy-mug', 'survivalist-hoodie', 'sticker-pack',
  'propaganda-wall-poster'
];

async function seedProductsIfNeeded() {
  try {
    // Delete only the legacy template products, preserving custom user-added products
    await Product.deleteMany({ id: { $in: legacyProductIds } });
  } catch (err) {
    console.error('Failed to cleanup legacy products:', err);
  }

  for (const p of configProducts) {
    try {
      await Product.updateOne(
        { id: p.id },
        {
          $setOnInsert: {
            id: p.id,
            name: p.name,
            category: p.category || 'Uncategorized',
            price: p.price,
            description: p.description,
            imageUrl: p.imageUrl,
            images: p.images || [],
            videoUrls: p.videoUrls || [],
            variants: p.variants || [],
            stock: {
              sizeS: p.stock.S || 0,
              sizeM: p.stock.M,
              sizeL: p.stock.L,
              sizeXL: p.stock.XL,
              sizeXXL: p.stock.XXL || 50,
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

export default async function Home() {
  let initialProducts = [];
  let initialFeaturedCategories = [];
  
  try {
    await dbConnect();
    await seedProductsIfNeeded();
    const products = await Product.find({}).lean();
    initialProducts = JSON.parse(JSON.stringify(products));
    initialFeaturedCategories = Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean)));
  } catch (err) {
    console.error('Failed to pre-fetch products on server:', err);
  }

  return (
    <HomeClient 
      initialProducts={initialProducts} 
      initialFeaturedCategories={initialFeaturedCategories} 
    />
  );
}
