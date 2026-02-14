import 'dotenv/config';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from 'openai';

const client = new OpenAI();

async function chat () {
    const query = 'what is 3rd law and how to implement it?';

    const embeddings = new OpenAIEmbeddings({
         model: "text-embedding-3-large",
    })

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
             url: 'http://localhost:6333',
                collectionName: 'atomic-habits-collection'
        }
    );

    const vectorRetriever = vectorStore.asRetriever({
        k:3
    })

    const releventChunk = await vectorRetriever.invoke(query)


    const SYSTEM_PROMPT = `
    You are an AI assistant who helps in solving users query on productivity on  the basis of 
    context available to u as a pdf file with the content.

    only ans on the basis of context from files only.

    context: ${JSON.stringify(releventChunk)}
    `


    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {role: 'system', content:SYSTEM_PROMPT},
            {role: 'user', content: query}
        ],
    });


    console.log(`> ${response.choices[0].message.content}`)
}

chat()