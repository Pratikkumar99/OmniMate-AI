const express = require("express");
const app = express();
const cors = require('cors');
const chatting = require('./gemini');

app.use(cors());
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("HEALTH ok");
})

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});