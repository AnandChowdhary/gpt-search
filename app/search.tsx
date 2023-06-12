"use server";

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BaseCallbackHandler } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import type { AgentAction } from "langchain/schema";
import { GoogleCustomSearch } from "langchain/tools";
import { WebBrowser } from "langchain/tools/webbrowser";

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

export async function search(
  data: FormData
): Promise<
  | { logs: (AgentAction & { ms: number })[]; error: string }
  | { logs: (AgentAction & { ms: number })[]; result: string }
> {
  const query = data.get("query")?.toString();
  if (!query) return { logs: [], error: "No query provided" };

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
    if ("output" in result) {
      return { logs, result: result.output };
    } else if ("error" in result) {
      return { logs, error: result.error };
    } else {
      return { logs, error: "I was unable to answer this question." };
    }
  } catch (error) {
    return { logs, error: String(error) };
  }
}
