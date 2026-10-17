import { deleteCatalogProduct, getCatalogProduct, listProducts, saveProduct } from '@/lib/db';
import { deleteUnusedProductImages } from '@/lib/product-storage';
import { requireAdmin } from '@/lib/require-admin';
import type { Product } from '@/types';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
  }

  const product = (await request.json()) as Product;
  if (!product?.id || !product.name || !product.slug || !Array.isArray(product.images)) {
    return NextResponse.json({ error: 'Bijou incomplet.' }, { status: 400 });
  }

  await saveProduct(product);
  return NextResponse.json({ id: product.id });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Bijou manquant.' }, { status: 400 });

  const product = await getCatalogProduct(id);
  if (product) {
    try {
      await deleteUnusedProductImages(product.images ?? [], product.id);
    } catch {
      return NextResponse.json(
        { error: 'La photo n’a pas pu être retirée du stockage.' },
        { status: 500 },
      );
    }
    await deleteCatalogProduct(id);
  }

  return NextResponse.json({ id });
}
