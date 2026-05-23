import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function sitemap() {
  const baseUrl = 'https://cockroachindia.store';

  // Base static routes
  const routes = [
    '',
    '/about',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    await dbConnect();
    const products = await Product.find({}).select('id updatedAt');

    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
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
