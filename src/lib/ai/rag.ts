/**
 * RAG (Retrieval-Augmented Generation) Engine
 * 
 * This service handles the indexing and retrieval of user-provided context
 * to ground AI responses in the brand's specific knowledge data.
 */

export interface KnowledgeDocument {
    id: string;
    title: string;
    content: string;
    type: 'pdf' | 'text' | 'url' | 'past_content';
    tags: string[];
    dateAdded: Date;
    status: 'indexed' | 'processing' | 'error';
}

export interface RetrievalResult {
    documentId: string;
    content: string;
    score: number; // Relevance score (0-1)
}

// In-memory store for demo purposes
// In production, this would be Pinecone, Weaviate, or pgvector
let knowledgeStore: KnowledgeDocument[] = [
    {
        id: 'doc_1',
        title: 'Brand Style Guide 2025',
        content: 'Our brand voice is authoritative but empathetic. We never use slang. We always capitalize our product names: DigitalMEng and AutoGrowth.',
        type: 'text',
        tags: ['branding', 'guidelines'],
        dateAdded: new Date('2025-01-01'),
        status: 'indexed'
    },
    {
        id: 'doc_2',
        title: 'Product Manual - V3',
        content: 'DigitalMEng V3 features include: Autonomous Agents, Predictive AI, and Global Translation. The core benefit is "Marketing on Autopilot".',
        type: 'pdf',
        tags: ['product', 'features'],
        dateAdded: new Date('2025-01-15'),
        status: 'indexed'
    }
];

export const ragEngine = {
    /**
     * Add a document to the knowledge base
     */
    addDocument: async (doc: Omit<KnowledgeDocument, 'id' | 'dateAdded' | 'status'>): Promise<KnowledgeDocument> => {
        const newDoc: KnowledgeDocument = {
            id: `doc_${Date.now()}`,
            ...doc,
            dateAdded: new Date(),
            status: 'processing'
        };

        // Simulate processing/embedding delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        newDoc.status = 'indexed';
        knowledgeStore.push(newDoc);
        return newDoc;
    },

    /**
     * Get all documents
     */
    getDocuments: (): KnowledgeDocument[] => {
        return [...knowledgeStore];
    },

    /**
     * Remove a document
     */
    removeDocument: (id: string) => {
        knowledgeStore = knowledgeStore.filter(d => d.id !== id);
    },

    /**
     * Retrieve relevant context for a query
     * Uses simple keyword overlap / semantic simulation for demo
     */
    retrieveContext: async (query: string, limit: number = 3): Promise<RetrievalResult[]> => {
        const queryTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);

        const results = knowledgeStore.map(doc => {
            let score = 0;
            const contentLower = doc.content.toLowerCase();

            // Simple keyword scoring
            queryTerms.forEach(term => {
                if (contentLower.includes(term)) score += 0.3;
                if (doc.title.toLowerCase().includes(term)) score += 0.5;
            });

            // Boost tags matches
            doc.tags.forEach(tag => {
                if (query.toLowerCase().includes(tag.toLowerCase())) score += 0.4;
            });

            // Normalize score cap
            score = Math.min(score, 1);

            return {
                documentId: doc.id,
                content: doc.content,
                score
            };
        });

        // Sort by score and take top N
        return results
            .filter(r => r.score > 0.1) // Minimum relevance threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },

    /**
     * Format context for the LLM prompt
     */
    formatContextForPrompt: (results: RetrievalResult[]): string => {
        if (results.length === 0) return '';

        return `
CONTEXT FROM KNOWLEDGE BASE:
The following information is retrieved from the verified brand documents. Use this to ground your answer and ensure factual accuracy.

${results.map((r, i) => `[SOURCE ${i + 1}]: ${r.content}`).join('\n\n')}

END OF CONTEXT
`;
    }
};
