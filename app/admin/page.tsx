'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Team, Match } from '@/lib/types';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'matches'>('dashboard');
  
  // Estados para Times
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [teamGroup, setTeamGroup] = useState('A');

  // Estados para Jogos
  const [matches, setMatches] = useState<Match[]>([]);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchRound, setMatchRound] = useState(1);
  const [matchDate, setMatchDate] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Dashboard / Estatísticas gerais
  const [stats, setStats] = useState({ teamsCount: 0, matchesCount: 0, finishedCount: 0 });

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    // Carregar Times
    const { data: teamsData } = await supabase.from('teams').select('*').order('name');
    if (teamsData) setTeams(teamsData);

    // Carregar Jogos
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .order('match_date', { ascending: true });
    if (matchesData) setMatches(matchesData as any);

    // Estatísticas
    const { count: tCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const { count: mCount } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    const { count: fCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished');

    setStats({
      teamsCount: tCount || 0,
      matchesCount: mCount || 0,
      finishedCount: fCount || 0,
    });
  }

  // Cadastrar Time
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    const { error } = await supabase.from('teams').insert({
      name: teamName,
      logo_url: teamLogo || null,
      group_name: teamGroup,
    });

    if (error) {
      alert('Erro ao cadastrar time: ' + error.message);
    } else {
      alert('Time cadastrado com sucesso!');
      setTeamName('');
      setTeamLogo('');
      loadAdminData();
    }
  };

  // Excluir Time
  const handleDeleteTeam = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este time? Todos os jogadores e vínculos serão apagados.')) {
      await supabase.from('teams').delete().eq('id', id);
      loadAdminData();
    }
  };

  // Cadastrar Jogo
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      alert('Selecione times válidos e diferentes para a partida.');
      return;
    }

    const { error } = await supabase.from('matches').insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      round: Number(matchRound),
      match_date: matchDate ? new Date(matchDate).toISOString() : null,
      youtube_url: youtubeUrl || null,
      status: 'scheduled',
    });

    if (error) {
      alert('Erro ao agendar jogo: ' + error.message);
    } else {
      alert('Partida agendada com sucesso!');
      setHomeTeamId('');
      setAwayTeamId('');
      setYoutubeUrl('');
      loadAdminData();
    }
  };

  // Atualizar Placar ou Transmissão do Jogo
  const handleUpdateMatchScore = async (matchId: string, homeScore: number, awayScore: number, status: string, ytUrl?: string) => {
    await supabase.from('matches').update({
      home_score: homeScore,
      away_score: awayScore,
      status: status,
      youtube_url: ytUrl !== undefined ? ytUrl : undefined,
    }).eq('id', matchId);
    
    loadAdminData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 px-2">
      
      {/* Cabeçalho do Painel Admin */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border-b-4 border-yellow-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-red-600 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Gestão Esportiva</span>
          <h1 className="text-3xl font-black text-yellow-400 mt-1">Painel Administrativo</h1>
          <p className="text-xs text-slate-300">Organização de equipes, cruzamentos, súmulas e placares.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/marketing" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5">
            📺 Ir para TV CPM & Marketing
          </Link>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition">
            🌐 Ver Site Público
          </Link>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-2xl shadow-sm border text-center">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 text-xs font-bold rounded-xl transition ${activeTab === 'dashboard' ? 'bg-emerald-950 text-yellow-400 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          📊 Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`py-3 text-xs font-bold rounded-xl transition ${activeTab === 'teams' ? 'bg-emerald-950 text-yellow-400 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          👥 Times & Links dos Responsáveis
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`py-3 text-xs font-bold rounded-xl transition ${activeTab === 'matches' ? 'bg-emerald-950 text-yellow-400 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          ⚽ Jogos & Súmulas
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: DASHBOARD / VISÃO GERAL */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Total de Times</p>
              <h3 className="text-3xl font-black text-emerald-950 mt-1">{stats.teamsCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold">🛡️</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Partidas Cadastradas</p>
              <h3 className="text-3xl font-black text-emerald-950 mt-1">{stats.matchesCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold">⚽</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Jogos Realizados</p>
              <h3 className="text-3xl font-black text-emerald-950 mt-1">{stats.finishedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center text-xl font-bold">🏆</div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: TIMES & LINKS DOS RESPONSÁVEIS */}
      {/* ========================================================= */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Formulário de Cadastro de Time */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">🛡️ Cadastrar Nova Equipe no Campeonato</h3>
            <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Nome da Equipe"
                className="border p-2.5 rounded-xl text-xs"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL do Escudo / Logo (Opcional)"
                className="border p-2.5 rounded-xl text-xs"
                value={teamLogo}
                onChange={(e) => setTeamLogo(e.target.value)}
              />
              <select
                className="border p-2.5 rounded-xl text-xs font-bold text-slate-700"
                value={teamGroup}
                onChange={(e) => setTeamGroup(e.target.value)}
              >
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="C">Grupo C</option>
                <option value="D">Grupo D</option>
              </select>
              <button className="bg-emerald-900 hover:bg-emerald-800 text-yellow-400 font-bold py-2.5 rounded-xl text-xs shadow transition">
                + Cadastrar Time
              </button>
            </form>
          </div>

          {/* Lista de Times com Link do Responsável */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">📋 Equipes Inscritas & Links de Inscrição dos Elencos</h3>
            <p className="text-xs text-slate-500">
              Copie o link exclusivo de cada time e envie para o respectivo responsável cadastrar os jogadores e a comissão técnica pelo celular.
            </p>

            <div className="space-y-3 pt-2">
              {teams.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum time cadastrado até o momento.</p>
              ) : (
                teams.map((team) => (
                  <div key={team.id} className="bg-slate-50 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-10 h-10 object-contain bg-white rounded-lg p-1 border" />
                      ) : (
                        <div className="w-10 h-10 bg-emerald-950 text-yellow-400 font-bold flex items-center justify-center rounded-lg text-xs">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{team.name}</h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                          Grupo {team.group_name || 'A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {/* BOTÃO COPIAR LINK DO RESPONSÁVEL */}
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/equipe/${team.id}`;
                          navigator.clipboard.writeText(link);
                          alert(`🔗 Link do responsável copiado!\n\nEnvie este link para o responsável do time ${team.name}:\n${link}`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        🔗 Copiar Link do Responsável
                      </button>

                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 3: JOGOS & SÚMULAS */}
      {/* ========================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Cadastro de Jogos */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">⚽ Agendar Nova Partida / Transmissão</h3>
            <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select
                className="border p-2.5 rounded-xl text-xs font-bold text-slate-700"
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                required
              >
                <option value="">Mandante (Casa)</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select
                className="border p-2.5 rounded-xl text-xs font-bold text-slate-700"
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                required
              >
                <option value="">Visitante (Fora)</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <input
                type="number"
                placeholder="Rodada (ex: 1)"
                className="border p-2.5 rounded-xl text-xs"
                value={matchRound}
                onChange={(e) => setMatchRound(Number(e.target.value))}
                required
              />

              <input
                type="datetime-local"
                className="border p-2.5 rounded-xl text-xs"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />

              <button className="bg-emerald-900 hover:bg-emerald-800 text-yellow-400 font-bold py-2.5 rounded-xl text-xs shadow transition">
                + Agendar Jogo
              </button>
            </form>
          </div>

          {/* Listagem e Súmulas das Partidas */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">📋 Gerenciar Placares e Transmissões (Súmula)</h3>
            
            <div className="space-y-3 pt-2">
              {matches.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma partida agendada.</p>
              ) : (
                matches.map((m) => (
                  <div key={m.id} className="bg-slate-50 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rodada {m.round}</span>
                      <div className="font-bold text-slate-800 text-sm">
                        {m.home_team?.name || 'Mandante'} <span className="text-emerald-700 font-black">vs</span> {m.away_team?.name || 'Visitante'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-14 text-center border rounded-lg p-1 text-sm font-black"
                        defaultValue={m.home_score}
                        id={`home_${m.id}`}
                      />
                      <span className="font-bold text-slate-400">×</span>
                      <input
                        type="number"
                        className="w-14 text-center border rounded-lg p-1 text-sm font-black"
                        defaultValue={m.away_score}
                        id={`away_${m.id}`}
                      />

                      <select
                        className="border rounded-lg p-1.5 text-xs font-bold text-slate-700"
                        defaultValue={m.status}
                        id={`status_${m.id}`}
                      >
                        <option value="scheduled">Agendado</option>
                        <option value="live">Ao Vivo 🔴</option>
                        <option value="finished">Encerrado</option>
                      </select>

                      <button
                        onClick={() => {
                          const hScore = Number((document.getElementById(`home_${m.id}`) as HTMLInputElement).value);
                          const aScore = Number((document.getElementById(`away_${m.id}`) as HTMLInputElement).value);
                          const stat = (document.getElementById(`status_${m.id}`) as HTMLSelectElement).value;
                          handleUpdateMatchScore(m.id, hScore, aScore, stat);
                          alert('Súmula atualizada com sucesso!');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
