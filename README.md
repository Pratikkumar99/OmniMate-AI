# OmniMate AI – AI-Powered Research & Document Assistant

OmniMate AI is an AI-powered research and document assistant that combines conversational AI, Retrieval-Augmented Generation (RAG), semantic search, and external API integrations to provide intelligent and context-aware responses.

Users can interact with an AI assistant, upload PDF documents, ask document-related questions, analyze resumes using an ATS evaluation system, and search for real-time information from the web.

---

## 🚀 Features

### 1. AI-Powered Conversational Assistant
- Built using Google's Gemini API.
- Maintains conversation history for contextual responses.
- Classifies user queries based on intent.
- Provides natural-language responses.
- Supports general knowledge and conversational queries.

### 2. PDF-Based Question Answering (RAG)
- Upload PDF documents and extract their text.
- Split extracted text into smaller chunks.
- Generate vector embeddings using Gemini Embeddings.
- Store document embeddings and metadata in Qdrant Cloud.
- Retrieve relevant document chunks using semantic similarity search.
- Generate context-aware answers using Gemini.

### 3. ATS Resume Analysis
- Upload your resume in PDF format.
- Analyze resume content using Gemini.
- Generate an estimated ATS compatibility score out of 100.
- Evaluate multiple resume sections:
  - Formatting
  - Technical Skills
  - Work Experience
  - Projects
  - Education
  - Achievements
- Identify resume strengths and weaknesses.
- Highlight missing keywords and formatting issues.
- Provide actionable suggestions to improve resume quality.
- Convert structured ATS analysis into conversational AI responses.

*Note: ATS scores are AI-generated estimates and do not represent the results of any specific company's ATS software.*

### 4. Semantic Search Using Vector Embeddings
- Convert text into numerical vector representations.
- Store and retrieve embeddings using Qdrant.
- Compare semantic similarity between user queries and document chunks.
- Retrieve relevant information even when exact keywords do not match.

### 5. Web Search Integration
- Integrated Tavily Search for web-based information retrieval.
- Fetch relevant information from external websites.
- Generate AI-powered summaries of search results.

### 6. External API Integrations
- Weather information using WeatherAPI.
- Cryptocurrency information using CoinGecko.
- News information through external news APIs.
- Real-time web search using Tavily.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Backend | Node.js, Express.js |
| AI Model | Google Gemini API |
| Embeddings | Gemini Embedding API |
| Vector Database | Qdrant Cloud |
| RAG | Retrieval-Augmented Generation |
| Web Search | Tavily |
| PDF Processing | pdf-parse |
| File Upload | Multer |
| API Communication | REST APIs |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

```text
                    USER
                      |
                      v
              React Frontend
                      |
                      v
             Express.js Backend
                      |
          +-----------+-----------+
          |                       |
          v                       v
     Normal AI Chat          PDF Upload
          |                       |
          v                       v
      Gemini API            PDF Extraction
                                  |
                                  v
                             Text Chunking
                                  |
                                  v
                         Gemini Embeddings
                                  |
                                  v
                            Qdrant Cloud
                                  |
                                  v
                         User PDF Question
                                  |
                                  v
                         Query Embedding
                                  |
                                  v
                       Semantic Retrieval
                                  |
                                  v
                       Relevant PDF Chunks
                                  |
                                  v
                              Gemini
                                  |
                                  v
                         Generated Answer
```

### ATS Analysis Workflow

```text
              Resume PDF Upload
                      |
                      v
               PDF Text Extraction
                      |
                      v
                Text Chunking
                      |
                      v
                Qdrant Storage
                      |
                      v
             User Requests ATS Analysis
                      |
                      v
              Intent Classification
                      |
                      v
           Retrieve Complete Resume Text
                      |
                      v
              Gemini Resume Analysis
                      |
                      v
             Structured ATS Analysis
                      |
                      v
            Gemini Response Generation
                      |
                      v
             Conversational ATS Report
                      |
                      v
                 React Frontend
```

---

## 🧠 How RAG Works in OmniMate AI

Retrieval-Augmented Generation (RAG) allows an AI model to answer questions using information retrieved from an external knowledge source, such as an uploaded PDF.

### Step 1: PDF Upload
The user uploads a PDF document through the React frontend.

The backend receives the file using Multer.

### Step 2: Text Extraction
The `pdf-parse` library extracts readable text from the uploaded PDF.

### Step 3: Text Chunking
The extracted text is divided into smaller chunks to make retrieval more efficient.

### Step 4: Embedding Generation
Each chunk is converted into a numerical vector using the Gemini Embedding API.

### Step 5: Vector Storage
The embeddings and their associated metadata are stored in Qdrant Cloud.

Metadata includes:
- Document ID
- Chunk index
- Extracted text
- Original filename
- Expiration timestamp

### Step 6: Query Embedding
When the user asks a question, the backend converts the question into an embedding using the same embedding model.

