# 🧠 Brand Vault (RAG) Implementation Guide

## Overview
We have successfully integrated a **Retrieval-Augmented Generation (RAG)** system into DigitalMEng, dubbed **"Brand Vault"**. This allows the AI to learn from your specific business documents rather than just relying on generic training data.

## Key Features
1.  **Knowledge Base Interface**: A new tab in the Dashboard where you can upload and manage your "Source of Truth" documents.
2.  **Context Injection**: The `ContentGenerator` now retrieves relevant snippets from your Knowledge Base before writing any blog post, social caption, or email.
3.  **Semantic Search**: The system uses keyword and tag matching (upgradable to Vector Embeddings) to find the exact paragraph needed to answer a specific prompt.

## How to Use
1.  **Navigate to "Brand Vault"**: detailed in the top navigation bar of your Dashboard.
2.  **Upload Documents**: Paste text from your:
    *   Brand Style Guide
    *   Product Manuals / Specs
    *   High-performing past content
    *   Competitor Analysis
3.  **Tag Effectively**: Use tags like `product`, `tone`, `legal` to help the AI find the right info.
4.  **Generate Content**: When running the "Content Autopilot", the system will automatically consult the Brand Vault.

## Technical Architecture
*   **Engine**: `src/lib/ai/rag.ts` - Manages indexing and retrieval.
*   **UI**: `src/components/KnowledgeBase.tsx` - User interface for document management.
*   **Integration**: `src/lib/ai/contentGenerator.ts` - Injects retrieved context into LLM prompts.

## Future Roadmap (Production)
*   [ ] **Vector Database**: Migrate in-memory store to **Pinecone** or **pgvector** for handling millions of documents.
*   [ ] **PDF Parsing**: Add server-side parsing to handle raw PDF/Docx uploads automatically.
*   [ ] **Auto-Crawling**: Add a feature to crawl your website URL and auto-index all pages.

**Status**: ✅ LIVE (Simulated Memory Mode)
