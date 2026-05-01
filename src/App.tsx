import { useState } from 'react';
import { FileText, Image, Archive, RefreshCw, Shield, Zap, Globe, Menu, X } from 'lucide-react';
import PdfTools from './components/PdfTools';
import ImageTools from './components/ImageTools';
import CompressTools from './components/CompressTools';
import ConvertTools from './components/ConvertTools';

type Tool = 'pdf' | 'image' | 'compress' | 'convert';

const tools: { id: Tool; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'pdf', label: 'PDF', icon: <FileText size={22} />, color: 'emerald', desc: 'Unir, dividir, comprimir y convertir PDFs' },
  { id: 'image', label: 'Imagenes', icon: <Image size={22} />, color: 'blue', desc: 'Comprimir, convertir y redimensionar imagenes' },
  { id: 'compress', label: 'Comprimir', icon: <Archive size={22} />, color: 'amber', desc: 'Comprimir y extraer archivos ZIP' },
  { id: 'convert', label: 'Convertir', icon: <RefreshCw size={22} />, color: 'teal', desc: 'Cambiar formatos de archivos facilmente' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string; shadow: string }> = {
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', shadow: 'shadow-emerald-200' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', shadow: 'shadow-blue-200' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', shadow: 'shadow-amber-200' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50', shadow: 'shadow-teal-200' },
};

function App() {
  const [activeTool, setActiveTool] = useState<Tool>('pdf');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTool = tools.find(t => t.id === activeTool)!;
  const colors = colorMap[currentTool.color];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">FileForge</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {tools.map(tool => {
                const tc = colorMap[tool.color];
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${activeTool === tool.id
                        ? `${tc.bg} text-white shadow-lg ${tc.shadow}`
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {tool.icon}
                    {tool.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Abrir menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-2.5 h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                <span className={`absolute left-0 h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <div
          className={`md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile slide-out nav */}
        <div
          className={`md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
            <span className="text-lg font-bold text-slate-800">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-1.5">
            {tools.map((tool, i) => {
              const tc = colorMap[tool.color];
              return (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTool(tool.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${activeTool === tool.id
                      ? `${tc.bg} text-white shadow-lg ${tc.shadow}`
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  style={{ animationDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms' }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                    ${activeTool === tool.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {tool.icon}
                  </div>
                  <div className="text-left">
                    <div>{tool.label}</div>
                    <div className={`text-xs font-normal ${activeTool === tool.id ? 'text-white/70' : 'text-slate-400'}`}>{tool.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield size={14} />
              Todo se procesa en tu navegador
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-slate-300 mb-6">
            <Shield size={14} />
            100% privado - todo se procesa en tu navegador
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Herramientas de archivos<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">rapidas y seguras</span>
          </h1>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Convierte PDFs, comprime imagenes, transforma formatos y mucho mas.
            Sin subir archivos a ningun servidor. Todo funciona directamente en tu navegador.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400" /> Sin limite de archivos</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-400" /> 100% privado</span>
            <span className="flex items-center gap-1.5"><Globe size={14} className="text-emerald-400" /> Sin registro</span>
          </div>
        </div>
      </section>

      {/* Tool cards - quick access */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map(tool => {
            const tc = colorMap[tool.color];
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`group p-5 rounded-2xl border transition-all duration-300 text-left
                  ${activeTool === tool.id
                    ? `bg-white ${tc.border} shadow-xl ${tc.shadow} scale-[1.02]`
                    : 'bg-white/60 border-slate-100 hover:bg-white hover:shadow-lg hover:scale-[1.01]'
                  }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300
                  ${activeTool === tool.id ? `${tc.bg} text-white` : `${tc.light} ${tc.text}`}`}>
                  {tool.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{tool.label}</h3>
                <p className="text-xs text-slate-400 mt-1 hidden sm:block">{tool.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main tool area */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} text-white flex items-center justify-center`}>
              {currentTool.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Herramientas de {currentTool.label}</h2>
              <p className="text-sm text-slate-400">{currentTool.desc}</p>
            </div>
          </div>

          {activeTool === 'pdf' && <PdfTools />}
          {activeTool === 'image' && <ImageTools />}
          {activeTool === 'compress' && <CompressTools />}
          {activeTool === 'convert' && <ConvertTools />}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Por que elegir FileForge</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <Shield size={24} />, title: 'Privacidad total', desc: 'Tus archivos nunca salen de tu navegador. Todo el procesamiento se realiza localmente en tu dispositivo.' },
            { icon: <Zap size={24} />, title: 'Ultra rapido', desc: 'Sin esperas de servidor. Los archivos se procesan al instante usando la potencia de tu dispositivo.' },
            { icon: <Globe size={24} />, title: 'Sin registro', desc: 'No necesitas crear cuenta ni dar tu email. Abre la web y empieza a usar las herramientas.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-700">FileForge</span>
          </div>
          <p className="text-sm text-slate-400">Herramientas de archivos gratuitas, rapidas y seguras. Todo se procesa en tu navegador.</p>
          <p className="text-xs text-slate-300 mt-3">&copy; {new Date().getFullYear()} FileForge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
