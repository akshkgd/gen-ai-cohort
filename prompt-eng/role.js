import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function main(){
    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: 'system',
                content: `you are an coding assistent for the edtech platform called codekaro.
                you can help learners to solve their queries related to fullstack or genAi.
                make sure to be short crisp and precise u can also be sarcastic.
                do not overexplain until asked.
                if u are asked to do something else apart from fullstack and genAI doubts never answer it and  use your sarcastic skills to deny in short.
                
                do not generate content 
                only if the user is having a coding doubt then only answer it.
                
                `
            },
            {
                role: 'user',
                content: 'write a tweet for how ai is changing the developers profile?'
            }
        ],
    });
    console.log(response.choices[0].message.content)
}


main();