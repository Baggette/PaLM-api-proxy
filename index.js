const express = require("express");
const dotenv = require("dotenv");

const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();

app.get("/", async (req, res) => {
    if (req.query.api_key == null || req.query.prompt == null) return res.send("Please provide an API key and prompt");
    const PALM_MODEL_NAME = "models/text-bison-001";
    const API_KEY = req.query.api_key;
    const PROMPT = `${req.query.prompt}`;

    if (!req.query.gemini) {

        const client = new TextServiceClient({
            authClient: new GoogleAuth().fromAPIKey(API_KEY),
        });

        const result = await client.generateText({
            model: PALM_MODEL_NAME,
            prompt: {
                text: PROMPT,
            },
        });

        console.log(JSON.stringify(result));
        res.send(req.query.full ? `{"response" : ${JSON.stringify(result)}}` : `{"response" : ${JSON.stringify(result[0].candidates[0].output) || "Sorry I don't feel comfortable answering that question."}}`);
    } else {
        try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(PROMPT).response;
        const text = result.text();

        console.log(text);
        res.send(`{"response" : ${text || "Sorry I don't feel comfortable answering that question."}}`);
        } catch(err) {
            res.send(`{"error" : ${err}}`);
        }
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});