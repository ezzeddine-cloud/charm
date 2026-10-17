import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9A7235]">Charmies by Sousou</p>
        <h1 className="font-serif text-4xl">Cette page est introuvable</h1>
        <p className="text-sm text-[#8C7A70]">
          Le lien ne correspond à aucune page de la boutique. Vous pouvez revenir à l&apos;accueil ou
          parcourir les créations.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#2C2420] text-[#FAF7F2] rounded-md text-xs font-medium"
          >
            Accueil
          </Link>
          <Link
            href="/boutique"
            className="px-5 py-2.5 border border-[#E8DFD5] rounded-md text-xs font-medium"
          >
            Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
