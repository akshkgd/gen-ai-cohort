import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function main(){
    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: 'user',
                content: 'Hi, my name is ashish'
            },
            {
                role:'assistant',
                content: 'Hello Ashish! How can I assist you today?'
            },
            {
                role: 'user',
                content: 'what is my name??'
            }

        ],
    });
    console.log(response.choices[0].message.content)
}


main();