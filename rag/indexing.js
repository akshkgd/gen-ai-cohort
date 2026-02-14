import 'dotenv/config'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function init() {
    const pdfFilePath = './atomic_habits.pdf'
    const loader = new PDFLoader(pdfFilePath)

    // load the pdf file page by page (chunking)
    const docs = await loader.load()


    // create vector Embeddings
    const embeddings = new OpenAIEmbeddings({
         model: "text-embedding-3-large",
    })


    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: 'http://localhost:6333',
        collectionName: 'atomic-habits-collection'
    })
}

init()