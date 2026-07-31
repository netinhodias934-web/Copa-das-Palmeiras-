import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Meu Campeonato de Futebol',
  description: 'Acompanhe os jogos, tabela e artilharia do campeonato.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
