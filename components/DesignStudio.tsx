
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, X, Sparkles, Sprout, Palette, SplitSquareHorizontal, Undo, Redo, Save, Folder } from 'lucide-react';
import { Button } from './Button';
import { generateLandscapeDesign } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { Client, User } from '../types';

interface DesignHistoryItem {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  timestamp: number;
}

interface DesignStudioProps {
  user?: User;
  currentClientId?: string;
  onBackToDashboard?: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    label: "Modern Minimalist",
    text: "A sleek modern backyard with large concrete pavers, gravel gaps, drought-tolerant ornamental grasses, a rectangular gas fire pit, and slat wood fencing."
  },
  {
    label: "Tropical Oasis",
    text: "A lush tropical retreat featuring dense ferns, palm trees, a dark wood deck, ambient string lights, and a hammock for relaxation."
  },
  {
    label: "English Cottage",
    text: "A romantic English cottage garden with overflowing flower beds of lavender and roses, a winding cobblestone path, and a rustic wooden bench."
  },
  {
    label: "Desert Xeriscape",
    text: "A sustainable desert landscape with various succulents, large sculptural boulders, crushed granite ground cover, and agave plants."
  },
  {
    label: "Zen Garden",
    text: "A peaceful Japanese Zen garden with raked sand, moss covered rocks, a small bamboo water feature, and a neatly pruned maple tree."
  }
];

