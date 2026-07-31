import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-emerald-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wide flex items-center gap-2">
          ⚽ Campeonato Local
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-emerald-200 transition">Tabela</Link>
          <Link href="/login" className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
            Área Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
