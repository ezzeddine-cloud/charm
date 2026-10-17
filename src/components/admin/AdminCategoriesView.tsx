import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category, CategoryId } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const AdminCategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, showToast } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
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
    body.append('kind', 'category');
    const response = await fetch('/api/catalog/image', { method: 'POST', body });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setUploadingPhoto(false);
    if (!response.ok || !payload.url) {
      showToast(payload.error || 'La photo n’a pas pu être envoyée.', 'error');
      return;
    }
    setImage(payload.url);
    showToast('Photo enregistrée sur Neon.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Le nom de la catégorie est obligatoire.', 'error');
      return;
    }
    if (!image) {
      showToast('Ajoutez une photo de la catégorie.', 'error');
      return;
    }

    const saved = editingCategory
      ? await updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          image,
        })
      : await addCategory({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
          description: description.trim(),
          image,
        });
    if (!saved) return;

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#2C2420] font-medium">
            Catégories du Magasin ({categories.length})
          </h1>
          <p className="text-xs text-[#8C7A70] mt-0.5">
            Organisez les collections pour la navigation et les filtres de la boutique.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#2C2420] text-white rounded-md text-xs font-medium hover:bg-[#1A1614] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C69A58]" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#E8DFD5] shrink-0">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#2C2420]">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-[#9A7235] font-medium">
                    {cat.itemCount} bijoux actifs
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#615249] line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#8C7A70] font-mono">slug: {cat.slug}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1 text-[#8C7A70] hover:text-[#9A7235] rounded"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 text-[#8C7A70] hover:text-rose-700 rounded"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#E8DFD5] overflow-hidden">
            <div className="p-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#F5EFEB]">
              <h3 className="font-serif text-base font-medium text-[#2C2420]">
                {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8C7A70] hover:text-[#2C2420]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[#4A3E39] block mb-1 font-medium">Nom de la collection *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Puces d'Oreilles"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div>
                <label className="text-[#4A3E39] block mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Courte description pour la page..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md focus:outline-none focus:border-[#9A7235]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#4A3E39] block font-medium">Photo de la catégorie</label>
                <div className="flex items-center gap-3">
                  {image ? (
                    <img src={image} alt="" className="h-16 w-16 rounded-md object-cover border border-[#E8DFD5]" />
                  ) : (
                    <div className="h-16 w-16 rounded-md border border-dashed border-[#C69A58] bg-white" />
                  )}
                  <label className="text-[#4A3E39]">
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
                  JPG, PNG ou WebP. Maximum 4 Mo (4 096 Ko).
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E8DFD5] text-[#8C7A70] rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-4 py-1.5 bg-[#2C2420] text-white rounded-md font-medium hover:bg-[#1A1614] disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
