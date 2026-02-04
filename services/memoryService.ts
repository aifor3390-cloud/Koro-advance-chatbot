
export interface Synapse {
  id: string;
  fact: string;
  importance: number;
  timestamp: number;
}

const STORAGE_KEY = 'koro_neural_synapses';

export const MemoryService = {
  getSynapses: (): Synapse[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveSynapse: (fact: string, importance: number = 1) => {
    const current = MemoryService.getSynapses();
    // Avoid duplicates
    if (current.some(s => s.fact.toLowerCase() === fact.toLowerCase())) return;
    
    const newSynapse: Synapse = {
      id: Math.random().toString(36).substr(2, 9),
      fact,
      importance,
      timestamp: Date.now()
    };
    
    const updated = [newSynapse, ...current].slice(0, 20); // Keep top 20 memories
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteSynapse: (id: string) => {
    const filtered = MemoryService.getSynapses().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getFormattedContext: (): string => {
    const synapses = MemoryService.getSynapses();
    if (synapses.length === 0) return "";
    return "\n\nCRITICAL USER MEMORIES (SYNAPSES):\n" + 
           synapses.map(s => `- ${s.fact}`).join("\n");
  }
};
