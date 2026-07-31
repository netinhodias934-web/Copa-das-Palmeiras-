'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Team, Player, Staff } from '@/lib/types';

export default function TeamManagerPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Jogador
  const [playerName, setPlayerName] = useState('');
  const [shirtNumber, setShirtNumber] = useState('');
  const [playerDocument, setPlayerDocument] = useState('');

  // Form Comissão Técnica
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Técnico');
  const [staffDocument, setStaffDocument] = useState('');

  useEffect(() => {
    if (teamId) loadTeamData();
  }, [teamId]);

  async function loadTeamData() {
    // Buscar Dados do Time
    const { data: teamData } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (teamData) setTeam(teamData);

    // Buscar Jogadores
    const { data: playersData } = await supabase.from('players').select('*').eq('team_id', teamId).order('name', { ascending: true });
    if (playersData) setPlayers(playersData);

    // Buscar Comissão Técnica
    const { data: staffData } = await supabase.from('staff').select('*').eq('team_id', teamId).order('name', { ascending: true });
    if (staffData) setStaffList(staffData);

    setLoading(false);
  }

  // Cadastrar Jogador
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;

    await supabase.from('players').insert({
      team_id: teamId,
      name: playerName,
      shirt_number: shirtNumber ? parseInt(shirtNumber) : null,
      document_id: playerDocument || null,
    });

    setPlayerName('');
    setShirtNumber('');
    setPlayerDocument('');
    loadTeamData();
  };

  // Cadastrar Comissão Técnica
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName) return;

    await supabase.from('staff').insert({
      team_id: teamId,
      name: staffName,
      role: staffRole,
      document_id: staffDocument || null,
    });

    setStaffName('');
    setStaffDocument('');
    loadTeamData();
  };

  const handleDeletePlayer = async (id: string) => {
    if (confirm('Remover jogador?')) {
      await supabase.from('players').delete().eq('id', id);
      loadTeamData();
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Remover membro da comissão?')) {
      await supabase.from('staff').delete().eq('id', id);
      loadTeamData();
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-600">Carregando formulário da equipe...</div>;
  if (!team) return <div className="text-center py-20 text-red-600 font-bold">Equipe não encontrada ou link inválido.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-2">
      {/* Cabeçalho da Equipe */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-lg border-b-4 border-yellow-500 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-yellow-500 text-emerald-950 px-2 py-0.5 rounded font-black uppercase">Portal do Responsável</span>
          <h1 className="text-3xl font-black text-yellow-400 mt-1">{team.name}</h1>
          <p className="text-xs text-emerald-200">Inscreva os jogadores e a comissão técnica do seu time para o campeonato.</p>
        </div>
        {team.logo_url && <img src={team.logo_url} alt={team.name} className="h-16 w-16 object-contain bg-white/10 p-2 rounded-xl" />}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* SEÇÃO 1: JOGADORES (ELENCO) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <h2 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              ⚽ Cadastrar Jogador ({players.length})
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-2">
              <input
                type="text"
                placeholder="Nome Completo do Atleta"
                className="w-full border p-2.5 rounded-xl text-xs"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Nº da Camisa"
                  className="border p-2.5 rounded-xl text-xs"
                  value={shirtNumber}
                  onChange={(e) => setShirtNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="CPF ou RG"
                  className="border p-2.5 rounded-xl text-xs"
                  value={playerDocument}
                  onChange={(e) => setPlayerDocument(e.target.value)}
                />
              </div>
              <button className="w-full bg-emerald-900 text-yellow-400 font-bold py-2.5 rounded-xl text-xs shadow hover:bg-emerald-800 transition">
                + Adicionar Atleta
              </button>
            </form>
          </div>

          {/* Lista de Atletas */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-2">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Elenco Confirmado</h3>
            {players.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum atleta cadastrado ainda.</p>
            ) : (
              <div className="divide-y text-xs">
                {players.map((p) => (
                  <div key={p.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Camisa: {p.shirt_number || 'S/N'} {p.document_id ? `| Doc: ${p.document_id}` : ''}
                      </span>
                    </div>
                    <button onClick={() => handleDeletePlayer(p.id)} className="text-red-500 font-bold hover:underline text-[10px]">
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 2: COMISSÃO TÉCNICA */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <h2 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              📋 Cadastrar Comissão Técnica ({staffList.length})
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-2">
              <input
                type="text"
                placeholder="Nome do Profissional"
                className="w-full border p-2.5 rounded-xl text-xs"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="border p-2.5 rounded-xl text-xs font-bold text-slate-700"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Auxiliar Técnico">Auxiliar Técnico</option>
                  <option value="Preparador Físico">Preparador Físico</option>
                  <option value="Massagista / Fisioterapeuta">Massagista / Fisioterapeuta</option>
                  <option value="Diretor / Delegado">Diretor / Delegado</option>
                </select>
                <input
                  type="text"
                  placeholder="CPF ou Documento"
                  className="border p-2.5 rounded-xl text-xs"
                  value={staffDocument}
                  onChange={(e) => setStaffDocument(e.target.value)}
                />
              </div>
              <button className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs shadow hover:bg-slate-800 transition">
                + Adicionar Membro da Comissão
              </button>
            </form>
          </div>

          {/* Lista da Comissão */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-2">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Comissão Técnica Confirmada</h3>
            {staffList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum membro cadastrado ainda.</p>
            ) : (
              <div className="divide-y text-xs">
                {staffList.map((s) => (
                  <div key={s.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">{s.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded ml-2">
                        {s.role}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteStaff(s.id)} className="text-red-500 font-bold hover:underline text-[10px]">
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
