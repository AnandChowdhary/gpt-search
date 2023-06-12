import { Search } from "@/app/[[...id]]/client";
import { getSearchResult } from "@/app/search";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params?: { id?: string[] };
};

export async function generateMetadata(
  { params }: Props,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const data =
    params && "id" in params && params.id && params.id.length > 0
      ? await getSearchResult(params.id[0])
      : undefined;
  const previousImages = (await parent)?.openGraph?.images || [];

  return {
    title: data ? `${data.query} - 🔍 Ask Jeeves` : "🔍 Ask Jeeves",
    openGraph: {
      images:
        params && "id" in params && params.id && params.id.length > 0
          ? [`/image/${params.id[0]}`, ...previousImages]
          : [],
    },
  };
}

export default async function Handler({ params }: Props) {
  if (params && "id" in params && params.id && params.id.length > 0) {
    const data = await getSearchResult(params.id[0]);
    if ("error" in data && !("logs" in data))
      return <Search error="Unable to find this answer" />;
    return <Search {...data} />;
  }

  return <Search />;
}
