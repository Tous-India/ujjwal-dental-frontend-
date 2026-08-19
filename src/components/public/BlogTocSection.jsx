/**
 * BlogTocSection
 *
 * Renders a Table of Contents nav from H2 headings found in a blog post's
 * stored HTML. Returns null when there are fewer than 3 H2 headings (not
 * worth showing a TOC).
 *
 * Exported buildToc() is also used by BlogDetailPage to inject anchor ids
 * into the rendered article body so the TOC links scroll correctly.
 */

/**
 * Build TOC items from H2 headings in an HTML string.
 * Returns [] when there are fewer than 3 headings.
 * Duplicate slugs are disambiguated by appending -1, -2 … (GitHub style).
 */
export function buildToc(html) {
  const matches = [...(html || "").matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  if (matches.length < 3) return [];
  const seen = {};
  return matches.map((m, i) => {
    const text = m[1].replace(/<[^>]*>/g, "").trim();
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const key = base || `heading-${i}`;
    seen[key] = (seen[key] || 0) + 1;
    const id = seen[key] === 1 ? key : `${key}-${seen[key] - 1}`;
    return { id, text };
  });
}

export default function BlogTocSection({ content }) {
  const toc = buildToc(content || "");
  if (toc.length < 3) return null;

  return (
    <nav className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
      <p className="font-semibold text-[#003366] mb-3 text-sm">Contents</p>
      <ol className="list-decimal pl-5 space-y-1">
        {toc.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-accent text-sm hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
