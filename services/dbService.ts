
import { User, Client, ProjectDesign } from '../types';

// Keys for localStorage
const USERS_KEY = 'rescape_users';
const CLIENTS_KEY = 'rescape_clients';
const DESIGNS_KEY = 'rescape_designs';
const SESSION_KEY = 'rescape_session';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  // --- AUTH ---
  async register(name: string, email: string, password: string): Promise<User> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password // In a real app, never store plain text passwords!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.createSession(newUser);
    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.createSession(user);
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  createSession(user: User) {
    // strip password for session
    const { password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  },

  // --- CLIENTS ---
  async getClients(userId: string): Promise<Client[]> {
    await delay(300);
    const clients: Client[] = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
    return clients.filter(c => c.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async createClient(userId: string, data: { name: string, address?: string, email?: string }): Promise<Client> {
    await delay(300);
    const clients: Client[] = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
    
    const newClient: Client = {
      id: Date.now().toString(),
      userId,
      name: data.name,
      address: data.address || '',
      email: data.email || '',
      createdAt: Date.now()
    };

    clients.push(newClient);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return newClient;
  },

  async deleteClient(clientId: string) {
    const clients: Client[] = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
    const newClients = clients.filter(c => c.id !== clientId);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(newClients));

    // Cleanup designs
    const designs: ProjectDesign[] = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]');
    const newDesigns = designs.filter(d => d.clientId !== clientId);
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(newDesigns));
  },

  // --- DESIGNS ---
  async getDesigns(clientId: string): Promise<ProjectDesign[]> {
    await delay(300);
    const designs: ProjectDesign[] = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]');
    return designs.filter(d => d.clientId === clientId).sort((a, b) => b.timestamp - a.timestamp);
  },

  async saveDesign(userId: string, clientId: string, data: { original: string, generated: string, prompt: string }): Promise<ProjectDesign> {
    await delay(600);
    const designs: ProjectDesign[] = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]');

    const newDesign: ProjectDesign = {
      id: Date.now().toString(),
      userId,
      clientId,
      originalImage: data.original,
      generatedImage: data.generated,
      prompt: data.prompt,
      timestamp: Date.now()
    };

    designs.push(newDesign);
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
    return newDesign;
  }
};
