'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';

export function SearchView() {
  const { products, categories, navigateTo, searchQuery, setSearchQuery } = useStore();
  const [query, setQuery] = useState(searchQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    return products.filter((product) => {
      if (!product.published) return false;
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.shortDescription.toLowerCase().includes(normalized) ||
        product.sku.toLowerCase().includes(normalized)
      );
    });
  }, [products, normalized]);

  const suggestions = categories.filter(
    (category) =>
      !normalized ||
      category.name.toLowerCase().includes(normalized) ||
      category.description.toLowerCase().includes(normalized),
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(results.length - 1, index + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      navigateTo('product_detail', { productId: results[activeIndex].id });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9A7235]">Recherche</p>
      <h1 className="font-serif text-3xl sm:text-4xl mt-2">Trouver un bijou</h1>
      <label htmlFor="catalog-search" className="sr-only">
        Rechercher dans le catalogue
      </label>
      <div className="relative mt-6 max-w-2xl">
        <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-3.5" />
        <input
          id="catalog-search"
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Collier, bague, maille serpent, SKU…"
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DFD5] rounded-md text-sm"
        />
      </div>
      <p className="text-xs text-[#8C7A70] mt-2">
        Utilisez les flèches puis Entrée pour ouvrir un résultat.
      </p>

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-[#8C7A70] mb-3">Collections suggérées</h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((category) => (
            <button
              key={category.id}
              onClick={() => navigateTo('category', { categoryId: category.id })}
              className="px-3 py-1.5 rounded-full bg-[#F4EADA] text-xs hover:bg-[#E8DACB]"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {!normalized ? (
          <p className="text-sm text-[#8C7A70]">Commencez à écrire pour voir les pièces correspondantes.</p>
        ) : results.length === 0 ? (
          <div className="border border-dashed border-[#E8DFD5] rounded-xl p-10 text-center">
            <h2 className="font-serif text-2xl">Aucun résultat</h2>
            <p className="text-sm text-[#8C7A70] mt-2">
              Aucune pièce ne contient « {query.trim()} ». Essayez un autre mot ou une collection.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#8C7A70] mb-4">{results.length} pièce(s)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((product, index) => (
                <div
                  key={product.id}
                  className={index === activeIndex ? 'ring-1 ring-[#C69A58] rounded-md' : ''}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
