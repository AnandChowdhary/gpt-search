import { getSearchResult } from "@/app/search";
import { ImageResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop() || undefined;
  const data = id ? await getSearchResult(id) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "#eee",
          width: "100%",
          padding: "10%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            border: "2px solid #ddd",
            borderRadius: 20,
            padding: "10px 20px",
            backgroundColor: "#fff",
          }}
        >
          {data ? data.query : "Ask Jeeves"}
        </div>
        <div style={{ display: "flex", marginTop: 20 }}>
          <div
            style={{
              backgroundColor: "#444",
              color: "#fff",
              borderRadius: 20,
              padding: "10px 20px",
              fontSize: 48,
            }}
          >
            Ask Jeeves
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}