### Step 7: Semantic Retrieval
Qdrant searches for the most relevant document chunks using vector similarity.

### Step 8: Answer Generation
The retrieved chunks are passed to Gemini as context.

Gemini generates an answer grounded in the retrieved document information.

---

## 🗄️ Vector Database – Qdrant

OmniMate AI uses **Qdrant Cloud** as its vector database to store and retrieve document embeddings.

- Stores vector embeddings generated using the Gemini Embedding API.
- Maintains document metadata such as document ID, chunk index, filename, and extracted text.
- Performs semantic search to retrieve relevant document chunks based on user queries.
- Supports document-specific retrieval using metadata filters.
- Provides relevant context to Gemini for generating accurate, document-grounded responses.

**Workflow:**

1. Generate embeddings from document chunks.
2. Store embeddings and metadata in Qdrant Cloud.
3. Convert user questions into embeddings.
4. Search Qdrant for relevant document chunks.
5. Pass retrieved context to Gemini for answer generation.

Interpretation:

| Score | Meaning |
|---|---|
| Close to 1 | Highly similar |
| Close to 0 | Low similarity |
| Close to -1 | Opposite directions |

For normalized embedding vectors, cosine similarity is commonly used to identify semantically related text.

---

## 📂 Project Structure

```text
OmniMate-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── index.js
│   ├── gemini.js
│   ├── package.json
│   ├── uploads/
│   └── .env
│
└── README.md
```

*The structure above is illustrative. Adjust folder names to match your actual repository.*

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- A Gemini API key
- A Qdrant Cloud account and collection
- A Tavily API key
- WeatherAPI key (if using weather functionality)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd OmniMate-AI
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=3000

GEMINI_API_KEY=your_gemini_api_key

QUADRANT_URL=your_qdrant_cloud_url
QUADRANT_KEY=your_qdrant_api_key

TAVILY_API_KEY=your_tavily_api_key

WEATHER_API_KEY=your_weather_api_key
```

Use the exact environment variable names referenced in your source code. Never commit your actual API keys or `.env` file to GitHub.

### 4. Start Backend Server

```bash
npm start
```

Or, if you use Node directly:

```bash
node index.js
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Open the local development URL displayed by Vite in your browser.

---

## 🔗 API Endpoints

### 1. Normal AI Chat

**Endpoint:** `POST /api/chat`

Request:

```json
{
  "question": "Explain artificial intelligence",
  "history": []
}
```

Response:

```json
{
  "answer": "Artificial intelligence is..."
}
```

### 2. Upload PDF

**Endpoint:** `POST /upload`

Content-Type: `multipart/form-data`

Request:
- `file`: PDF document

Response:

```json
{
  "documentId": "generated-document-id",
  "message": "PDF uploaded successfully"
}
```

*Response fields should be adjusted to match your actual backend implementation.*

### 3. Query Uploaded PDF

**Endpoint:** `POST /query`

Request:

```json
{
  "question": "Explain the main topics in this PDF",
  "documentId": "generated-document-id",
  "history": []
}
```

Response:

```json
{
  "question": "Explain the main topics in this PDF",
  "documentId": "generated-document-id",
  "answer": "The document discusses..."
}
```

### 4. ATS Resume Analysis

**Endpoint:** `POST /query`

Request:

```json
{
  "question": "Calculate ATS score of my resume",
  "documentId": "generated-document-id",
  "history": []
}
```

The backend identifies the ATS analysis intent, retrieves the complete resume text from Qdrant, analyzes the resume using Gemini, and generates a conversational explanation.

---

## 🔍 Technologies Explained

### Google Gemini API
Used for:
- Conversational AI
- Intent classification
- Resume analysis
- Answer generation
- Text embeddings

### Qdrant Cloud
A vector database used to store and retrieve document embeddings for semantic search.

### Tavily
A search API designed for AI applications that provides relevant web search results.

### Express.js
Handles backend APIs, PDF uploads, query processing, and communication between services.

### React.js
Provides the interactive frontend for chatting with the AI assistant and uploading documents.

---

## 🔐 Security and Data Handling

- API keys are stored in environment variables.
- Uploaded documents are associated with unique document IDs.
- Document chunks include expiration timestamps.
- PDF queries are restricted to the associated document ID.
- Temporary uploaded files are deleted after processing.

---

## 🚀 Future Improvements

- [ ] Advanced document chunking strategies.
- [ ] Hybrid search combining keyword and vector search.
- [ ] Reranking retrieved document chunks.
- [ ] OCR support for scanned PDF documents.
- [ ] Multi-document RAG.
- [ ] Persistent chat history.
- [ ] Streaming AI responses.
- [ ] Advanced ATS analysis with job-description matching.
- [ ] Resume improvement and rewriting suggestions.
- [ ] Improved document management and user authentication.

---

## ⭐ Support

If you find OmniMate AI interesting, consider giving this repository a star on GitHub!

**OmniMate AI – Making AI-Powered Research and Document Understanding Smarter.**
