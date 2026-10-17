import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryId } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminProductsView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, showToast } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryId | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('necklaces');
  const [formPrice, setFormPrice] = useState('35.000');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formLowStock, setFormLowStock] = useState('3');
  const [formMaterial, setFormMaterial] = useState('Acier inoxydable 316L doré à l\'or fin 18k');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formDimensions, setFormDimensions] = useState('Longueur 42cm + 5cm extension');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formPublished, setFormPublished] = useState(true);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`CHM-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory('necklaces');
    setFormPrice('35.000');
    setFormOriginalPrice('');
    setFormStock('12');
    setFormLowStock('3');
    setFormMaterial('Acier inoxydable 316L hypoallergénique doré à l\'or fin 18k');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormDimensions('Longueur standard réglable');
    setFormImageUrl('');
    setFormIsNew(true);
    setFormIsBestSeller(false);
    setFormPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.categoryId);
    setFormPrice(p.price.toString());
    setFormOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    setFormStock(p.stock.toString());
    setFormLowStock(p.lowStockThreshold.toString());
    setFormMaterial(p.material);
    setFormShortDesc(p.shortDescription);
    setFormFullDesc(p.fullDescription);
    setFormDimensions(p.dimensions || '');
    setFormImageUrl(p.images[0] || '');
    setFormIsNew(!!p.isNewArrival);
    setFormIsBestSeller(!!p.isBestSeller);
    setFormPublished(p.published);
    setModalOpen(true);
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Photo trop lourde. Maximum 4 Mo (4 096 Ko).', 'error');
      return;
    }
    setUploadingPhoto(true);
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/catalog/image', { method: 'POST', body });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setUploadingPhoto(false);
    if (!response.ok || !payload.url) {
      showToast(payload.error || 'La photo n’a pas pu être envoyée.', 'error');
      return;
    }
    setFormImageUrl(payload.url);
    showToast('Photo enregistrée sur Neon.', 'success');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      showToast('Veuillez renseigner le nom et le prix du bijou.', 'error');
      return;
    }
    if (!formImageUrl) {
      showToast('Ajoutez une photo du bijou avant d’enregistrer.', 'error');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const origPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;
    const stockNum = parseInt(formStock, 10) || 0;
    const lowStockNum = parseInt(formLowStock, 10) || 3;

    const saved = editingProduct
      ? await updateProduct(editingProduct.id, {
        name: formName.trim(),
        sku: formSku.trim(),
        categoryId: formCategory,
        price: priceNum,
        originalPrice: origPriceNum,
        stock: stockNum,
        lowStockThreshold: lowStockNum,
        material: formMaterial,
        shortDescription: formShortDesc,
        fullDescription: formFullDesc,
        dimensions: formDimensions,
        images: [formImageUrl],
        isNewArrival: formIsNew,
        isBestSeller: formIsBestSeller,
        published: formPublished,
      })
      : await addProduct({
        name: formName.trim(),
        slug: formName.toLowerCase().replace(/\s+/g, '-'),
        sku: formSku.trim(),
        categoryId: formCategory,
        price: priceNum,
        originalPrice: origPriceNum,
        stock: stockNum,
        lowStockThreshold: lowStockNum,
        material: formMaterial,
        shortDescription: formShortDesc || 'Bijou délicat en acier inoxydable.',
        fullDescription: formFullDesc || 'Création raffinée pour sublimer votre quotidien.',
        dimensions: formDimensions,
        images: [formImageUrl],
        isNewArrival: formIsNew,
        isBestSeller: formIsBestSeller,
        isFeatured: true,
        published: formPublished,
      });
    if (!saved) return;

    setModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
            Gestion du Catalogue ({products.length} bijoux)
          </h1>
          <p className="text-xs text-[#8C7A70] mt-0.5">
            Créez, modifiez et gérez la visibilité de vos créations en temps réel.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2C2420] text-white rounded-md text-xs font-medium hover:bg-[#1A1614] transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C69A58]" />
          <span>Ajouter un bijou</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[#8C7A70] shrink-0">Catégorie :</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as any)}
            className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs text-[#2C2420] focus:outline-none focus:border-[#9A7235]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFEB] text-[#8C7A70] uppercase tracking-wider text-[10px] border-b border-[#E8DFD5]">
              <tr>
                <th className="py-3 px-4">Bijou & SKU</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix Public</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Visibilité</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5]/60 text-[#4A3E39]">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const isLow = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-[#F5EFEB]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#2C2420] font-serif block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#8C7A70]">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{cat?.name || p.categoryId}</td>
                    <td className="py-3 px-4 font-semibold text-[#2C2420] tabular-nums">
                      {p.price.toFixed(3)} TND
                      {p.originalPrice && (
                        <span className="block text-[10px] text-[#8C7A70] line-through">
                          {p.originalPrice.toFixed(3)} TND
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold tabular-nums ${
                          p.stock <= 0
                            ? 'text-rose-700'
                            : isLow
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {p.stock} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isNewArrival && (
                          <span className="text-[9px] bg-[#F4EADA] text-[#9A7235] px-1.5 py-0.5 rounded-xs font-semibold">
                            Nouveau
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="text-[9px] bg-[#E8DACB] text-[#4A3E39] px-1.5 py-0.5 rounded-xs font-semibold">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateProduct(p.id, { published: !p.published })}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                          p.published
                            ? 'text-emerald-800 bg-emerald-50'
                            : 'text-[#8C7A70] bg-gray-100'
                        }`}
                      >
                        {p.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.published ? 'En ligne' : 'Masqué'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-[#8C7A70] hover:text-[#9A7235] rounded hover:bg-[#F4EADA]"
                          title="Modifier le produit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1 text-[#8C7A70] hover:text-rose-700 rounded hover:bg-rose-50"
                          title="Supprimer le produit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-8">
            <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-[#F5EFEB]/60">
              <h3 className="font-serif text-lg font-medium text-[#2C2420]">
                {editingProduct ? 'Modifier le Bijou' : 'Ajouter une Nouvelle Création'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#8C7A70] hover:text-[#2C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[#4A3E39] block mb-1 font-medium">Nom du Bijou *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Collier Cœur Nacré"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Référence SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Catégorie *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Prix de vente (TND) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Prix barré / Promo (Optionnel)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="ex: 45.000"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Quantité en Stock *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div>
                  <label className="text-[#4A3E39] block mb-1 font-medium">Seuil d'alerte stock faible</label>
                  <input
                    type="number"
                    value={formLowStock}
                    onChange={(e) => setFormLowStock(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#4A3E39] block mb-1 font-medium">Matières & Finition</label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="Acier inoxydable 316L doré..."
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#4A3E39] block mb-1 font-medium">Dimensions & Porté</label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    placeholder="Longueur 42cm..."
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[#4A3E39] block font-medium">Photo du bijou</label>
                  <div className="flex items-center gap-3">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="" className="h-16 w-16 rounded-md object-cover border border-[#E8DFD5]" />
                    ) : (
                      <div className="h-16 w-16 rounded-md border border-dashed border-[#C69A58] bg-white" />
                    )}
                    <label className="text-xs text-[#4A3E39]">
                      <span className="inline-flex cursor-pointer rounded-md bg-[#2C2420] px-3 py-2 text-white">
                        {uploadingPhoto ? 'Envoi…' : 'Choisir une photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingPhoto}
                        className="sr-only"
                        onChange={(event) => {
                          handlePhoto(event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#8C7A70]">
                    JPG, PNG ou WebP. Maximum 4 Mo par photo, soit 4 096 Ko. Le plan gratuit Neon
                    garde 5 Go pour toutes les photos du projet. L’envoi est réservé à une adresse autorisée.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#4A3E39] block mb-1 font-medium">Courte Description</label>
                  <textarea
                    rows={2}
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="Présentation pour la carte produit..."
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsNew}
                      onChange={(e) => setFormIsNew(e.target.checked)}
                      className="rounded text-[#9A7235]"
                    />
                    <span>Marquer comme Nouveauté</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="rounded text-[#9A7235]"
                    />
                    <span>Marquer comme Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPublished}
                      onChange={(e) => setFormPublished(e.target.checked)}
                      className="rounded text-[#9A7235]"
                    />
                    <span>Visible sur la boutique en ligne</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DFD5] text-[#8C7A70] hover:text-[#2C2420] rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-5 py-2 bg-[#2C2420] text-white rounded-md font-medium hover:bg-[#1A1614] disabled:opacity-50"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Créer le bijou'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#FAF7F2] rounded-xl p-5 border border-[#E8DFD5] space-y-4">
            <h4 className="font-serif text-base font-semibold text-rose-950">
              Confirmer la suppression
            </h4>
            <p className="text-xs text-[#615249]">
              Êtes-vous sûre de vouloir supprimer ce bijou du catalogue ? Cette action est irréversible dans la session actuelle.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#E8DFD5] text-xs text-[#8C7A70] rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-rose-700 text-white text-xs rounded-md font-medium hover:bg-rose-800"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
