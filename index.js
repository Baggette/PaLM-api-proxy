const express = require('express');
const dotenv = require('dotenv');
const { TextServiceClient } =
  require("@google-ai/generativelanguage").v1beta2;

const { GoogleAuth } = require("google-auth-library");
dotenv.config();
const app = express();

app.get('/', async (req, res) => {
    if(req.query.api_key == null || req.query.prompt == null) return res.send("Please provide an API key and prompt");
    const MODEL_NAME = "models/text-bison-001";
    const API_KEY = req.query.api_key;

    const client = new TextServiceClient({
        authClient: new GoogleAuth().fromAPIKey(API_KEY),
    });

    const prompt = `${req.query.prompt}`;

    client
        .generateText({
        model: MODEL_NAME,
        prompt: {
          text: prompt,
        },
      })
    .then((result) => {
        console.log(JSON.stringify(result[0].candidates[0].output));
        res.send(`{response : "${JSON.stringify(result[0].candidates[0].output)}"}`);
})})

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});