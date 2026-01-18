
import React, { useState, useRef } from 'react';
import { generateAffiliateContent, generateImage } from '../services/geminiService';

export const AffiliateModule: React.FC = () => {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [data, setData] = useState<any>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'product') setProductPreview(result);
        else setModelPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStatus('⚡ TURBO ENGINE: Memulai analisis visual instan...');
    
    try {
      const result = await generateAffiliateContent(productName, customInstructions);
      setData(result);
      setStep(2);

      // Automated Batch Visual Generation with absolute locking
      for (const asset of result.assets) {
        setLoadingStatus(`🔒 ZERO-LAG LOCK: Mengunci identitas ${asset.label}...`);
        try {
          const url = await generateImage(asset.imagePrompt, "9:16");
          setImages(prev => ({ ...prev, [asset.label]: url }));
        } catch (err) {
          console.error(`Failed generating image for ${asset.label}`, err);
        }
      }
    } catch (err) {
      alert("Terjadi kesalahan pada Turbo Engine. Periksa koneksi API.");
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-bebas tracking-widest text-black uppercase">
          PIKHACU <span className="colorful-text">AFFILIATE TURBO</span>
        </h2>
        <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.4em]">
          ⚡ HIGH-SPEED VISUAL ANALYSIS • AUTO-LOCK • IMAGE → VIDEO
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStart} className="glass-effect p-8 rounded-[2.5rem] colorful-border bg-white space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-2">📦 Gambar Produk Digital (Wajib)</label>
              <div 
                onClick={() => productInputRef.current?.click()}
                className="group cursor-pointer border-2 border-dashed border-black/10 rounded-2xl aspect-video flex flex-col items-center justify-center bg-black/[0.01] hover:bg-black/[0.03] transition-all relative overflow-hidden"
              >
                <input type="file" ref={productInputRef} hidden onChange={(e) => handleFileUpload(e, 'product')} accept="image/*" />
                {productPreview ? (
                  <div className="relative w-full h-full animate-in zoom-in duration-300">
                    <img src={productPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <i className="fa-solid fa-bolt-lightning text-white text-2xl animate-pulse"></i>
                    </div>
                    <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-2 py-1 rounded uppercase tracking-widest">Digital Reference Locked</div>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-microchip text-2xl text-black/20 group-hover:text-black/40 transition-colors"></i>
                    <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mt-2">Upload Visual Produk</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-2">🧍 Model Referensi (Identitas)</label>
              <div 
                onClick={() => modelInputRef.current?.click()}
                className="group cursor-pointer border-2 border-dashed border-black/10 rounded-2xl aspect-video flex flex-col items-center justify-center bg-black/[0.01] hover:bg-black/[0.03] transition-all relative overflow-hidden"
              >
                <input type="file" ref={modelInputRef} hidden onChange={(e) => handleFileUpload(e, 'model')} accept="image/*" />
                {modelPreview ? (
                  <div className="relative w-full h-full animate-in zoom-in duration-300">
                    <img src={modelPreview} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-2 py-1 rounded uppercase tracking-widest">Persona Terkunci</div>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-id-card text-2xl text-black/20 group-hover:text-black/40 transition-colors"></i>
                    <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mt-2">Target Audience Persona</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-2">Identitas Digital Produk</label>
              <input
                type="text"
                placeholder="Nama produk atau keyword utama..."
                className="w-full bg-neutral-900 border border-black/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none transition-all shadow-inner"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <p className="text-[8px] text-black/30 px-2 italic uppercase font-bold tracking-widest">
                *Turbo Engine akan mengunci visual secara otomatis.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-2">Digital Environment (Opsional)</label>
              <textarea
                placeholder="Misal: 'Studio minimalis, neon lighting, clean workspace...'"
                className="w-full bg-neutral-900 border border-black/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none min-h-[100px] resize-none"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !productName}
            className="w-full py-6 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fa-solid fa-bolt-lightning animate-pulse"></i> : <i className="fa-solid fa-gauge-high"></i>}
            {loading ? 'TURBO ANALYZING...' : '▶️ HASILKAN KONTEN AFILIATE'}
          </button>
          
          {loading && (
            <div className="text-center space-y-3 animate-in fade-in duration-500">
               <p className="text-[10px] font-black text-black/60 uppercase tracking-widest flex items-center justify-center gap-2">
                 <i className="fa-solid fa-rocket animate-bounce"></i> {loadingStatus}
              </p>
              <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-black h-full animate-progress-indefinite"></div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-effect p-8 rounded-[2.5rem] bg-white border border-black/5 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="font-bebas text-3xl text-black uppercase tracking-widest">📋 Analisis Turbo</h3>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-[10px] text-yellow-500"></i>
                    <span className="text-[8px] font-black text-black/40 uppercase tracking-widest">Optimized for Speed</span>
                  </div>
               </div>
              <div className="p-6 bg-black/5 rounded-2xl border border-black/5 text-sm font-semibold italic leading-relaxed text-black/70 whitespace-pre-line">
                {data.summary}
              </div>
            </div>

            <div className="glass-effect p-8 rounded-[2.5rem] bg-black text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <i className="fa-brands fa-instagram text-8xl"></i>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="font-bebas text-3xl uppercase tracking-widest">💬 Caption Viral</h3>
                <button 
                  onClick={() => copyToClipboard(data.caption, 'cap')}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <i className={copied === 'cap' ? "fa-solid fa-check text-green-400" : "fa-solid fa-copy"}></i>
                </button>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-sm font-medium leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar relative z-10">
                {data.caption}
              </div>
            </div>
          </div>

          <div className="space-y-10">
             <div className="flex items-center justify-between px-4">
                <h3 className="font-bebas text-4xl text-black uppercase tracking-widest">🖼️ Galeri Visual Terkunci</h3>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.assets.map((asset: any, idx: number) => (
                  <div key={idx} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="aspect-[9/16] bg-neutral-100 rounded-3xl overflow-hidden border border-black/5 shadow-xl relative group">
                      {images[asset.label] ? (
                        <img src={images[asset.label]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-3 opacity-20">
                           <i className="fa-solid fa-bolt-lightning animate-pulse text-2xl"></i>
                           <p className="text-[8px] font-black uppercase tracking-widest">Turbo Rendering...</p>
                        </div>
                      )}
                      
                      {images[asset.label] && (
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                           <button 
                             onClick={() => copyToClipboard(images[asset.label], `imglink-${idx}`)}
                             className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl text-black flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-all"
                           >
                             <i className="fa-solid fa-download"></i>
                           </button>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between">
                         <p className="text-[9px] font-black text-white uppercase tracking-widest">{asset.label}</p>
                         <i className="fa-solid fa-shield-halved text-[8px] text-white/60"></i>
                      </div>
                    </div>

                    <div className="glass-effect p-4 rounded-2xl bg-white border border-black/10 space-y-3 shadow-lg group hover:border-black/30 transition-all">
                       <div className="flex items-center justify-between">
                         <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                           <i className="fa-solid fa-video"></i> Video Prompt
                         </span>
                         <button 
                           onClick={() => copyToClipboard(asset.videoPrompt, `v-${idx}`)}
                           className="text-[9px] font-black text-black/40 hover:text-black transition-colors"
                         >
                            {copied === `v-${idx}` ? 'COPIED' : 'SALIN'}
                         </button>
                       </div>
                       <div className="text-[8px] font-bold text-black/50 italic leading-tight bg-neutral-50 p-3 rounded-lg border border-black/5 max-h-24 overflow-y-auto custom-scrollbar">
                         {asset.videoPrompt}
                       </div>
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[6px] font-black text-black/20 uppercase tracking-widest">Veo 3.1 Flow</span>
                          <span className="text-[6px] font-black text-black/20 uppercase tracking-widest">9:16 vertical</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-black/5">
            <button 
              onClick={() => { setStep(1); setData(null); setImages({}); setProductPreview(null); setModelPreview(null); }}
              className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl flex items-center gap-3"
            >
              <i className="fa-solid fa-rotate-left"></i> Produk Baru
            </button>
            <button className="px-8 py-4 bg-white border-2 border-black text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all shadow-xl flex items-center gap-3">
              <i className="fa-solid fa-cloud-arrow-down"></i> Download All Assets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
