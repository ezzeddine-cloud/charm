import { deleteCatalogCategory, listCategories, saveCategory } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';
import type { Category } from '@/types';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await listCategories());
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
  }
  const category = (await request.json()) as Category;
  if (!category?.id || !category.name || !category.slug) {
    return NextResponse.json({ error: 'Catégorie incomplète.' }, { status: 400 });
  }
  await saveCategory(category);
  return NextResponse.json({ id: category.id });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès admin requis.' }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Catégorie manquante.' }, { status: 400 });
  await deleteCatalogCategory(id);
  return NextResponse.json({ id });
}
