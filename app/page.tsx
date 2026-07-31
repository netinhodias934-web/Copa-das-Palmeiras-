'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Standing, Match, TopScorer, News, Sponsor } from '@/lib/types';
import GoogleAd from '@/components/GoogleAd';

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function HomePage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: standingsData } = await supabase.from('standings_view').select('*');
      if (standingsData) setStandings(standingsData);

      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
        .order('match_date', { ascending: true });
      if (matchesData) setMatches(matchesData as any);

      const { data: scorersData } = await supabase.from('top_scorers_view').select('*').limit(3);
      if (scorersData) setScorers(scorersData);

      const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(6);
      if (newsData) setNews(newsData);

      const { data: sponsorsData } = await supabase.from('sponsors').select('*').eq('active', true);
      if (sponsorsData) setSponsors(sponsorsData);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-emerald-900 font-black animate-pulse">Carregando Portal...</div>;

  const nextMatch = matches.find(m => m.status === 'scheduled');
  const videoNews = news.filter(n => n.youtube_url);
  const textNews = news.filter(n => !n.youtube_url);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 📢 ESPAÇO DE ANÚNCIO NO TOPO (BANNEER SUPERIOR GOOGLE ADS) */}
      <GoogleAd slot="1000000001" />

      {/* 📺 DESTAQUE PRINCIPAL DA TV CPM OU PRÓXIMA PARTIDA */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-950 rounded-2xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden border-2 border-red-600">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            TV CPM Ao Vivo
          </div>
          
          {nextMatch ? (
            <div className="text-center w-full">
              {nextMatch.youtube_url ? (
                <div className="mt-6 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-red-900">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(nextMatch.youtube_url)}?autoplay=0`}
                    title="TV CPM Ao Vivo"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Rodada {nextMatch.round}</span>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-2xl md:text-4xl font-black w-1/3 text-right">{nextMatch.home_team?.name}</div>
                    <div className="text-yellow-400 font-black text-2xl bg-black/50 px-4 py-2 rounded-xl">VS</div>
                    <div className="text-2xl md:text-4xl font-black w-1/3 text-left">{nextMatch.away_team?.name}</div>
                  </div>
                  <p className="text-xs text-slate-300 bg-white/10 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
                    Transmissão exclusiva na TV CPM. Prepare sua torcida!
                  </p>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center mt-8 text-slate-400">Nenhum jogo agendado no momento.</div>
          )}
        </div>

        {/* Craque do Campeonato */}
        <div className="bg-yellow-500 rounded-2xl p-5 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="text-yellow-900 text-[10px] font-black uppercase tracking-widest mb-2">⭐ Craque do Campeonato</div>
          {scorers.length > 0 ? (
            <>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-emerald-900">
                👑
              </div>
              <h3 className="font-black text-emerald-950 text-xl leading-tight">{scorers[0].player_name}</h3>
              <p className="text-emerald-900 font-bold text-xs">{scorers[0].team_name}</p>
              <div className="mt-3 bg-emerald-950 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                {scorers[0].goals} Gols
              </div>
            </>
          ) : (
            <p className="text-emerald-900 font-bold text-sm">Campeonato em andamento!</p>
          )}
        </div>
      </div>

      {/* 📹 SEÇÃO DEDICADA: TV CPM (VÍDEOS E CHAMADAS) */}
      {videoNews.length > 0 && (
        <div className="bg-slate-950 rounded-2xl p-5 shadow-lg border-t-4 border-red-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              🎬 TV CPM <span className="text-xs text-red-500 font-bold uppercase">Chamadas e Destaques</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videoNews.map((n) => (
              <div key={n.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(n.youtube_url!)}`}
                    title={n.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-yellow-400 text-xs leading-tight mb-1">{n.title}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{n.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📢 ESPAÇO DE ANÚNCIO INTERMEDIÁRIO (GOOGLE ADS / AGÊNCIA) */}
      <GoogleAd slot="1000000002" />

      {/* TABELA DE CLASSIFICAÇÃO & RESULTADOS */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-950 text-yellow-400 font-extrabold text-lg flex justify-between items-center">
              <span>🏆 Classificação Geral</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Pos</th>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-center">PTS</th>
                    <th className="p-3 text-center">J</th>
                    <th className="p-3 text-center">V</th>
                    <th className="p-3 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {standings.map((team, idx) => (
                    <tr key={team.team_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}º</td>
                      <td className="p-3 font-bold text-emerald-950">{team.team_name}</td>
                      <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/50">{team.pts}</td>
                      <td className="p-3 text-center text-slate-500">{team.j}</td>
                      <td className="p-3 text-center text-slate-500">{team.v}</td>
                      <td className="p-3 text-center text-slate-500 font-medium">{team.sg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-bold text-base mb-3 text-slate-800 flex items-center gap-2">✅ Últimos Resultados</h2>
            <div className="space-y-2">
              {matches.filter(m => m.status === 'finished').slice(-4).reverse().map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border text-xs">
                  <span className="w-2/5 text-right font-semibold text-slate-700 truncate px-1">{m.home_team?.name}</span>
                  <span className="bg-emerald-950 text-white px-2 py-1 rounded font-black tracking-wider">
                    {m.home_score} - {m.away_score}
                  </span>
                  <span className="w-2/5 text-left font-semibold text-slate-700 truncate px-1">{m.away_team?.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 💰 VITRINE DE PATROCINADORES */}
      {sponsors.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-slate-200 border-dashed text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Patrocinadores Oficiais</p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {sponsors.map(sponsor => (
              <div key={sponsor.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:scale-105 transition">
                <img src={sponsor.logo_url} alt={sponsor.name} className="h-12 object-contain max-w-[120px]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📢 ESPAÇO DE ANÚNCIO NO RODAPÉ */}
      <GoogleAd slot="1000000003" />

    </div>
  );
}
