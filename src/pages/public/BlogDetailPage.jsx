import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chip, CircularProgress } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { getPublicBlogBySlug, getPublicBlogs } from "../../api/blogs.api";
import { GTAG_CONVERSIONS } from "../../utils/gtagConversions";

const fireBookAppointmentConversion = () => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: GTAG_CONVERSIONS.BOOK_APPOINTMENT });
  }
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";

const BlogDetailPage = () => {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "blogs", "slug", slug],
    queryFn: () => getPublicBlogBySlug(slug),
    retry: false,
  });

  const blog = data?.data?.blog;

  // Related posts — best-effort, non-blocking; only fetched once the main post has loaded.
  const { data: relatedData } = useQuery({
    queryKey: ["public", "blogs", "related", slug],
    queryFn: () => getPublicBlogs({ page: 1, limit: 4 }),
    enabled: !!blog,
  });

  const relatedPosts = (relatedData?.data?.blogs || [])
    .filter((b) => b.slug !== slug)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress sx={{ color: "#f57c00" }} />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <>
        <title>Blog Post Not Found | Ujjwal Dental Planet</title>
        <meta name="robots" content="noindex, follow" />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 className="text-[#003366] text-2xl font-bold mb-3">Blog post not found</h1>
          <p className="text-gray-500 mb-6">
            The blog post you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/blog"
            className="inline-block no-underline bg-accent hover:bg-accent-dark text-white rounded-xl px-6 py-3 text-[15px] font-semibold transition-colors duration-200"
          >
            ← Back to Blog
          </Link>
        </div>
      </>
    );
  }

  const metaTitle = `${blog.seoTitle || blog.title} | Ujjwal Dental Planet`;
  const metaDescription = blog.seoDescription || blog.excerpt || blog.title;
  const canonicalUrl = `https://ujjwaldentalplanet.com/blog/${blog.slug}`;

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="article" />
      {blog.coverImage && <meta property="og:image" content={blog.coverImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {blog.coverImage && <meta name="twitter:image" content={blog.coverImage} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: blog.title,
            description: blog.excerpt,
            ...(blog.coverImage ? { image: blog.coverImage } : {}),
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt,
            author: { "@type": "Person", name: blog.author?.name || "Ujjwal Dental Planet" },
            publisher: {
              "@type": "Organization",
              name: "Ujjwal Dental Planet",
              logo: {
                "@type": "ImageObject",
                url: "https://ujjwaldentalplanet.com/ujjwal-dental-logo.png",
              },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          }),
        }}
      />

      {/* Cover image hero */}
      {blog.coverImage && (
        <div className="w-full max-h-[420px] overflow-hidden bg-gray-100">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to="/blog"
            className="inline-block text-accent text-sm font-semibold no-underline hover:underline mb-4"
          >
            ← Back to Blog
          </Link>

          <h1 className="text-[#003366] font-extrabold text-3xl md:text-4xl leading-tight mb-4">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <CalendarTodayIcon sx={{ fontSize: 16 }} />
              {formatDate(blog.publishedAt)}
            </span>
            {blog.author?.name && (
              <span className="flex items-center gap-1.5">
                <PersonIcon sx={{ fontSize: 16 }} />
                {blog.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <VisibilityIcon sx={{ fontSize: 16 }} />
              {(blog.views || 0).toLocaleString("en-IN")} views
            </span>
          </div>

          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {blog.tags.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" className="capitalize" />
              ))}
            </div>
          )}

          {/* Blog content — trusted, admin-authored HTML from the CMS rich text editor */}
          <div
            className="max-w-none text-gray-700 text-base leading-[1.8]
              [&_h2]:text-[#003366] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-[#003366] [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
              [&_a]:text-accent [&_a]:underline
              [&_strong]:font-semibold [&_strong]:text-[#003366]
              [&_img]:rounded-xl [&_img]:my-6 [&_img]:w-full"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <Link
            to="/blog"
            className="inline-block text-accent text-sm font-semibold no-underline hover:underline mt-8"
          >
            ← Back to Blog
          </Link>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-14 pt-8 border-t border-gray-100">
              <h2 className="text-[#003366] font-bold text-xl mb-5">Related Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug}`}
                    className="block no-underline rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-[#e8f4fd]" />
                    )}
                    <p className="text-[#003366] text-sm font-semibold p-3 leading-snug">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0D1B4A] py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-white font-bold text-2xl mb-2">Ready to book an appointment?</h2>
          <p className="text-gray-300 mb-6">Visit Ujjwal Dental Planet in Sonipat for expert dental care.</p>
          <Link
            to="/book-appointment"
            onClick={fireBookAppointmentConversion}
            className="inline-flex items-center gap-2 no-underline bg-accent hover:bg-accent-dark text-white rounded-xl px-7 py-3 text-[15px] font-semibold transition-colors duration-200"
          >
            <EventAvailableIcon sx={{ fontSize: 20 }} />
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  );
};

export default BlogDetailPage;
