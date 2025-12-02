
import React, { useState, useEffect } from 'react';
import { ViewState, User, Client } from './types';
import { LandingPage } from './components/LandingPage';
import { DesignStudio } from './components/DesignStudio';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Flower2, LogOut, LayoutGrid, Plus } from 'lucide-react';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | undefined>(undefined);

  const bgImage = "https://images.unsplash.com/photo-1621257077656-78b02213d290?q=80&w=2670&auto=format&fit=crop";

  useEffect(() => {
    // Check for existing session
    dbService.getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setCurrentView(ViewState.DASHBOARD);
      }
    });
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
    await dbService.logout();
    setUser(null);
    setCurrentView(ViewState.LANDING);
    setCurrentClientId(undefined);
  };

  const handleNewDesign = (clientId?: string) => {
    setCurrentClientId(clientId);
    setCurrentView(ViewState.APP);
  };

  const handleSelectClient = (client: Client) => {
      // In a more complex app, this might open a detail view.
      // For now, let's keep it simple: selecting a client allows you to see their designs (handled in Dashboard)
      // If we want to design FOR them:
      setCurrentClientId(client.id);
  };

  // Render logic
  const renderContent = () => {
    switch (currentView) {
      case ViewState.LANDING:
        return <LandingPage onGetStarted={() => setCurrentView(user ? ViewState.DASHBOARD : ViewState.AUTH)} />;
      
      case ViewState.AUTH:
        return <Auth onSuccess={handleLoginSuccess} onCancel={() => setCurrentView(ViewState.LANDING)} />;

      case ViewState.DASHBOARD:
        return user ? (
          <Dashboard 
            user={user} 
            onSelectClient={handleSelectClient}
            onNewDesign={handleNewDesign}
          />
        ) : null;

      case ViewState.APP:
        return (
          <DesignStudio 
            user={user || undefined}
            currentClientId={currentClientId}
            onBackToDashboard={() => setCurrentView(ViewState.DASHBOARD)}
          />
        );

      default:
        return <div>404</div>;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden font-sans relative text-base md:text-sm">
      {/* Global Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-[#646E57]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header - Conditional based on View */}
      {currentView !== ViewState.LANDING && currentView !== ViewState.AUTH && (
        <header className="shrink-0 h-16 pt-safe flex items-center justify-between px-4 md:px-6 border-b border-[#A4BAA8]/20 bg-[#646E57]/80 backdrop-blur-md z-50 relative shadow-sm box-content">
          <div className="flex items-center gap-2 h-full pb-1 cursor-pointer" onClick={() => setCurrentView(ViewState.DASHBOARD)}>
            <div className="bg-[#E2D2BC] p-1.5 rounded-lg shadow-inner">
              <Flower2 className="h-5 w-5 text-[#646E57]" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#E2D2BC]">ReScape</span>
          </div>
          
          <div className="flex items-center gap-4 h-full pb-1">
             {user && (
                 <div className="hidden md:flex items-center gap-2 text-[#E2D2BC] text-sm">
                    <span className="opacity-70">Hello,</span>
                    <span className="font-medium">{user.name}</span>
                 </div>
             )}
             
             {currentView === ViewState.APP && (
                 <button 
                   onClick={() => setCurrentView(ViewState.DASHBOARD)}
                   className="p-2 text-[#A4BAA8] hover:text-[#E2D2BC] hover:bg-white/5 rounded-lg transition-colors"
                   title="Dashboard"
                 >
                    <LayoutGrid className="h-5 w-5" />
                 </button>
             )}

             <button 
               onClick={handleLogout}
               className="text-sm font-medium text-[#A4BAA8] hover:text-[#E2D2BC] transition-colors flex items-center gap-2"
             >
               <span className="hidden md:inline">Sign Out</span>
               <LogOut className="h-4 w-4" />
             </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-10 pb-safe">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
