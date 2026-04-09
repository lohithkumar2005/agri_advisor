import React, { useState, useRef } from 'react';
import { Upload, Camera, Sprout, CheckCircle2, Loader2, ShoppingCart, ExternalLink, Info, ShieldCheck, AlertCircle, ImagePlus, X } from 'lucide-react';
import { analyzePlantDisease, AnalysisResponse } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import { Language } from '../types';

interface DashboardProps {
  language: Language;
}

export default function Dashboard({ language }: DashboardProps) {
  const [images, setImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    setError(null);
    try {
      const response = await analyzePlantDisease(images, language);
      setResult(response);

      if (response.status === 'not_plant') {
        setError(response.message || 'Please upload a plant photo.');
        setResult(null);
      }
    } catch (err: any) {
      console.error(err);
      let rawError = err?.message || 'Failed to analyze image. Please check your API key and try again.';
      let errorMessage = rawError;

      // Parse JSON error message if it's stringified
      if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
        try {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error && parsed.error.message) {
            errorMessage = parsed.error.message;
          }
        } catch (e) {
          // ignore
        }
      }

      if (rawError.includes('403') || rawError.includes('PERMISSION_DENIED') || errorMessage.includes('denied access')) {
         errorMessage = 'API Access Denied: Your Gemini API key is either invalid, disabled, or your project has been restricted. Please generate a new key from https://aistudio.google.com/app/apikey and update your .env file. The code is working correctly, it is just being blocked by Google.';
      } else if (rawError.includes('429') || rawError.includes('quota')) {
         errorMessage = 'API Quota Exceeded. Please check your billing or use a new Gemini API Key.';
      }
      
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const getAmazonLink = (pest: string) =>
    `https://www.amazon.in/s?k=${encodeURIComponent(pest + ' pesticide')}`;
  const getFlipkartLink = (pest: string) =>
    `https://www.flipkart.com/search?q=${encodeURIComponent(pest + ' pesticide')}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Panel: Upload */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-100/50 border border-emerald-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                <Camera size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{t.uploadLeaf}</h2>
            </div>

            {/* Image Thumbnails */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-200 group">
                    <img src={img} alt={`Plant ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files || []);
                files.forEach((file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImages((prev) => [...prev, reader.result as string]);
                    setResult(null);
                    setError(null);
                  };
                  reader.readAsDataURL(file);
                });
              }}
              className="aspect-square rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="text-center p-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                  {images.length > 0 ? <ImagePlus size={36} /> : <Upload size={40} />}
                </div>
                <p className="text-emerald-700 font-bold text-lg">
                  {images.length > 0 ? 'Add More Photos' : t.selectPhoto}
                </p>
                <p className="text-emerald-500/60 text-sm mt-2">
                  {images.length > 0
                    ? 'Click to add additional angles'
                    : 'Drag and drop or click to browse'}
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Error / Not Plant Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Need More Photos Message */}
            {result?.status === 'need_more_photos' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-start">
                <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Additional Photo Needed</p>
                  <p className="text-sm text-amber-700">{result.message}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Upload More Photos
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={images.length === 0 || analyzing}
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mt-6 shadow-lg ${
                images.length === 0 || analyzing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Sprout size={24} />
                  {t.analyzeBtn}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {result && result.status !== 'not_plant' && result.status !== 'need_more_photos' ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-100/50 border border-emerald-50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <CheckCircle2 size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800">{t.detectionResults}</h2>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                        result.status === 'healthy'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {result.status === 'healthy' ? '✅ Healthy' : '⚠️ Disease Detected'}
                    </span>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {t.diseaseName}
                      </h3>
                      <p className="text-3xl font-black text-emerald-800 leading-tight">{result.disease}</p>
                      <p className="text-slate-600 mt-4 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                        "{result.description}"
                      </p>
                    </section>

                    {/* Recommendations for healthy plant */}
                    {result.status === 'healthy' && result.recommendations && result.recommendations.length > 0 && (
                      <section className="bg-emerald-50/50 rounded-[2rem] p-6 border border-emerald-100">
                        <h3 className="text-lg font-bold text-emerald-900 mb-4">Care Recommendations</h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Disease details */}
                    {result.status === 'disease' && (
                      <>
                        <section className="bg-emerald-50/50 rounded-[2rem] p-6 border border-emerald-100">
                          <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-emerald-600" size={24} />
                            <h3 className="text-lg font-bold text-emerald-900">{t.pestRecommendation}</h3>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">{t.recommendedPest}</p>
                              <p className="text-xl font-black text-emerald-900">{result.pestName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">{t.quantityRequired}</p>
                              <p className="text-xl font-black text-emerald-900">{result.quantity}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">{t.coverageArea}</p>
                              <p className="text-lg font-bold text-slate-700">{result.coverage}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">{t.applicationDuration}</p>
                              <p className="text-lg font-bold text-slate-700">{result.duration}</p>
                            </div>
                          </div>

                          <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                            <Info className="text-amber-600 shrink-0" size={20} />
                            <div>
                              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">{t.safetyTip}</p>
                              <p className="text-sm text-amber-800 font-medium">{result.safetyTip}</p>
                            </div>
                          </div>
                        </section>

                        {result.recommendations && result.recommendations.length > 0 && (
                          <section className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <h3 className="text-base font-bold text-slate-700 mb-3">Additional Recommendations</h3>
                            <ul className="space-y-2">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="text-emerald-500 font-bold mt-0.5">{i + 1}.</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <a
                            href={getAmazonLink(result.pestName || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-4 bg-[#FF9900] hover:bg-[#E68A00] text-white font-bold rounded-2xl shadow-lg transition-all"
                          >
                            <ShoppingCart size={20} />
                            {t.buyOnAmazon}
                          </a>
                          <a
                            href={getFlipkartLink(result.pestName || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-4 bg-[#2874F0] hover:bg-[#1C5FC4] text-white font-bold rounded-2xl shadow-lg transition-all"
                          >
                            <ExternalLink size={20} />
                            {t.buyOnFlipkart}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              !result && (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] shadow-xl shadow-emerald-100/50 border border-emerald-50 border-dashed border-2">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-200">
                    <Sprout size={64} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">{t.uploadLeaf}</p>
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
