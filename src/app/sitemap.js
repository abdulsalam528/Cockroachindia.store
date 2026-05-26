import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function sitemap() {
  const baseUrl = 'https://www.cockroachindia.shop';

  // Base static routes with custom properties as requested
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    await dbConnect();
    const products = await Product.find({}).select('id updatedAt');

    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Return at least the static routes if DB fails
    return routes;
  }
}