export const DesignStudio: React.FC<DesignStudioProps> = ({ user, currentClientId, onBackToDashboard }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Client selection for saving
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedSaveClientId, setSelectedSaveClientId] = useState<string>(currentClientId || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // History is now chronological: [Oldest, ..., Newest]
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Loading animation state
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  
  // View Modes
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparePos, setComparePos] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
        dbService.getClients(user.id).then(setAvailableClients);
    }
    if (currentClientId) {
        setSelectedSaveClientId(currentClientId);
    }
  }, [user, currentClientId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setMimeType(file.type);
        setGeneratedImage(null);
        setIsCompareMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsLoading(true);
    setIsCompareMode(false);
    try {
      const result = await generateLandscapeDesign(selectedImage, mimeType, prompt);
      if (result) {
        setGeneratedImage(result);
        
        const newItem: DesignHistoryItem = {
          id: Date.now().toString(),
          originalImage: selectedImage,
          generatedImage: result,
          prompt: prompt,
          timestamp: Date.now()
        };
        
        setHistory(prev => {
          const pastHistory = prev.slice(0, historyIndex + 1);
          if (pastHistory.length >= 20) {
             return [...pastHistory.slice(1), newItem];
          }
          return [...pastHistory, newItem];
        });

        setHistoryIndex(prev => {
           return (historyIndex + 1 >= 20) ? 19 : historyIndex + 1;
        });

      } else {
        alert("Could not generate image. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating design. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fix history index sync after state update
  useEffect(() => {
     if (history.length > 0 && historyIndex === -1) {
         setHistoryIndex(history.length - 1);
     }
  }, [history.length]);

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setGeneratedImage(null);
    setIsCompareMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadHistoryItem = (item: DesignHistoryItem) => {
    setSelectedImage(item.originalImage);
    setGeneratedImage(item.generatedImage);
    setPrompt(item.prompt);
    setIsCompareMode(false);
    
    const match = item.originalImage.match(/data:(image\/[a-zA-Z]*);base64/);
    if (match && match[1]) {
        setMimeType(match[1]);
    }

    const index = history.findIndex(h => h.id === item.id);
    if (index !== -1) {
        setHistoryIndex(index);
    }
    
    if (window.innerWidth < 768) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      loadHistoryItem(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      loadHistoryItem(history[newIndex]);
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setComparePos(Math.min(Math.max(position, 0), 100));
  };

  const handleSaveToClient = async () => {
      if (!user || !selectedSaveClientId || !generatedImage || !selectedImage) return;
      
      setIsSaving(true);
      try {
          await dbService.saveDesign(user.id, selectedSaveClientId, {
              original: selectedImage,
              generated: generatedImage,
              prompt: prompt
          });
          alert("Design saved successfully!");
          setShowSaveModal(false);
      } catch (e) {
          alert("Failed to save.");
      } finally {
          setIsSaving(false);
      }
  };

  useEffect(() => {
    if (generatedImage && !isLoading && window.innerWidth < 768) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedImage, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      setLoadingStatus("Analyzing terrain geometry...");
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          const increment = Math.max(0.5, (95 - prev) / 20);
          return prev + increment;
        });
      }, 150);

      const statusInterval = setInterval(() => {
        setLoadingStatus(prev => {
           if (prev === "Analyzing terrain geometry...") return "Identifying vegetation zones...";
           if (prev === "Identifying vegetation zones...") return "Generating hardscape elements...";
           if (prev === "Generating hardscape elements...") return "Rendering lighting and shadows...";
           if (prev === "Rendering lighting and shadows...") return "Refining texture details...";
           if (prev === "Refining texture details...") return "Finalizing design concept...";
           return prev;
        });
      }, 2500);

      return () => {
        clearInterval(progressInterval);
        clearInterval(statusInterval);
      };
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
      
      {/* Save Modal */}
      {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-[#646E57] border border-[#A4BAA8]/20 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                  <h3 className="text-xl font-serif text-[#E2D2BC] mb-4">Save to Client Folder</h3>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs uppercase text-[#A4BAA8]">Select Client</label>
                          <select 
                             className="w-full px-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] focus:outline-none focus:border-[#E2D2BC]"
                             value={selectedSaveClientId}
                             onChange={e => setSelectedSaveClientId(e.target.value)}
                          >
                              <option value="" disabled>Select a folder...</option>
                              {availableClients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">Cancel</Button>
                          <Button 
                            variant="primary" 
                            className="flex-1"
                            disabled={!selectedSaveClientId || isSaving}
                            onClick={handleSaveToClient}
                            isLoading={isSaving}
                          >
                            Save Design
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Left Panel: Inputs */}
      <div className="w-full md:w-[340px] lg:w-[450px] p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 border-b md:border-b-0 md:border-r border-[#A4BAA8]/20 bg-[#646E57]/80 backdrop-blur-xl overflow-y-auto shrink-0 z-20 shadow-2xl custom-scrollbar pb-safe">
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {onBackToDashboard && (
                 <button onClick={onBackToDashboard} className="md:hidden mr-2 text-[#E2D2BC]"><Undo className="h-4 w-4" /></button>
              )}
              <h1 className="text-xl md:text-2xl font-serif font-medium tracking-tight text-[#E2D2BC]">Project Vision</h1>
            </div>
            <p className="text-[#A4BAA8] text-xs md:text-sm">Upload a site photo and describe your landscape transformation.</p>
          </div>
          
          <div className="flex items-center gap-1 bg-[#2c3325]/30 p-1 rounded-lg border border-[#A4BAA8]/10">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className="p-2 text-[#E2D2BC] hover:bg-[#E2D2BC]/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-[#A4BAA8]/20"></div>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex === -1 || historyIndex >= history.length - 1}
              className="p-2 text-[#E2D2BC] hover:bg-[#E2D2BC]/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#E2D2BC] uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8C4A33]"></div>
            Original Photo
          </label>
          <div 
            onClick={() => !selectedImage && fileInputRef.current?.click()}
            className={`group relative aspect-video w-full rounded-2xl overflow-hidden transition-all duration-300 border-2 border-dashed shadow-inner touch-manipulation
              ${selectedImage ? 'border-transparent bg-black/20' : 'border-[#A4BAA8]/40 hover:border-[#E2D2BC] hover:bg-[#E2D2BC]/5 cursor-pointer active:scale-[0.98]'}`}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={clearImage}
                    className="p-2 bg-[#8C4A33] hover:bg-[#7a402c] text-white rounded-full transition-colors shadow-lg active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#A4BAA8] group-hover:text-[#E2D2BC] transition-colors">
                <div className="p-4 bg-[#E2D2BC]/10 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 ring-1 ring-[#E2D2BC]/20">
                   <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Tap to upload site photo</span>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Prompt Area */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#E2D2BC] uppercase tracking-wider flex items-center gap-2 justify-between">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCAC85]"></div>
                Design Requirements
             </div>
          </label>
          <div className="relative h-32 md:h-40 flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the landscape design..."
              className="w-full flex-1 bg-[#E2D2BC]/10 focus:bg-[#E2D2BC]/20 border border-[#A4BAA8]/20 focus:border-[#E2D2BC]/50 rounded-2xl p-4 text-[#E2D2BC] placeholder-[#A4BAA8]/60 focus:outline-none resize-none transition-all text-base md:text-sm leading-relaxed appearance-none"
            />
            <div className="absolute bottom-4 right-4 pointer-events-none">
              <Sparkles className={`h-4 w-4 ${prompt ? 'text-[#CCAC85]' : 'text-[#646E57]'} transition-colors`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#A4BAA8] text-[10px] uppercase tracking-widest font-semibold">
               <Palette className="h-3 w-3" /> Quick Inspiration
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x touch-pan-x">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex.text)}
                  className="snap-start shrink-0 px-3 py-2 rounded-lg bg-[#E2D2BC]/10 active:bg-[#E2D2BC]/30 border border-[#A4BAA8]/20 text-[#E2D2BC] text-xs transition-all duration-200 whitespace-nowrap active:scale-95"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Button 
            onClick={handleGenerate} 
            disabled={!selectedImage || !prompt.trim() || isLoading}
            variant="primary"
            className="w-full h-12 md:h-14 rounded-2xl text-base font-semibold tracking-wide shadow-lg active:scale-[0.98] transition-transform"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-[#E2D2BC]/30 border-t-[#E2D2BC] rounded-full animate-spin" />
                Designing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Design <Wand2 className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>

        {history.length > 0 && (
          <div className="pt-6 border-t border-[#A4BAA8]/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <label className="text-xs font-semibold text-[#E2D2BC] uppercase tracking-wider flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A4BAA8]"></div>
                Recent Concepts
             </label>
             <div className="grid grid-cols-2 gap-3">
               {[...history].reverse().map((item) => (
                 <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className={`group relative rounded-xl overflow-hidden aspect-[4/3] border transition-all bg-black/20 active:scale-95 ${
                        item.generatedImage === generatedImage 
                        ? 'border-[#E2D2BC] ring-1 ring-[#E2D2BC]/50' 
                        : 'border-[#A4BAA8]/20 active:border-[#E2D2BC]'
                    }`}
                 >
                   <img 
                     src={item.generatedImage} 
                     alt="History item" 
                     className={`w-full h-full object-cover transition-opacity ${
                        item.generatedImage === generatedImage ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                     }`}
                   />
                   {item.generatedImage === generatedImage && (
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E2D2BC] shadow-[0_0_8px_rgba(226,210,188,0.8)]"></div>
                   )}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Right Panel: Output */}
      <div 
        ref={resultRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[500px] md:min-h-0 bg-black/10"
      >
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#646E57]/50 to-transparent pointer-events-none" />
        
        {generatedImage ? (
          <div className="relative w-full h-full p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center animate-in fade-in duration-700">
            
            <div className="relative max-w-full max-h-[80vh] md:max-h-[85vh] shadow-2xl rounded-xl ring-1 md:ring-4 ring-[#E2D2BC]/10 backdrop-blur-sm bg-black/20 overflow-hidden group touch-none">
              
              <div 
                ref={sliderRef}
                className="relative select-none inline-block touch-none"
                onMouseMove={isCompareMode ? (e) => handleSliderMove(e) : undefined}
                onTouchMove={isCompareMode ? (e) => handleSliderMove(e) : undefined}
                onClick={isCompareMode ? (e) => handleSliderMove(e) : undefined}
              >
                <img 
                  src={generatedImage} 
                  alt="Generated Design" 
                  className="max-h-[60vh] md:max-h-[75vh] w-auto block object-contain pointer-events-none"
                  draggable={false}
                />

                {isCompareMode && selectedImage && (
                  <div 
                    className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white/90 shadow-[2px_0_10px_rgba(0,0,0,0.3)] pointer-events-none"
                    style={{ width: `${comparePos}%` }}
                  >
                     <img 
                      src={selectedImage} 
                      alt="Original" 
                      className="h-full w-auto max-w-none block"
                      draggable={false}
                    />
                  </div>
                )}

                {isCompareMode && (
                   <div 
                     className="absolute inset-y-0 w-8 -ml-4 z-20 cursor-ew-resize touch-none flex items-center justify-center"
                     style={{ left: `${comparePos}%` }}
                   >
                     <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-[#646E57]">
                        <SplitSquareHorizontal className="h-4 w-4" />
                     </div>
                   </div>
                )}
              </div>

              {/* Toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#646E57]/90 backdrop-blur-md rounded-full border border-[#A4BAA8]/20 shadow-xl z-30">
                 
                 <button 
                   onClick={() => setIsCompareMode(!isCompareMode)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 active:scale-95 ${
                     isCompareMode 
                       ? 'bg-[#E2D2BC] text-[#646E57]' 
                       : 'text-[#E2D2BC] hover:bg-white/10'
                   }`}
                 >
                    <SplitSquareHorizontal className="h-4 w-4" />
                    {isCompareMode ? 'Exit' : 'Compare'}
                 </button>

                 <div className="w-px h-4 bg-[#A4BAA8]/30 mx-1"></div>

                 <button 
                   onClick={() => setShowSaveModal(true)}
                   className="p-2 text-[#E2D2BC] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
                   title="Save to Client"
                 >
                   <Save className="h-4 w-4" />
                 </button>

                 <a 
                   href={generatedImage} 
                   download="rescape-design.png"
                   className="p-2 text-[#E2D2BC] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
                   title="Download Image"
                 >
                   <Download className="h-4 w-4" />
                 </a>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center p-8 max-w-md relative z-10 w-full flex justify-center">
            {isLoading ? (
               <div className="flex flex-col items-center max-w-sm w-full">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8">
                     <div className="absolute inset-0 border-4 border-[#E2D2BC]/10 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-[#E2D2BC]/40 border-t-[#E2D2BC] rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Sprout className="h-8 w-8 md:h-10 md:w-10 text-[#B4B792] animate-pulse" />
                     </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-medium text-[#E2D2BC] mb-2 tracking-wide">Cultivating Vision</h3>
                  <p className="text-[#A4BAA8] text-sm mb-6 min-h-[20px] transition-all duration-300">
                    {loadingStatus}
                  </p>
                  <div className="w-full h-1.5 bg-[#646E57]/50 rounded-full overflow-hidden border border-[#A4BAA8]/10 backdrop-blur-sm relative shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8C4A33] to-[#CCAC85] transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full mt-2 text-[10px] text-[#A4BAA8]/60 font-mono">
                    <span>AI PROCESSING</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
               </div>
            ) : (
              <div className="bg-[#646E57]/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-[#A4BAA8]/20 shadow-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#E2D2BC]/10 border border-[#E2D2BC]/20 mb-4 md:mb-6 rotate-3">
                  <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-[#E2D2BC]" />
                </div>
                <h3 className="text-lg md:text-xl font-medium text-[#E2D2BC] mb-2 md:mb-3">Ready to Create</h3>
                <p className="text-[#A4BAA8] leading-relaxed text-sm md:text-base">
                  {currentClientId ? "Project selected. Upload a photo to begin." : "Select a client or upload a photo to start."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
