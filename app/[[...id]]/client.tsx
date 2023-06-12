"use client";

import { search } from "@/app/search";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Search(props?: {
  logs?: { ms: number; tool: string; toolInput: string; log: string }[];
  result?: { output?: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(
    props?.result?.output ?? null
  );
  const [pending, setPending] = useState<boolean>(false);
  const [logs, setLogs] = useState<
    { ms: number; tool: string; toolInput: string; log: string }[]
  >(props?.logs ?? []);
  const { push } = useRouter();

  return (
    <main className="flex min-h-screen flex-col space-y-8 items-center p-24 max-w-2xl mx-auto">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          setResult(null);
          setLogs([]);
          const result = await search(new FormData(event.currentTarget));
          if ("error" in result) setError(result.error);
          else push(`/${result.uuid}`);
        }}
        className="w-full"
      >
        <label className="flex flex-col space-y-4 w-full">
          <span className="text-2xl font-bold">Ask a question</span>
          <input
            autoFocus
            name="query"
            className="block w-full px-5 py-3 bg-white border-gray-300 rounded-md shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-400 disabled:bg-white disabled:cursor-not-allowed"
            type="search"
            placeholder="What is the meaning of life?"
            disabled={pending}
          />
          <div>
            <button
              type="submit"
              className={`bg-slate-600 text-white py-2 px-5 rounded disabled:cursor-not-allowed ${
                pending ? "text-slate-400" : ""
              }`}
              disabled={pending}
            >
              {pending ? "Thinking..." : "Ask Jeeves"}
            </button>
          </div>
        </label>
      </form>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full">
          <strong className="font-bold">Error</strong>
          <span className="ml-3">{error}</span>
        </div>
      ) : (
        result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-full">
            {result}
          </div>
        )
      )}
      {logs.length > 0 && (
        <details className="w-full space-y-4">
          <summary className="font-medium">🧠 Thought process</summary>
          {logs.map((log, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-slate-200 rounded-full inline-flex uppercase text-xs px-3 py-1 tracking-wider">
                    {log.tool.replace(/-/g, " ")}
                  </div>
                  <div className="text-slate-500 tabular-nums text-sm">
                    {`00:${Math.round(log.ms / 1000)
                      .toString()
                      .padStart(2, "0")}`}
                  </div>
                </div>
                <div>{log.log.split("\n")[0]}</div>
              </div>
              <div className="bg-slate-600 font-mono text-sm p-4 overflow-x-auto text-slate-300 rounded-b-lg shadow">
                {log.toolInput.replace(`","`, " => ")}
              </div>
            </div>
          ))}
        </details>
      )}
      <footer className="w-full">
        <p>
          <a
            href="https://github.com/AnandChowdhary/gpt-search"
            className="text-slate-500 hover:text-slate-400 inline-flex items-center space-x-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              width={20}
              height={20}
              alt="GitHub"
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
            />
            <span>AnandChowdhary/gpt-search</span>
          </a>
        </p>
      </footer>
    </main>
  );
}
