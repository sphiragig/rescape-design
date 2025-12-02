
import React, { useState, useEffect } from 'react';
import { Plus, Search, Folder, MoreVertical, MapPin, User, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { dbService } from '../services/dbService';
import { User as UserType, Client, ProjectDesign } from '../types';

interface DashboardProps {
  user: UserType;
  onSelectClient: (client: Client) => void;
  onNewDesign: (clientId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onSelectClient, onNewDesign }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', address: '' });
  
  // State for drilling down into a client
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);
  const [clientDesigns, setClientDesigns] = useState<ProjectDesign[]>([]);

  useEffect(() => {
    loadClients();
  }, [user.id]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getClients(user.id);
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDesigns = async (clientId: string) => {
    const designs = await dbService.getDesigns(clientId);
    setClientDesigns(designs);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.createClient(user.id, newClientData);
      setNewClientData({ name: '', address: '' });
      setShowNewClientForm(false);
      loadClients();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClient = async (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     if(confirm("Are you sure? This will delete all designs in this folder.")) {
         await dbService.deleteClient(id);
         if (selectedClientDetail?.id === id) setSelectedClientDetail(null);
         loadClients();
     }
  }

  const handleClientClick = (client: Client) => {
    setSelectedClientDetail(client);
    loadDesigns(client.id);
  };

  // -- RENDER CLIENT DETAILS VIEW --
  if (selectedClientDetail) {
    return (
      <div className="p-6 md:p-10 h-full overflow-y-auto animate-in fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setSelectedClientDetail(null)}
              className="text-[#A4BAA8] hover:text-[#E2D2BC] transition-colors"
            >
               Projects /
            </button>
            <h1 className="text-3xl font-serif text-[#E2D2BC]">{selectedClientDetail.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Info */}
            <div className="bg-[#646E57]/40 backdrop-blur-md p-6 rounded-2xl border border-[#A4BAA8]/20 h-fit">
              <h3 className="text-[#E2D2BC] font-medium mb-4 uppercase tracking-wider text-xs">Client Details</h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-3 text-[#A4BAA8]">
                    <User className="h-4 w-4 mt-1" />
                    <div>
                        <p className="text-sm text-[#E2D2BC]">{selectedClientDetail.name}</p>
                        <p className="text-xs">Client ID: #{selectedClientDetail.id.slice(-4)}</p>
                    </div>
                 </div>
                 {selectedClientDetail.address && (
                     <div className="flex items-start gap-3 text-[#A4BAA8]">
                        <MapPin className="h-4 w-4 mt-1" />
                        <p className="text-sm">{selectedClientDetail.address}</p>
                     </div>
                 )}
                 <div className="flex items-start gap-3 text-[#A4BAA8]">
                    <Calendar className="h-4 w-4 mt-1" />
                    <p className="text-sm">Added {new Date(selectedClientDetail.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-[#A4BAA8]/20">
                 <Button 
                   onClick={() => onNewDesign(selectedClientDetail.id)}
                   className="w-full"
                   variant="primary"
                 >
                    <Plus className="h-4 w-4 mr-2" /> New Design
                 </Button>
              </div>
            </div>

            {/* Gallery */}
            <div className="md:col-span-3">
               {clientDesigns.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#A4BAA8]/20 rounded-2xl bg-[#646E57]/20">
                    <Folder className="h-12 w-12 text-[#A4BAA8] mb-4 opacity-50" />
                    <p className="text-[#E2D2BC] font-medium">No designs yet</p>
                    <p className="text-[#A4BAA8] text-sm mb-4">Start a new project for this client</p>
                    <Button onClick={() => onNewDesign(selectedClientDetail.id)} variant="outline" size="sm">Create Design</Button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientDesigns.map(design => (
                        <div key={design.id} className="group bg-black/20 rounded-xl overflow-hidden border border-[#A4BAA8]/20 hover:border-[#E2D2BC]/50 transition-all">
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img src={design.generatedImage} alt="Design" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a href={design.generatedImage} download className="p-2 bg-[#E2D2BC] rounded-full text-[#646E57] hover:scale-110 transition-transform">
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-[#E2D2BC] text-sm font-medium truncate">{design.prompt}</p>
                                <p className="text-[#A4BAA8] text-xs mt-1">{new Date(design.timestamp).toLocaleDateString()}</p>
                            </div>
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

  // -- RENDER MAIN DASHBOARD (CLIENT LIST) --
  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif text-[#E2D2BC]">Client Projects</h1>
            <p className="text-[#A4BAA8]">Manage your landscape portfolio.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A4BAA8]" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="pl-9 pr-4 py-2 bg-[#646E57]/40 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] placeholder-[#A4BAA8]/50 focus:outline-none focus:border-[#E2D2BC] text-sm h-10 w-full md:w-64"
                />
             </div>
             <Button onClick={() => setShowNewClientForm(true)} variant="primary" size="md">
                <Plus className="h-4 w-4 mr-2" /> Add Client
             </Button>
          </div>
        </div>

        {/* New Client Form Modal Overlay */}
        {showNewClientForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-[#646E57] border border-[#A4BAA8]/20 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                    <button onClick={() => setShowNewClientForm(false)} className="absolute top-4 right-4 text-[#A4BAA8] hover:text-[#E2D2BC]"><MoreVertical className="h-5 w-5 rotate-90" /></button>
                    <h3 className="text-xl font-serif text-[#E2D2BC] mb-4">Add New Client</h3>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Client Name (e.g. The Smiths)" 
                          required
                          className="w-full px-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] focus:outline-none focus:border-[#E2D2BC]"
                          value={newClientData.name}
                          onChange={e => setNewClientData({...newClientData, name: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Property Address (Optional)" 
                          className="w-full px-4 py-3 bg-black/20 border border-[#A4BAA8]/20 rounded-xl text-[#E2D2BC] focus:outline-none focus:border-[#E2D2BC]"
                          value={newClientData.address}
                          onChange={e => setNewClientData({...newClientData, address: e.target.value})}
                        />
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowNewClientForm(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" variant="primary" className="flex-1">Create Folder</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Client Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
           {clients.map(client => (
             <div 
               key={client.id}
               onClick={() => handleClientClick(client)}
               className="group bg-[#646E57]/40 backdrop-blur-sm p-5 rounded-2xl border border-[#A4BAA8]/10 hover:border-[#E2D2BC]/40 hover:bg-[#646E57]/60 transition-all cursor-pointer relative"
             >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#E2D2BC]/10 rounded-xl group-hover:bg-[#E2D2BC] group-hover:text-[#646E57] transition-colors text-[#E2D2BC]">
                        <Folder className="h-6 w-6" />
                    </div>
                    <button 
                        onClick={(e) => handleDeleteClient(e, client.id)}
                        className="p-1.5 text-[#A4BAA8] hover:text-red-300 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                <h3 className="text-lg font-medium text-[#E2D2BC] mb-1 truncate">{client.name}</h3>
                <p className="text-sm text-[#A4BAA8] truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 
                    {client.address || "No address set"}
                </p>
                <div className="mt-4 pt-4 border-t border-[#A4BAA8]/10 flex justify-between items-center text-xs text-[#A4BAA8]/60">
                    <span>Added {new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
             </div>
           ))}
           
           {/* Add New Card */}
           <button 
             onClick={() => setShowNewClientForm(true)}
             className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#A4BAA8]/20 hover:border-[#E2D2BC]/40 hover:bg-[#E2D2BC]/5 transition-all h-40 md:h-auto group"
           >
              <div className="p-3 rounded-full bg-[#E2D2BC]/5 group-hover:bg-[#E2D2BC] group-hover:text-[#646E57] transition-colors mb-2 text-[#E2D2BC]">
                 <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-[#E2D2BC]">New Client Folder</span>
           </button>
        </div>
      </div>
    </div>
  );
};
