import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Pagination, Chip, CircularProgress } from "@mui/material";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";
import { getPublicBlogs } from "../../api/blogs.api";

const PAGE_SIZE = 9;

const truncate = (text, max) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";

const BlogListPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["public", "blogs", page],
    queryFn: () => getPublicBlogs({ page, limit: PAGE_SIZE }),
  });

  const blogs = data?.data?.blogs || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <title>Dental Health Blog | Ujjwal Dental Planet, Sonipat</title>
      <meta
        name="description"
        content="Read expert dental health tips, treatment guides, and clinic updates from Ujjwal Dental Planet in Sonipat. Stay informed about painless dentistry, implants, and more."
      />
      <meta
        name="keywords"
        content="dental blog Sonipat, dental health tips, Ujjwal Dental Planet blog"
      />
      <link rel="canonical" href="https://ujjwaldentalplanet.com/blog" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content="Dental Health Blog | Ujjwal Dental Planet, Sonipat" />
      <meta
        property="og:description"
        content="Read expert dental health tips, treatment guides, and clinic updates from Ujjwal Dental Planet in Sonipat."
      />
      <meta property="og:url" content="https://ujjwaldentalplanet.com/blog" />
      <meta
        property="og:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Dental Health Blog | Ujjwal Dental Planet, Sonipat" />
      <meta
        name="twitter:description"
        content="Read expert dental health tips, treatment guides, and clinic updates from Ujjwal Dental Planet in Sonipat."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": "https://ujjwaldentalplanet.com/blog#blog",
            name: "Ujjwal Dental Planet Blog",
            url: "https://ujjwaldentalplanet.com/blog",
            publisher: { "@id": "https://ujjwaldentalplanet.com/#organization" },
          }),
        }}
      />

      <BreadcrumbBanner
        title="Our Blog"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Blog" }]}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto" style={{ fontSize: "1rem" }}>
            Dental health tips, treatment guides, and updates from the Ujjwal Dental Planet team in
            Sonipat.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <CircularProgress sx={{ color: "#f57c00" }} />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No blog posts yet — check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="flex flex-col rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <Link to={`/blog/${blog.slug}`} className="no-underline">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          loading="lazy"
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-[#e8f4fd] flex items-center justify-center">
                          <span className="text-[#006694] font-bold text-lg">Ujjwal Dental</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-col flex-grow p-5">
                      {blog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <Chip key={tag} size="small" label={tag} variant="outlined" className="capitalize" />
                          ))}
                        </div>
                      )}
                      <Link to={`/blog/${blog.slug}`} className="no-underline">
                        <h2
                          className="text-[#003366] hover:text-[#006694] transition-colors duration-200 mb-2"
                          style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.35 }}
                        >
                          {blog.title}
                        </h2>
                      </Link>
                      <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-grow">
                        {truncate(blog.excerpt, 120)}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                        <span className="text-gray-400 text-xs">{formatDate(blog.publishedAt)}</span>
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="text-accent text-sm font-semibold no-underline hover:underline"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => {
                      setPage(value);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogListPage;
