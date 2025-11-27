import React from 'react';
import { Zap, ChevronRight, Shovel, LayoutTemplate, Flower2 } from 'lucide-react';
import { Button } from './Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // Updated to a brighter, daylight landscape image
  const bgImage = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2600&auto=format&fit=crop";

  return (
    <div className="min-h-[100dvh] text-[#E2D2BC] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Image with Tint */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Adjusted overlay to be slightly lighter but maintaining text contrast */}
        <div className="absolute inset-0 bg-[#646E57]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#646E57]/60 to-[#2c3325]/90"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-[#A4BAA8]/20 bg-[#646E57]/20 backdrop-blur-xl fixed w-full z-50 transition-all duration-300 pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#E2D2BC] p-2 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90">
                <Flower2 className="h-5 w-5 md:h-6 md:w-6 text-[#646E57]" />
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight text-[#E2D2BC] drop-shadow-md">
                ReScape
              </span>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={onGetStarted} size="sm" variant="light" className="px-4 md:px-6 rounded-full shadow-lg bg-[#E2D2BC] text-[#646E57] hover:bg-white border-0 text-xs md:text-sm">
                Open Studio
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center pt-28 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-5xl mx-auto mb-12 md:mb-20">
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tight mb-6 md:mb-8 text-[#E2D2BC] drop-shadow-lg leading-tight">
              Cultivate Your <br/>
              <span className="text-[#B4B792] italic">Vision</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-[#E2D2BC]/90 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md px-2">
              The professional AI design tool for modern landscapers. 
              Visualize stunning outdoor transformations in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" onClick={onGetStarted} className="bg-[#8C4A33] hover:bg-[#a3583e] text-[#E2D2BC] rounded-full px-10 md:px-12 h-14 md:h-16 text-base md:text-lg shadow-[0_20px_50px_-12px_rgba(140,74,51,0.5)] border border-[#E2D2BC]/20 transition-transform hover:scale-105 backdrop-blur-sm active:scale-95">
                Start Designing
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 max-w-6xl mx-auto pb-safe">
            {[
              {
                icon: <Zap className="h-6 w-6 text-[#CCAC85]" />,
                title: "Instant Rendering",
                desc: "Zero wait time. Generate high-fidelity concepts instantly."
              },
              {
                icon: <LayoutTemplate className="h-6 w-6 text-[#B4B792]" />,
                title: "Photorealistic Quality",
                desc: "Cinema-grade visuals indistinguishable from professional photography."
              },
              {
                icon: <Shovel className="h-6 w-6 text-[#E2D2BC]" />,
                title: "Material Accuracy",
                desc: "Precise texture mapping for pavers, wood decks, and native vegetation."
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 md:p-8 rounded-[2rem] bg-[#2c3325]/40 border border-[#E2D2BC]/10 hover:bg-[#2c3325]/60 transition-colors backdrop-blur-xl group shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-[#E2D2BC]/10 flex items-center justify-center mb-4 md:mb-6 border border-[#E2D2BC]/10 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3 text-[#E2D2BC]">{feature.title}</h3>
                <p className="text-[#A4BAA8] leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#A4BAA8]/10 bg-[#2c3325]/80 backdrop-blur-md py-6 md:py-8 px-4 text-center text-[#646E57] text-xs relative z-10 pb-safe">
        <p className="text-[#A4BAA8]/60">&copy; 2025 ReScape. Designed for Professionals.</p>
      </footer>
    </div>
  );
};