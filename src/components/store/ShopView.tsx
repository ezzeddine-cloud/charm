import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { CategoryId } from '../../types';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

type Listing = 'all' | 'new' | 'bestsellers' | 'wishlist';

export const ShopView: React.FC<{ listing?: Listing; categorySlug?: string }> = ({
  listing = 'all',
  categorySlug,
}) => {
  const { products, categories, selectedCategoryId, navigateTo, wishlist } = useStore();

  const categoryFromSlug = categories.find((category) => category.slug === categorySlug);

  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>(
    categoryFromSlug?.id || (listing === 'all' ? selectedCategoryId || 'all' : 'all'),
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'under30' | '30to45' | 'over45'>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  React.useEffect(() => {
    if (categorySlug) {
      const category = categories.find((item) => item.slug === categorySlug);
      if (category) setActiveCategory(category.id);
      return;
    }
    if (listing === 'all') setActiveCategory(selectedCategoryId || 'all');
  }, [categorySlug, selectedCategoryId, listing, categories]);

  React.useEffect(() => {
    setVisibleCount(8);
  }, [activeCategory, searchFilter, priceRange, onlyInStock, sortBy, listing]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.published) return false;
      if (listing === 'new' && !p.isNewArrival) return false;
      if (listing === 'bestsellers' && !p.isBestSeller) return false;
      if (listing === 'wishlist' && !wishlist.includes(p.id)) return false;

      // Category
      if (activeCategory !== 'all' && p.categoryId !== activeCategory) {
        return false;
      }

      // Search
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.shortDescription.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSku) return false;
      }

      // Price
      if (priceRange === 'under30' && p.price >= 30) return false;
      if (priceRange === '30to45' && (p.price < 30 || p.price > 45)) return false;
      if (priceRange === 'over45' && p.price <= 45) return false;

      // Stock
      if (onlyInStock && p.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0;
    });
  }, [products, activeCategory, searchFilter, priceRange, onlyInStock, sortBy, listing, wishlist]);

  const hasActiveFilters =
    activeCategory !== 'all' ||
    priceRange !== 'all' ||
    onlyInStock ||
    searchFilter.trim() !== '';

  const clearAllFilters = () => {
    setActiveCategory('all');
    setPriceRange('all');
    setOnlyInStock(false);
    setSearchFilter('');
    setSortBy('popular');
    if (categorySlug || listing !== 'all') navigateTo('shop');
  };

  const selectedCategoryObj = categories.find((c) => c.id === activeCategory);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const listingTitle =
    listing === 'new'
      ? 'Nouveautés'
      : listing === 'bestsellers'
        ? 'Best-sellers'
        : listing === 'wishlist'
          ? 'Coups de cœur'
          : selectedCategoryObj
            ? selectedCategoryObj.name
            : 'Toutes nos créations';
  const listingDescription =
    listing === 'new'
      ? 'Les pièces récemment ajoutées à la boutique.'
      : listing === 'bestsellers'
        ? 'La sélection mise en avant en ce moment.'
        : listing === 'wishlist'
          ? 'Les bijoux que vous avez enregistrés dans ce navigateur.'
          : selectedCategoryObj
            ? selectedCategoryObj.description
            : 'Explorez la sélection de bijoux et d’accessoires.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8C7A70] mb-4">
        <button onClick={() => navigateTo('home')} className="hover:text-[#2C2420]">
          Accueil
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigateTo('shop')} className="hover:text-[#2C2420]">
          Boutique
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2C2420] font-medium">{listingTitle}</span>
      </nav>

      {/* Page Title & Intro */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2420] font-medium">
          {listingTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A70] mt-1.5 max-w-2xl">
          {listingDescription}
        </p>
        {categoryFromSlug && (
          <p className="text-xs text-[#9A7235] mt-3">
            {filteredProducts.length} pièce{filteredProducts.length > 1 ? 's' : ''} dans cette collection
          </p>
        )}
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD5]">
        {/* Category Tabs (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => navigateTo('shop')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              activeCategory === 'all' && listing === 'all'
                ? 'bg-[#2C2420] text-[#F5EFEB]'
                : 'bg-[#F4EADA] text-[#4A3E39] hover:bg-[#E8DACB]'
            }`}
          >
            Tous les bijoux
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateTo('category', { categoryId: cat.id })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.id && listing === 'all'
                  ? 'bg-[#2C2420] text-[#F5EFEB]'
                  : 'bg-[#F4EADA] text-[#4A3E39] hover:bg-[#E8DACB]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#F4EADA] text-xs font-medium text-[#2C2420]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres & Catégories</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#9A7235]" />
            )}
          </button>

          <span className="text-xs text-[#8C7A70]">
            {filteredProducts.length} articles
          </span>
        </div>

        {/* Right side controls: Search input & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Quick Search inside catalog */}
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-[#2C2420] placeholder-[#8C7A70] focus:outline-none focus:border-[#9A7235]"
            />
            <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-2.5 top-2.5" />
          </div>

          {/* Sort By Dropdown */}
          <div className="shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
            >
              <option value="popular">Popularité</option>
              <option value="newest">Nouveautés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Secondary Filter Strip (Price Presets & In-Stock) */}
      <div className="hidden lg:flex items-center justify-between py-3 text-xs text-[#8C7A70]">
        <div className="flex items-center gap-4">
          <span className="font-medium text-[#4A3E39]">Prix :</span>
          <button
            onClick={() => setPriceRange('all')}
            className={`hover:text-[#2C2420] ${priceRange === 'all' ? 'text-[#9A7235] font-semibold' : ''}`}
          >
            Tous
          </button>
          <span>·</span>
          <button
            onClick={() => setPriceRange('under30')}
            className={`hover:text-[#2C2420] ${priceRange === 'under30' ? 'text-[#9A7235] font-semibold' : ''}`}
          >
            Moins de 30 TND
          </button>
          <span>·</span>
          <button
            onClick={() => setPriceRange('30to45')}
            className={`hover:text-[#2C2420] ${priceRange === '30to45' ? 'text-[#9A7235] font-semibold' : ''}`}
          >
            30 TND – 45 TND
          </button>
          <span>·</span>
          <button
            onClick={() => setPriceRange('over45')}
            className={`hover:text-[#2C2420] ${priceRange === 'over45' ? 'text-[#9A7235] font-semibold' : ''}`}
          >
            Plus de 45 TND
          </button>

          <span className="text-[#E8DFD5]">|</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3E39]">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-[#9A7235] focus:ring-0"
            />
            <span>Uniquement en stock</span>
          </label>
        </div>

        <div>
          <span>{filteredProducts.length} bijoux disponibles</span>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs text-[#8C7A70]">Filtres actifs :</span>

          {activeCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F4EADA] text-[#2C2420] px-2.5 py-1 rounded-full">
              <span>Catégorie: {selectedCategoryObj?.name}</span>
              <button onClick={() => navigateTo('shop')} aria-label="Retirer le filtre catégorie">
                <X className="w-3 h-3 text-[#8C7A70] hover:text-[#2C2420]" />
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F4EADA] text-[#2C2420] px-2.5 py-1 rounded-full">
              <span>
                Prix: {priceRange === 'under30' ? '< 30 TND' : priceRange === '30to45' ? '30-45 TND' : '> 45 TND'}
              </span>
              <button onClick={() => setPriceRange('all')}>
                <X className="w-3 h-3 text-[#8C7A70] hover:text-[#2C2420]" />
              </button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F4EADA] text-[#2C2420] px-2.5 py-1 rounded-full">
              <span>En stock seulement</span>
              <button onClick={() => setOnlyInStock(false)}>
                <X className="w-3 h-3 text-[#8C7A70] hover:text-[#2C2420]" />
              </button>
            </span>
          )}

          {searchFilter && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F4EADA] text-[#2C2420] px-2.5 py-1 rounded-full">
              <span>Recherche: "{searchFilter}"</span>
              <button onClick={() => setSearchFilter('')}>
                <X className="w-3 h-3 text-[#8C7A70] hover:text-[#2C2420]" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-[#9A7235] hover:underline font-medium ml-1"
          >
            Tout réinitialiser
          </button>
        </div>
      )}

      {/* Product Grid or Empty State */}
      <div className="mt-6">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF7F2] border border-dashed border-[#E8DFD5] rounded-xl p-8">
            <Sparkles className="w-10 h-10 text-[#C69A58] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-medium text-[#2C2420] mb-1">
              Aucun bijou ne correspond à ces critères
            </h3>
            <p className="text-xs text-[#8C7A70] max-w-md mx-auto mb-6">
              Essayez d'élargir votre sélection ou de réinitialiser vos filtres de prix et de catégorie.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors"
            >
              Afficher toute la boutique
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {visibleCount < filteredProducts.length && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 8)}
              className="px-6 py-3 border border-[#2C2420] text-[#2C2420] rounded-md text-xs font-medium hover:bg-[#2C2420] hover:text-[#FAF7F2] transition-colors"
            >
              Afficher plus ({filteredProducts.length - visibleCount} restants)
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF7F2] p-5 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5]">
                <h3 className="font-serif text-base font-medium text-[#2C2420]">
                  Filtrer les Bijoux
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#8C7A70] hover:text-[#2C2420]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="py-4 border-b border-[#E8DFD5]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-2.5">
                  Catégories
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setMobileFilterOpen(false);
                      navigateTo('shop');
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-md text-xs ${
                      activeCategory === 'all' && listing === 'all'
                        ? 'bg-[#2C2420] text-white font-medium'
                        : 'text-[#4A3E39] hover:bg-[#F4EADA]'
                    }`}
                  >
                    Toutes les collections
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setMobileFilterOpen(false);
                        navigateTo('category', { categoryId: cat.id });
                      }}
                      className={`w-full text-left py-1.5 px-2 rounded-md text-xs flex justify-between ${
                        activeCategory === cat.id
                          ? 'bg-[#2C2420] text-white font-medium'
                          : 'text-[#4A3E39] hover:bg-[#F4EADA]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="opacity-70">{cat.itemCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="py-4 border-b border-[#E8DFD5]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-2.5">
                  Budget
                </h4>
                <div className="space-y-1.5 text-xs text-[#4A3E39]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobilePrice"
                      checked={priceRange === 'all'}
                      onChange={() => setPriceRange('all')}
                      className="text-[#9A7235]"
                    />
                    <span>Tous les prix</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobilePrice"
                      checked={priceRange === 'under30'}
                      onChange={() => setPriceRange('under30')}
                      className="text-[#9A7235]"
                    />
                    <span>Moins de 30 TND</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobilePrice"
                      checked={priceRange === '30to45'}
                      onChange={() => setPriceRange('30to45')}
                      className="text-[#9A7235]"
                    />
                    <span>30 TND à 45 TND</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobilePrice"
                      checked={priceRange === 'over45'}
                      onChange={() => setPriceRange('over45')}
                      className="text-[#9A7235]"
                    />
                    <span>Plus de 45 TND</span>
                  </label>
                </div>
              </div>

              {/* In Stock */}
              <div className="py-4">
                <label className="flex items-center gap-2 text-xs text-[#4A3E39] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded text-[#9A7235]"
                  />
                  <span>Afficher seulement les pièces en stock</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFD5] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 bg-[#2C2420] text-[#F5EFEB] rounded-md text-xs font-medium"
              >
                Appliquer ({filteredProducts.length} articles)
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full py-1.5 text-xs text-[#8C7A70] hover:text-[#2C2420]"
                >
                  Tout effacer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
