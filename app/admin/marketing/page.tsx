'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { News, Sponsor } from '@/lib/types';
import Link from 'next/link';

export default function MarketingAdminPage() {
  const [activeTab, setActiveTab] = useState<'tv_cpm' | 'sponsors' | 'ads'>('tv_cpm');
  
  // Estados TV CPM e Notícias
  const [newsList, setNewsList] = useState<News[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Estados Patrocinadores
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [sponsorTier, setSponsorTier] = useState('master');

  useEffect(() => {
    loadMarketingData();
  }, []);

  async function loadMarketingData() {
    const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (newsData) setNewsList(newsData);

    const { data: sponsorsData } = await supabase.from('sponsors').select('*');
    if (sponsorsData) setSponsors(sponsorsData);
  }

  // Criar Post / Vídeo na TV CPM
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await supabase.from('news').insert({
      title,
      summary,
      image_url: imageUrl || null,
      youtube_url: youtubeUrl || null,
    });

    setTitle('');
    setSummary('');
    setImageUrl('');
    setYoutubeUrl('');
    alert('Conteúdo publicado com sucesso na TV CPM!');
    loadMarketingData();
  };

  // Cadastrar Patrocinador
  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !sponsorLogo) return;

    await supabase.from('sponsors').insert({
      name: sponsorName,
      logo_url: sponsorLogo,
      tier: sponsorTier,
      active: true,
    });

    setSponsorName('');
    setSponsorLogo('');
    alert('Patrocinador cadastrado!');
    loadMarketingData();
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Deseja excluir esta matéria/vídeo?')) {
      await supabase.from('news').delete().eq('id', id);
      loadMarketingData();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Cabecalho Mídia & Marketing */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border-b-4 border-yellow-500 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-yellow-400">📺 Painel Marketing & TV CPM</h1>
          <p className="text-xs text-slate-300">Gestão de Vídeos, Notícias, Patrocinadores e Ads</p>
        </div>
        <Link href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-bold border border-slate-600">
          ⚙️ Ir para Gestão dos Jogos
        </Link>
      </div>

      {/* Navegação por Abas do Marketing */}
      <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl shadow-sm border text-center">
        <button
          onClick={() => setActiveTab('tv_cpm')}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'tv_cpm' ? 'bg-red-600 text-white' : 'text-slate-600'
          }`}
        >
          🎬 TV CPM & Notícias
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'sponsors' ? 'bg-emerald-900 text-yellow-400' : 'text-slate-600'
          }`}
        >
          💎 Patrocinadores
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'ads' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          📢 Agência / Google Ads
        </button>
      </div>

      {/* ABA 1: TV CPM & NOTÍCIAS */}
      {activeTab === 'tv_cpm' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">📹 Publicar na TV CPM ou Feed de Notícias</h3>
            <form onSubmit={handleCreateNews} className="space-y-3">
              <input
                type="text"
                placeholder="Título da Notícia ou Vídeo (ex: Chamada Oficial da Rodada 3)"
                className="w-full border p-2.5 rounded-lg text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Resumo ou descrição do vídeo..."
                className="w-full border p-2.5 rounded-lg text-xs h-20"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="url"
                  placeholder="Link do YouTube (Para aparecer na TV CPM)"
                  className="border p-2.5 rounded-lg text-xs"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="URL da Imagem de Capa (Opcional)"
                  className="border p-2.5 rounded-lg text-xs"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <button className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs shadow hover:bg-red-700">
                📺 Publicar na TV CPM
              </button>
            </form>
          </div>

          {/* Lista de Conteúdos */}
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">📋 Conteúdos Publicados</h3>
            <div className="space-y-2">
              {newsList.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {item.youtube_url ? '🎬 Vídeo TV CPM' : '📰 Matéria'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PATROCINADORES */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">💰 Cadastrar Novo Patrocinador</h3>
            <form onSubmit={handleCreateSponsor} className="space-y-3">
              <input
                type="text"
                placeholder="Nome da Empresa / Marca"
                className="w-full border p-2.5 rounded-lg text-xs"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL da Logo do Patrocinador (PNG Transparente preferível)"
                className="w-full border p-2.5 rounded-lg text-xs"
                value={sponsorLogo}
                onChange={(e) => setSponsorLogo(e.target.value)}
                required
              />
              <select
                className="w-full border p-2.5 rounded-lg text-xs font-bold text-slate-700"
                value={sponsorTier}
                onChange={(e) => setSponsorTier(e.target.value)}
              >
                <option value="master">🏆 Cota Master (Destaque Principal)</option>
                <option value="ouro">🥇 Cota Ouro</option>
                <option value="prata">🥈 Cota Prata</option>
                <option value="padrao">🥉 Apoio Local</option>
              </select>
              <button className="w-full bg-emerald-900 text-yellow-400 font-bold py-2.5 rounded-lg text-xs">
                Cadastrar Patrocinador
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Marca Cadastradas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sponsors.map((s) => (
                <div key={s.id} className="p-3 border rounded-xl text-center bg-slate-50 space-y-2">
                  <img src={s.logo_url} alt={s.name} className="h-10 mx-auto object-contain" />
                  <span className="font-bold text-xs block text-slate-800">{s.name}</span>
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded">
                    {s.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: GOOGLE ADSENSE E AGÊNCIA */}
      {activeTab === 'ads' && (
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base">📢 Integração com Agência e Google AdSense</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            O portal já possui os blocos de anúncios estrategicamente posicionado na página principal do público (no topo, entre as notícias e no rodapé).
          </p>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs space-y-2 text-blue-900">
            <strong>ℹ️ Como entregar para sua Agência de Anúncios:</strong>
            <ol className="list-decimal pl-4 space-y-1 mt-2">
              <li>Envie o código do arquivo <code className="bg-blue-100 px-1 rounded">components/GoogleAd.tsx</code> para o gestor de tráfego/agência.</li>
              <li>Insira o <strong>ID de Cliente AdSense</strong> (ex: <code className="bg-blue-100 px-1 rounded">ca-pub-1234567890</code>) no arquivo do componente.</li>
              <li>Os banners responsivos serão servidos automaticamente para os torcedores, gerando receita por visualizações e cliques!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
