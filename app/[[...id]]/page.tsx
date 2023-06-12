import { Search } from "@/app/[[...id]]/client";
import { getSearchResult } from "@/app/search";

export default async function Handler({
  params,
}: {
  params?: { id?: string[] };
}) {
  if (params && "id" in params && params.id && params.id.length > 0) {
    const data = await getSearchResult(params.id[0]);
    console.log({ data });
    if ("error" in data) return <div>Unknown</div>;
    return <Search {...data} />;
  }

  return <Search />;
}
