import { neon } from '@neondatabase/serverless';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/data/mockData';
import type { Category, Order, Product } from '@/types';

type Sql = ReturnType<typeof neon>;

let ready: Promise<void> | null = null;

export function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export function asJson<T>(value: unknown): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

function asRows<T extends Record<string, unknown>>(value: unknown): T[] {
  return value as T[];
}

export async function ensureDatabase() {
  if (!ready) ready = setupDatabase();
  return ready;
}

async function setupDatabase() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS catalog_products (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      payload jsonb NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS shop_orders (
      id text PRIMARY KEY,
      payload jsonb NOT NULL,
      user_id text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS stored_files (
      id text PRIMARY KEY,
      user_id text,
      object_key text UNIQUE NOT NULL,
      content_type text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS catalog_categories (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      payload jsonb NOT NULL
    )
  `;
  const categoryRows = asRows<{ count: number | string }>(
    await sql`SELECT count(*)::int AS count FROM catalog_categories`,
  );
  if (Number(categoryRows[0]?.count ?? 0) === 0) {
    for (const category of INITIAL_CATEGORIES) {
      await sql`
        INSERT INTO catalog_categories (id, slug, payload)
        VALUES (${category.id}, ${category.slug}, ${JSON.stringify(category)}::jsonb)
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  const rows = asRows<{ count: number | string }>(
    await sql`SELECT count(*)::int AS count FROM catalog_products`,
  );
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) return;

  for (const product of INITIAL_PRODUCTS) {
    await sql`
      INSERT INTO catalog_products (id, slug, payload)
      VALUES (${product.id}, ${product.slug}, ${JSON.stringify(product)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function listCategories(): Promise<Category[]> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown }>(
    await getSql()`SELECT payload FROM catalog_categories ORDER BY id`,
  );
  return rows.map((row) => asJson<Category>(row.payload));
}

export async function saveCategory(category: Category) {
  await ensureDatabase();
  await getSql()`
    INSERT INTO catalog_categories (id, slug, payload)
    VALUES (${category.id}, ${category.slug}, ${JSON.stringify(category)}::jsonb)
    ON CONFLICT (id) DO UPDATE
    SET slug = EXCLUDED.slug, payload = EXCLUDED.payload
  `;
}

export async function deleteCatalogCategory(id: string) {
  await ensureDatabase();
  await getSql()`DELETE FROM catalog_categories WHERE id = ${id}`;
}

export async function saveProduct(product: Product) {
  await ensureDatabase();
  await getSql()`
    INSERT INTO catalog_products (id, slug, payload)
    VALUES (${product.id}, ${product.slug}, ${JSON.stringify(product)}::jsonb)
    ON CONFLICT (id) DO UPDATE
    SET slug = EXCLUDED.slug, payload = EXCLUDED.payload
  `;
}

export async function deleteCatalogProduct(id: string) {
  await ensureDatabase();
  await getSql()`DELETE FROM catalog_products WHERE id = ${id}`;
}

export async function getCatalogProduct(id: string): Promise<Product | null> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown }>(
    await getSql()`SELECT payload FROM catalog_products WHERE id = ${id} LIMIT 1`,
  );
  const row = rows[0];
  return row ? asJson<Product>(row.payload) : null;
}

export async function deleteStoredFiles(objectKeys: string[]) {
  if (objectKeys.length === 0) return;
  await ensureDatabase();
  const sql = getSql();
  for (const objectKey of objectKeys) {
    await sql`DELETE FROM stored_files WHERE object_key = ${objectKey}`;
  }
}

export async function listProducts(): Promise<Product[]> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown }>(
    await getSql()`SELECT payload FROM catalog_products ORDER BY id`,
  );
  return rows.map((row) => asJson<Product>(row.payload));
}

export async function insertOrder(order: Order, userId: string | null) {
  await ensureDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO shop_orders (id, payload, user_id)
    VALUES (${order.id}, ${JSON.stringify(order)}::jsonb, ${userId})
  `;

  const reserved: { productId: string; quantity: number }[] = [];
  try {
    for (const item of order.items) {
      const updated = asRows<{ id: string }>(
        await sql`
          UPDATE catalog_products
          SET payload = jsonb_set(
            payload,
            '{stock}',
            to_jsonb(((payload->>'stock')::numeric - ${item.quantity}))
          )
          WHERE id = ${item.productId}
            AND COALESCE((payload->>'published')::boolean, false) = true
            AND (payload->>'stock')::numeric >= ${item.quantity}
          RETURNING id
        `,
      );
      if (!updated[0]) throw new Error('STOCK');
      reserved.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (error) {
    for (const item of reserved) {
      await sql`
        UPDATE catalog_products
        SET payload = jsonb_set(
          payload,
          '{stock}',
          to_jsonb(((payload->>'stock')::numeric + ${item.quantity}))
        )
        WHERE id = ${item.productId}
      `;
    }
    await sql`DELETE FROM shop_orders WHERE id = ${order.id}`;
    throw error;
  }
}

export async function getOrderRecord(id: string): Promise<{ order: Order; userId: string | null } | null> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown; user_id: string | null }>(
    await getSql()`SELECT payload, user_id FROM shop_orders WHERE id = ${id} LIMIT 1`,
  );
  const row = rows[0];
  if (!row) return null;
  return { order: asJson<Order>(row.payload), userId: row.user_id };
}

export async function getOrder(id: string): Promise<Order | null> {
  const record = await getOrderRecord(id);
  return record?.order ?? null;
}

export async function listAllOrders(): Promise<Order[]> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown }>(
    await getSql()`SELECT payload FROM shop_orders ORDER BY created_at DESC`,
  );
  return rows.map((row) => asJson<Order>(row.payload));
}

export async function saveOrder(order: Order) {
  await ensureDatabase();
  await getSql()`
    UPDATE shop_orders
    SET payload = ${JSON.stringify(order)}::jsonb
    WHERE id = ${order.id}
  `;
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  await ensureDatabase();
  const rows = asRows<{ payload: unknown }>(
    await getSql()`
      SELECT payload FROM shop_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `,
  );
  return rows.map((row) => asJson<Order>(row.payload));
}

export async function recordStoredFile(input: {
  id: string;
  userId: string;
  objectKey: string;
  contentType: string;
}) {
  await ensureDatabase();
  await getSql()`
    INSERT INTO stored_files (id, user_id, object_key, content_type)
    VALUES (${input.id}, ${input.userId}, ${input.objectKey}, ${input.contentType})
  `;
}
