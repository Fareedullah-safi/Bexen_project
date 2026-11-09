import { fixData } from "@/Lib/fixText"; // ← added
import dbConnect from "@/Lib/mongoDB";
import { BLOCK_REGISTRY } from "@/Lib/PageBuilder/blocks";
import Page from "@/Models/Pages/Page";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

function normalizeLang(value) {
  if (value === "ps" || value === "fa" || value === "en") {
    return value;
  }
  return "en";
}

export default async function DynamicFrontendPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  await dbConnect();
  const page = await Page.findOne({ slug: slug }).lean();

  if (!page) {
    notFound();
  }

  // Get active language from cookie set by NavBar
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("site-language");
  let lang = "en";

  if (langCookie && langCookie.value) {
    lang = normalizeLang(langCookie.value);
  }

  // Sort blocks by order
  const sortedBlocks = [];
  const blocks = page.blocks || [];

  for (let i = 0; i < blocks.length; i++) {
    sortedBlocks.push(blocks[i]);
  }

  sortedBlocks.sort(function (a, b) {
    return a.order - b.order;
  });

  return (
    <main className="min-h-screen">
      {page.status === "draft" && (
        <div className="sticky top-0 z-50 bg-amber-500 py-1 text-center text-xs font-bold text-black">
          DRAFT PREVIEW — Publish in Admin to make this public.
        </div>
      )}

      {sortedBlocks.map(function (block) {
        const def = BLOCK_REGISTRY[block.type];
        if (!def) {
          return null;
        }

        const View = def.FrontendView;
        if (!View) {
          return null;
        }

        return (
          <div key={block.blockId} id={"block-" + block.blockId}>
            <View
              data={fixData(block.data)} // ← changed
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
