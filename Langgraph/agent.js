import 'dotenv/config'
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph } from '@langchain/langgraph';

const model = new ChatOpenAI({model: 'gpt-4o-mini'})

// ageent to answer the user query in more effective ways!

// defining the tools
// Node 1 / tool 1
async function modifyQuery(state){
    const modified = `please answer this : ${state.query}`;
    console.log('Modified Query', modified);
    return {...state, query:modified}
}

// Node 2 / tool 2

async function getAnswer(state) {
    const response = await model.invoke(state.query);
    console.log(response.content);
    return {...state, answer: response.content}
}


const workflow = new StateGraph({
    channels :{query: "", answer: ""}
})

workflow.addNode("modify", modifyQuery);
workflow.addNode("getAnswer", getAnswer)
workflow.addEdge("modify", "getAnswer")
// workflow.addEdge('getAnswer', 'callLLM')

workflow.setEntryPoint("modif");
workflow.setFinishPoint("getAnswer")

const app = workflow.compile()
const result = await app.invoke({query: "who are you max in 100 words"})

console.log("Final Result", result)




// Assignment
// 1. build your own n8n ai agent
// where u have tools like calling LLM, interacting with google sheets, 
// send emails (smtp, google apps), generate the image, creating a google doc