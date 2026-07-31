'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Standing, Match, TopScorer, News, Sponsor } from '@/lib/types';
import GoogleAd from '@/components/GoogleAd';

export default function HomePage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: standingsData } = await supabase.from('standings_view').select('*');
      if (standingsData) setStandings(standingsData);

      const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(6);
      if (newsData) setNews(newsData);

      const { data: sponsorsData } = await supabase.from('sponsors').select('*').eq('active', true);
      if (sponsorsData) setSponsors(sponsorsData);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-emerald-900 font-black animate-pulse">Carregando Campeonato...</div>;

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto px-4">
      
      {/* 📢 ÁREA 1: GOOGLE ADS / BANNER TOPO */}
      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2 text-center shadow-inner mt-4">
        <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Publicidade (Google Ads)</span>
        <GoogleAd slot="1000000001" />
      </div>

      {/* 📰 ÁREA 2: FOTOS DO EVENTO E NOTÍCIAS DOS TIMES */}
      <div>
        <div className="flex items-center gap-2 mb-4 border-b-2 border-emerald-900 pb-2">
          <span className="bg-emerald-900 text-yellow-400 p-2 rounded-lg text-xl">📸</span>
          <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">Fotos & Notícias</h2>
        </div>
        
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                {/* Se a notícia tiver imagem, exibe grandão */}
                <img 
                  src={n.image_url || 'https://via.placeholder.com/600x400?text=Foto+do+Evento'} 
                  alt={n.title} 
                  className="w-full h-48 object-cover border-b" 
                />
                <div className="p-4">
                  <span className="text-[9px] bg-yellow-500 text-emerald-950 px-2 py-1 rounded font-black uppercase tracking-wider mb-2 inline-block">Destaque</span>
                  <h3 className="font-black text-emerald-950 text-sm leading-tight mb-2">{n.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3">{n.summary}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border border-dashed">As fotos e notícias do evento aparecerão aqui. (Poste no painel de Marketing).</p>
        )}
      </div>

      {/* 📢 ÁREA 3: GOOGLE ADS MEIO DA PÁGINA */}
      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2 text-center shadow-inner">
         <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Publicidade (Google Ads)</span>
         <GoogleAd slot="1000000002" />
      </div>

      {/* 🏆 ÁREA 4: TABELA DE CLASSIFICAÇÃO */}
      <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-emerald-950 text-yellow-400 font-black text-xl">
          Tabela de Classificação
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black border-b border-slate-300">
              <tr>
                <th className="p-4">Pos</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-center">PTS</th>
                <th className="p-4 text-center hidden md:table-cell">J</th>
                <th className="p-4 text-center hidden md:table-cell">V</th>
                <th className="p-4 text-center">SG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {standings.map((team, idx) => (
                <tr key={team.team_id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-black text-slate-400">{idx + 1}º</td>
                  <td className="p-4 font-black text-emerald-950">{team.team_name}</td>
                  <td className="p-4 text-center font-black text-emerald-700 bg-emerald-50/50 text-lg">{team.pts}</td>
                  <td className="p-4 text-center text-slate-500 hidden md:table-cell">{team.j}</td>
                  <td className="p-4 text-center text-slate-500 hidden md:table-cell">{team.v}</td>
                  <td className="p-4 text-center text-slate-500 font-bold">{team.sg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 💰 ÁREA 5: BARRA OFICIAL DE PATROCINADORES */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border-t-8 border-yellow-500 text-center">
        <h2 className="text-yellow-400 text-[11px] font-black uppercase tracking-[0.3em] mb-6">Patrocinadores Oficiais do Campeonato</h2>
        
        {sponsors.length > 0 ? (
          <div className="flex flex-wrap justify-center items-center gap-8">
            {sponsors.map(sponsor => (
              <div key={sponsor.id} className="bg-white p-4 rounded-xl shadow-md transform hover:scale-110 transition duration-300 cursor-pointer">
                {/* Imagem do Patrocinador Inserida via Admin */}
                <img 
                  src={sponsor.logo_url} 
                  alt={sponsor.name} 
                  className="h-16 md:h-20 w-auto object-contain max-w-[150px] md:max-w-[200px]" 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 text-slate-400 text-sm font-bold">
            Cadastre os patrocinadores no painel de Marketing para exibi-los aqui com destaque!
          </div>
        )}
      </div>

    </div>
  );
}
