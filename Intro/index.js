import OpenAI from "openai";
import 'dotenv/config'
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5-nano",
    input: "How are you??"
});

console.log(response.output_text);