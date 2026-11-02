import dbConnect from "@/Lib/mongoDB"; // or your connect path
import { BLOCK_REGISTRY } from "@/Lib/PageBuilder/blocks";
import Page from "@/Models/Pages/Page";
import { notFound } from "next/navigation";

export default async function DynamicFrontendPage({ params }) {
  const { slug } = await params;

  await dbConnect();
  const page = await Page.findOne({ slug }).lean();

  if (!page) notFound();

  // Optional: only show published to public
  // if (page.status !== "published") notFound();

  const sortedBlocks = [...(page.blocks || [])].sort(
    (a, b) => a.order - b.order,
  );
  const lang = "en";

  return (
    <main className="min-h-screen">
      {page.status === "draft" && (
        <div className="sticky top-0 z-50 bg-amber-500 py-1 text-center text-xs font-bold text-black">
          DRAFT PREVIEW — Publish in Admin to make this public.
        </div>
      )}

      {sortedBlocks.map((block) => {
        const def = BLOCK_REGISTRY[block.type];
        if (!def) return null;
        const View = def.FrontendView;

        return (
          <div key={block.blockId} id={`block-${block.blockId}`}>
            <View
              data={block.data}
              lang={lang}
              pageTitle={page.title}
              pageSlug={page.slug}
            />
          </div>
        );
      })}
    </main>
  );
}
