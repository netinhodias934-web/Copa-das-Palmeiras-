import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-emerald-950 text-white shadow-lg border-b border-yellow-600/30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-extrabold tracking-wide flex items-center gap-2 text-yellow-500">
          🌴 Copa das Palmeiras
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-yellow-400 font-medium transition">Tabela</Link>
          <Link href="/login" className="bg-yellow-600 hover:bg-yellow-500 text-emerald-950 font-bold px-3 py-1.5 rounded-lg text-sm transition">
            Área Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
