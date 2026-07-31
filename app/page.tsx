'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Standing, Match, TopScorer } from '@/lib/types';

export default function HomePage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Busca Tabela
      const { data: standingsData } = await supabase.from('standings_view').select('*');
      if (standingsData) setStandings(standingsData);

      // Busca Partidas com dados dos times
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
        .order('match_date', { ascending: true });
      if (matchesData) setMatches(matchesData as any);

      // Busca Artilharia
      const { data: scorersData } = await supabase.from('top_scorers_view').select('*').limit(5);
      if (scorersData) setScorers(scorersData);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 font-medium">Carregando dados do campeonato...</div>;

  return (
    <div className="space-y-8">
      {/* Seção Tabela de Classificação */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white font-bold text-lg">Classificação Geral</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3">Pos</th>
                <th className="p-3">Time</th>
                <th className="p-3 text-center">PTS</th>
                <th className="p-3 text-center">J</th>
                <th className="p-3 text-center">V</th>
                <th className="p-3 text-center">E</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">GP</th>
                <th className="p-3 text-center">GC</th>
                <th className="p-3 text-center">SG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((team, idx) => (
                <tr key={team.team_id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-500">{idx + 1}º</td>
                  <td className="p-3 font-semibold">{team.team_name}</td>
                  <td className="p-3 text-center font-bold text-emerald-600">{team.pts}</td>
                  <td className="p-3 text-center">{team.j}</td>
                  <td className="p-3 text-center">{team.v}</td>
                  <td className="p-3 text-center">{team.e}</td>
                  <td className="p-3 text-center">{team.d}</td>
                  <td className="p-3 text-center">{team.gp}</td>
                  <td className="p-3 text-center">{team.gc}</td>
                  <td className="p-3 text-center font-medium">{team.sg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Seção Jogos */}
        <section className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-bold text-lg mb-4 text-slate-800">Partidas</h2>
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="w-2/5 text-right font-medium">{m.home_team?.name}</span>
                <span className="px-3 py-1 bg-slate-200 rounded font-bold text-sm">
                  {m.status === 'scheduled' ? 'VS' : `${m.home_score} - ${m.away_score}`}
                </span>
                <span className="w-2/5 text-left font-medium">{m.away_team?.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Seção Artilharia */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-bold text-lg mb-4 text-slate-800">Top Artilheiros</h2>
          <div className="space-y-3">
            {scorers.map((s, idx) => (
              <div key={s.player_id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <div className="font-semibold">{idx + 1}. {s.player_name}</div>
                  <div className="text-xs text-slate-500">{s.team_name}</div>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {s.goals} {s.goals === 1 ? 'gol' : 'gols'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
