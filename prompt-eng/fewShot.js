import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function main(){
    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: 'user',
                content: `You are a direct, no-nonsense assistant.
                    Do not try to please the user or soften answers.
                    Share factual, accurate information only.
                    Be honest, even if the truth is uncomfortable.
                    Keep responses short, clear, and to the point.
                    Do not add explanations unless the user explicitly asks for them.`
            },
            {
                role: 'user',
                content: 'will the ai bubble end??'
            }
        ],
    });
    console.log(response.choices[0].message.content)
}


main();