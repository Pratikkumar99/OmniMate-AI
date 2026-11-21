const express = require("express");
const app = express();
const cors = require("cors");
const { QdrantClient } = require("@qdrant/qdrant-js");
const { chatting, createEmbedding, normalAnswer,classifyPDFIntent,
  analyzeResume, } = require("./gemini");
const fs = require("fs");
const { randomUUID } = require("crypto");
const multer = require("multer");
const pdfParse = require("pdf-parse");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HEALTH ok");
});

const upload = multer({ dest: "uploads/" });

function cosineSimilarity(vecA, vecB) {
  let dotProd = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProd += vecA[i] * vecB[i];
  }
  return dotProd;
}
const quadrant = new QdrantClient({
  url: process.env.QUADRANT_URL,
  apiKey: process.env.QUADRANT_KEY,
});
// app.get('/createCollection',async (req,res)=>{
//   try{
//     await quadrant.createCollection('omnimate',{
//       vectors:{
//         size:3072,
//         distance :'Cosine'
//       }
//     })
//     res.send("Colletion is created");
//   }catch(err){
//     res.send(500).send(err);
//   }
// })

// PDF upload and RAG

async function createIndexes() {
  // Index for filtering by documentId
  await quadrant.createPayloadIndex("omnimate", {
    field_name: "documentId",
    field_schema: "keyword",
    wait: true,
  });

  // Index for filtering by expiry timestamp
  await quadrant.createPayloadIndex("omnimate", {
    field_name: "expiresAt",
    field_schema: "integer",
    wait: true,
  });

  // console.log("Qdrant payload indexes created successfully");
}

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a PDF",
      });
    }

    // 1. Read PDF
    const dataBuffer = fs.readFileSync(req.file.path);

    // 2. Extract text
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // 3. Split into chunks
    const chunks = text
      .split(/\n\s*\n/)
      .filter((chunk) => chunk.trim() !== "");

    if (chunks.length === 0) {
      return res.status(400).json({
        error: "No readable text found in this PDF",
      });
    }

    // 4. Generate document ID and expiry
    const documentId = randomUUID();
    const expiresAt = Date.now() + 5 * 24 * 60 * 60 * 1000;

    // 5. Generate embeddings
    const points = [];

    for (let index = 0; index < chunks.length; index++) {
      const embedding = await createEmbedding(chunks[index]);

      points.push({
        id: randomUUID(),
        vector: embedding,
        payload: {
          text: chunks[index],
          documentId,
          chunkIndex: index,
          fileName: req.file.originalname,
          expiresAt,
        },
      });
    }

    // 6. Store everything in Qdrant
    await quadrant.upsert("omnimate", {
      points,
      wait: true,
    });

    // 7. Send document details to frontend
    res.json({
      message: "PDF uploaded successfully",
      documentId,
      fileName: req.file.originalname,
      totalChunks: chunks.length,
      expiresAt,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    res.status(500).json({
      error: error.message,
    });

  } finally {
    // Delete temporary PDF
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});


async function getFullDocumentText(documentId) {
  let allPoints = [];
  let offset = undefined;

  while (true) {
    const result = await quadrant.scroll("omnimate", {
      limit: 100,
      offset,
      with_payload: true,
      with_vector: false,

      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
          {
            key: "expiresAt",
            range: {
              gt: Date.now(),
            },
          },
        ],
      },
    });

    allPoints.push(...result.points);

    if (!result.next_page_offset) {
      break;
    }

    offset = result.next_page_offset;
  }

  // Sort chunks in original PDF order
  allPoints.sort(
    (a, b) =>
      a.payload.chunkIndex - b.payload.chunkIndex
  );

  // Combine all extracted text
  const fullText = allPoints
    .map((point) => point.payload.text)
    .join("\n\n");

  return fullText;
}

app.post("/query", async (req, res) => {
  try {
    const { question, documentId } = req.body;

    // 1. Validate input
    if (!question || !documentId) {
      return res.status(400).json({
        error: "Question and documentId are required",
      });
    }

    // 2. Classify user intent
    const classification = await classifyPDFIntent(question);

    // 3. ATS ANALYSIS
    if (classification.intent === "ATS_ANALYSIS") {

      console.log("Retrieving complete resume...");

      // Retrieve ALL chunks
      const resumeText = await getFullDocumentText(documentId);

      if (!resumeText) {
        return res.status(404).json({
          error: "PDF not found or expired",
        });
      }

      // Analyze complete resume using Gemini
      const atsResult = await analyzeResume(resumeText);

      if (!atsResult.isResume) {
        return res.status(400).json({
          error: atsResult.reason,
        });
      }

      return res.json({
        question,
        documentId,
        answer: atsResult,
      });
    }

    // 4. NORMAL PDF QUESTION
    const questionEmbedding = await createEmbedding(question);

    // Search relevant chunks
    const searchResult = await quadrant.query("omnimate", {
      query: questionEmbedding,
      limit: 2,
      with_payload: true,

      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
          {
            key: "expiresAt",
            range: {
              gt: Date.now(),
            },
          },
        ],
      },
    });

    // Retrieve top 2 chunks
    const bestChunks = (searchResult.points || [])
      .map((point) => point.payload.text)
      .join("\n\n");

    if (!bestChunks) {
      return res.status(404).json({
        error: "No relevant information found in this PDF",
      });
    }

    // Generate normal PDF answer
    const answer = await normalAnswer(`
      You are OmniMate AI, a helpful PDF assistant.

      Answer the user's question using ONLY the context below.

      If the context does not contain the answer,
      clearly say that you cannot find it in the document.

      Question:
      ${question}

      Context:
      ${bestChunks}
    `);

    return res.json({
      question,
      answer,
      documentId,
      score: searchResult.points[0].score,
    });

  } catch (error) {
    console.error("QUERY ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});


async function deleteExpiredDocuments() {
  try {
    await quadrant.delete("omnimate", {
      wait: true,
      filter: {
        must: [
          {
            key: "expiresAt",
            range: {
              lt: Date.now(),
            },
          },
        ],
      },
    });

    console.log("Expired documents cleanup completed");

  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    const answer = await chatting(question, history);

    res.json({ answer });
  } catch (error) {
    console.error("BACKEND ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Create indexes before using filters
    await createIndexes();

    // 2. Delete expired documents once at startup
    await deleteExpiredDocuments();

    // 3. Schedule cleanup every 10 minutes
    setInterval(() => {
      deleteExpiredDocuments();
    }, 10 * 60 * 1000);

    // 4. Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server initialization failed:", error);
  }
}

startServer();