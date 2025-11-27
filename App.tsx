import React, { useState } from 'react';
import { ViewState } from './types';
import { LandingPage } from './components/LandingPage';
import { DesignStudio } from './components/DesignStudio';
import { Flower2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);

  // Background Image Strategy:
  // Using a high-quality, slightly faded garden image as the global backdrop
  const bgImage = "https://images.unsplash.com/photo-1621257077656-78b02213d290?q=80&w=2670&auto=format&fit=crop";

  if (currentView === ViewState.LANDING) {
    return <LandingPage onGetStarted={() => setCurrentView(ViewState.APP)} />;
  }

  return (
    // Use h-[100dvh] for mobile browser compatibility (address bar handling)
    <div className="flex flex-col h-[100dvh] overflow-hidden font-sans relative text-base md:text-sm">
      {/* Global Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Overlay to ensure text readability - Using Dark Olive with high opacity */}
        <div className="absolute inset-0 bg-[#646E57]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header - Safe area padding added for iOS notch */}
      <header className="shrink-0 h-16 pt-safe flex items-center justify-between px-4 md:px-6 border-b border-[#A4BAA8]/20 bg-[#646E57]/80 backdrop-blur-md z-50 relative shadow-sm box-content">
        <div className="flex items-center gap-2 h-full pb-1">
          <div className="bg-[#E2D2BC] p-1.5 rounded-lg shadow-inner">
            <Flower2 className="h-5 w-5 text-[#646E57]" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#E2D2BC]">ReScape</span>
        </div>
        <button 
          onClick={() => setCurrentView(ViewState.LANDING)}
          className="text-sm font-medium text-[#A4BAA8] hover:text-[#E2D2BC] transition-colors h-full pb-1 flex items-center"
        >
          Exit Studio
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-10 pb-safe">
        <DesignStudio />
      </main>
    </div>
  );
};

export default App;