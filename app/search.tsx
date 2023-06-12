"use server";

import { sql } from "@vercel/postgres";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BaseCallbackHandler } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import type { AgentAction } from "langchain/schema";
import { GoogleCustomSearch } from "langchain/tools";
import { WebBrowser } from "langchain/tools/webbrowser";
import { v4 as uuidv4 } from "uuid";

const { GOOGLE_CUSTOM_SEARCH_ENGINE_ID, GOOGLE_CUSTOM_SEARCH_API_KEY } =
  process.env;

const chat = new ChatOpenAI({ temperature: 0 });
const embeddings = new OpenAIEmbeddings();
const tools = [
  new GoogleCustomSearch({
    apiKey: GOOGLE_CUSTOM_SEARCH_API_KEY,
    googleCSEId: GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
  }),
  new WebBrowser({ model: chat, embeddings }),
];

export async function getSearchResult(uuid: string) {
  const result = await sql<{
    result: string;
  }>`SELECT result FROM SearchResult WHERE slug = ${uuid} LIMIT 1`;
  if (!result.rows[0]?.result) return { error: "No result found" };
  return JSON.parse(result.rows[0].result);
}

export async function search(
  data: FormData
): Promise<{ uuid: string } | { error: string }> {
  const query = data.get("query")?.toString();
  const uuid = uuidv4();

  if (!query) return { error: "No query provided" };
  const logs: (AgentAction & { ms: number })[] = [];
  const logsStart = Date.now();

  class CallbackHandler extends BaseCallbackHandler {
    name = "custom_handler";

    handleAgentAction(action: AgentAction) {
      logs.push({ ...action, ms: Date.now() - logsStart });
    }
  }

  const executor = await initializeAgentExecutorWithOptions(tools, chat, {
    agentType: "zero-shot-react-description",
    callbacks: [new CallbackHandler()],
  });

  try {
    const result = await executor.call({ input: query, timeout: 30_000 });
    await sql`INSERT INTO SearchResult (slug, duration, query, result) VALUES (${uuid}, ${
      Date.now() - logsStart
    }, ${query}, ${JSON.stringify({
      logs,
      result,
    })})`;
    return { uuid };
  } catch (error) {
    return { error: String(error) };
  }
}
