'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Team, Match } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Checa autenticação
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
    });

    loadAdminData();
  }, [router]);

  async function loadAdminData() {
    const { data: teamsData } = await supabase.from('teams').select('*');
    if (teamsData) setTeams(teamsData);

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .order('match_date', { ascending: true });
    if (matchesData) setMatches(matchesData as any);
  }

  // Cadastrar Time
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    await supabase.from('teams').insert({ name: newTeamName });
    setNewTeamName('');
    loadAdminData();
  };

  // Cadastrar Partida
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !matchDate) return;
    await supabase.from('matches').insert({
      home_team_id: homeTeam,
      away_team_id: awayTeam,
      match_date: matchDate,
      status: 'scheduled',
    });
    loadAdminData();
  };

  // Atualizar Placar
  const handleUpdateScore = async (id: string, home_score: number, away_score: number, status: string) => {
    await supabase.from('matches').update({ home_score, away_score, status }).eq('id', id);
    loadAdminData();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Painel de Gerenciamento</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulário: Cadastrar Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Cadastrar Novo Time</h2>
          <form onSubmit={handleAddTeam} className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do Time"
              className="border p-2 rounded-lg flex-1"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">Adicionar</button>
          </form>
        </div>

        {/* Formulário: Criar Confronte */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Agendar Partida</h2>
          <form onSubmit={handleAddMatch} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select className="border p-2 rounded-lg" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}>
                <option value="">Mandante</option>
                {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
              <select className="border p-2 rounded-lg" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}>
                <option value="">Visitante</option>
                {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
            <input
              type="datetime-local"
              className="border p-2 rounded-lg w-full"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
            <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold">Criar Jogo</button>
          </form>
        </div>
      </div>

      {/* Lançar Resultados */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Lançar Placar e Encerrar Jogos</h2>
        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border">
              <span className="font-semibold w-1/3 text-right">{m.home_team?.name}</span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  defaultValue={m.home_score}
                  className="w-12 border text-center p-1 rounded font-bold"
                  id={`home-${m.id}`}
                />
                <span>x</span>
                <input
                  type="number"
                  defaultValue={m.away_score}
                  className="w-12 border text-center p-1 rounded font-bold"
                  id={`away-${m.id}`}
                />
              </div>
              <span className="font-semibold w-1/3 text-left">{m.away_team?.name}</span>
              <div className="w-full flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    const home = parseInt((document.getElementById(`home-${m.id}`) as HTMLInputElement).value);
                    const away = parseInt((document.getElementById(`away-${m.id}`) as HTMLInputElement).value);
                    handleUpdateScore(m.id, home, away, 'finished');
                  }}
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold"
                >
                  Salvar e Encerrar Partida
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
