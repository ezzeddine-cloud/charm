import { Files } from 'files-sdk';
import { neon as neonStorage } from 'files-sdk/neon';
import { deleteStoredFiles, listCategories, listProducts } from '@/lib/db';
import { PRODUCT_BUCKET, storageKeyFromPublicUrl } from '@/lib/product-images';

export async function deleteUnusedProductImages(urls: string[], exceptProductId: string) {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const stillUsed = new Set<string>();

  for (const product of products) {
    if (product.id === exceptProductId) continue;
    for (const image of product.images ?? []) {
      const key = storageKeyFromPublicUrl(image);
      if (key) stillUsed.add(key);
    }
  }
  for (const category of categories) {
    const key = storageKeyFromPublicUrl(category.image);
    if (key) stillUsed.add(key);
  }

  const keys = [
    ...new Set(
      urls
        .map((url) => storageKeyFromPublicUrl(url))
        .filter((key): key is string => Boolean(key) && !stillUsed.has(key)),
    ),
  ];
  if (keys.length === 0) return;

  const files = new Files({ adapter: neonStorage({ bucket: PRODUCT_BUCKET }) });
  const removed = await files.delete(keys);
  const failed = (removed.errors ?? []).filter((item) => item.error.code !== 'NotFound');
  if (failed.length > 0) {
    throw new Error('La photo n’a pas pu être retirée du stockage.');
  }

  const gone = new Set([
    ...removed.results,
    ...(removed.errors ?? []).filter((item) => item.error.code === 'NotFound').map((item) => item.key),
  ]);
  await deleteStoredFiles([...gone].map((key) => `${PRODUCT_BUCKET}/${key}`));
}
