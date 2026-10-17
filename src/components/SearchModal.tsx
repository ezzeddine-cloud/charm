import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    products,
    categories,
    navigateTo,
  } = useStore();

  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.published &&
        (p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q))
    );
  }, [query, products]);

  if (!searchModalOpen) return null;

  const popularSearches = [
    'Collier cœur',
    'Maille serpent',
    'Bagues stacking',
    'Boucles grimpeuses',
    'Chouchou satin',
  ];

  const handleSelectProduct = (productId: string) => {
    setSearchModalOpen(false);
    navigateTo('product_detail', { productId });
  };

  const handleSelectCategory = (categoryId: any) => {
    setSearchModalOpen(false);
    navigateTo('category', { categoryId });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSearchModalOpen(false)}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-24">
        <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#E8DFD5] overflow-hidden">
          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center gap-3">
            <Search className="w-5 h-5 text-[#9A7235] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un bijou, une matière, un modèle..."
              autoFocus
              className="flex-1 bg-transparent text-sm sm:text-base text-[#2C2420] placeholder-[#8C7A70] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-[#8C7A70] hover:text-[#2C2420] px-2 py-1"
              >
                Effacer
              </button>
            )}
            <button
              onClick={() => setSearchModalOpen(false)}
              className="p-1.5 text-[#8C7A70] hover:text-[#2C2420] rounded-md hover:bg-[#F4EADA]"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 max-h-[65vh] overflow-y-auto">
            {!query.trim() ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-3">
                    Recherches fréquentes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-full text-xs bg-[#F4EADA] text-[#2C2420] hover:bg-[#E8DACB] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-3">
                    Explorer par collection
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className="p-2.5 rounded-md border border-[#E8DFD5] text-left hover:border-[#9A7235] hover:bg-[#F5EFEB] transition-colors group"
                      >
                        <div className="text-xs font-medium text-[#2C2420] group-hover:text-[#9A7235]">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-[#8C7A70] mt-0.5">
                          {cat.itemCount} articles
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-[#8C7A70]">
                <Sparkles className="w-8 h-8 text-[#C69A58] mx-auto mb-2 opacity-50" />
                <p className="font-serif text-base text-[#2C2420] mb-1">
                  Aucun bijou ne correspond à "{query}"
                </p>
                <p className="text-xs max-w-sm mx-auto">
                  Essayez un mot-clé plus court comme "collier", "bracelet", "or" ou explorez nos collections.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#8C7A70] mb-2">
                  {filteredProducts.length} résultat(s) trouvé(s)
                </div>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-[#F4EADA] cursor-pointer transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-[#FAF7F2] border border-[#E8DFD5] shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif text-sm font-medium text-[#2C2420] group-hover:text-[#9A7235] truncate">
                        {p.name}
                      </h5>
                      <p className="text-xs text-[#8C7A70] truncate mt-0.5">
                        {p.shortDescription}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-[#2C2420] tabular-nums block">
                        {p.price.toFixed(3)} TND
                      </span>
                      <span className="text-[10px] text-[#9A7235] flex items-center justify-end gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Voir <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
