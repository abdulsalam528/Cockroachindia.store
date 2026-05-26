import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { products } from '@/config/products';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

async function verifyAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminEmails = ['admin@cjp.org', 'admin@cockroachindia.shop', 'admin@cockroach.store', 'admin@cockroachindia.store'];
    if (adminEmails.includes(decoded.email)) return decoded;
    const user = await User.findById(decoded.id);
    if (user && adminEmails.includes(user.email)) return decoded;
    return false;
  } catch (err) {
    return false;
  }
}

async function seedProductsIfNeeded() {
  try {
    await Product.deleteMany({ id: { $nin: products.map(p => p.id) } });
  } catch (err) {
    console.error('Failed to cleanup legacy products in admin API:', err);
  }

  for (const p of products) {
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
        console.log(`[Info] Concurrent seeding for ${p.id} handled.`);
      } else {
        throw err;
      }
    }
  }
}

export async function GET(request) {
  await dbConnect();
  await seedProductsIfNeeded();

  try {
    const dbProducts = await Product.find({}).sort({ name: 1 });
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = await Settings.create({ id: 'global' });
    }
    return NextResponse.json({ 
      products: dbProducts,
      featuredCategories: settings.featuredCategories || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id, name, category, price, description, imageUrl, stock, images, videoUrls, variants } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findOne({ id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (description) product.description = description;
    if (imageUrl) product.imageUrl = imageUrl;
    if (images) product.images = images;
    if (videoUrls) product.videoUrls = videoUrls;
    
    if (variants) {
      product.variants = variants;
      // Sync traditional stock fields
      const sizeSStock = variants.filter(v => v.size === 'S').reduce((acc, curr) => acc + curr.stock, 0);
      const sizeMStock = variants.filter(v => v.size === 'M').reduce((acc, curr) => acc + curr.stock, 0);
      const sizeLStock = variants.filter(v => v.size === 'L').reduce((acc, curr) => acc + curr.stock, 0);
      const sizeXLStock = variants.filter(v => v.size === 'XL').reduce((acc, curr) => acc + curr.stock, 0);
      product.stock.sizeS = sizeSStock;
      product.stock.sizeM = sizeMStock;
      product.stock.sizeL = sizeLStock;
      product.stock.sizeXL = sizeXLStock;
    } else if (stock) {
      if (stock.sizeS !== undefined) product.stock.sizeS = Number(stock.sizeS);
      if (stock.sizeM !== undefined) product.stock.sizeM = Number(stock.sizeM);
      if (stock.sizeL !== undefined) product.stock.sizeL = Number(stock.sizeL);
      if (stock.sizeXL !== undefined) product.stock.sizeXL = Number(stock.sizeXL);
    }

    await product.save();

    return NextResponse.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Admin PATCH Product Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Support creating new products if the admin wishes to add more items
export async function POST(request) {
  await dbConnect();

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { name, category, price, description, imageUrl, stock, images, videoUrls, variants } = await request.json();

    if (!name || !price || !description) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Product.findOne({ id });
    if (existing) {
      return NextResponse.json({ error: 'A product with a similar name already exists.' }, { status: 400 });
    }

    const sizeS = stock?.sizeS !== undefined ? Number(stock.sizeS) : 50;
    const sizeM = stock?.sizeM !== undefined ? Number(stock.sizeM) : 100;
    const sizeL = stock?.sizeL !== undefined ? Number(stock.sizeL) : 100;
    const sizeXL = stock?.sizeXL !== undefined ? Number(stock.sizeXL) : 50;

    let productVariants = variants;
    if (!productVariants) {
      productVariants = [
        { color: 'Default', size: 'S', stock: sizeS },
        { color: 'Default', size: 'M', stock: sizeM },
        { color: 'Default', size: 'L', stock: sizeL },
        { color: 'Default', size: 'XL', stock: sizeXL }
      ];
    }

    const newProduct = await Product.create({
      id,
      name,
      category: category || 'Uncategorized',
      price: Number(price),
      description,
      imageUrl: imageUrl || 'https://placehold.co/600x600/EAE5D9/000000?text=New+Merch',
      images: images || [],
      videoUrls: videoUrls || [],
      variants: productVariants,
      stock: {
        sizeS,
        sizeM,
        sizeL,
        sizeXL
      }
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product: newProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Admin POST Product Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const deletedProduct = await Product.findOneAndDelete({ id });
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully', success: true });
  } catch (error) {
    console.error('Admin DELETE Product Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
