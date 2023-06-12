import { Search } from "@/app/[[...id]]/client";
import { getSearchResult } from "@/app/search";

export default async function Handler({
  params,
}: {
  params?: { id?: string[] };
}) {
  if (params && "id" in params && params.id && params.id.length > 0) {
    const data = await getSearchResult(params.id[0]);
    if ("error" in data && !("logs" in data))
      return <Search error="Unable to find this answer" />;
    return <Search {...data} />;
  }

  return <Search />;
}
