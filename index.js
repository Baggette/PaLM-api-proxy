const express = require("express");
const dotenv = require("dotenv");

const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

dotenv.config();
const app = express();
app.use(express.json()); // Parse JSON bodies

app.post("/", async (req, res) => {
    if (req.body.api_key == null || req.body.prompt == null) return res.status(400).json({ error: "Please provide an API key and prompt" });

    const PALM_MODEL_NAME = "models/text-bison-001";
    const API_KEY = req.body.api_key;
    const PROMPT = `${req.body.prompt}`;

    try {
        if (!req.body.gemini) {
            const client = new TextServiceClient({
                authClient: new GoogleAuth().fromAPIKey(API_KEY),
            });

            const result = await client.generateText({
                model: PALM_MODEL_NAME,
                prompt: {
                    text: PROMPT,
                },
            });

            const response = req.body.full ? JSON.stringify(result) : JSON.stringify(result[0]?.candidates[0]?.output || "Sorry I don't feel comfortable answering that question.");
            res.json({ response });
        } else {
            const safetySettings = [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                }, {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                }, {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                }, {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ];

            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

            const result = await model.generateContent(PROMPT);
            const response = (await result.response)?.text() || "Sorry I don't feel comfortable answering that question.";
            res.json({ response });
        }
    } catch (err) {
        res.status(500).json({ error: err.stack });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
