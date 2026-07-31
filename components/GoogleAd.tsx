'use client';
import { useEffect } from 'react';

interface GoogleAdProps {
  client?: string; // Seu ID do Google AdSense: ex "ca-pub-1234567890123456"
  slot?: string;   // ID do Bloco de Anúncio
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
}

export default function GoogleAd({
  client = 'ca-pub-0000000000000000', // Substitua pelo ID real da sua agência
  slot = '0000000000',               // Substitua pelo ID do Slot real
  format = 'auto',
  responsive = true,
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Erro ao carregar AdSense:', e);
    }
  }, []);

  return (
    <div className="w-full my-4 text-center overflow-hidden bg-slate-100/50 p-2 rounded-xl border border-dashed border-slate-300">
      <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Publicidade / Anúncio</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
}
