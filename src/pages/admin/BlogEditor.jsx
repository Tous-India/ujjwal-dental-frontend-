/**
 * Admin Blog Create/Edit Page
 *
 * Handles both /admin/blogs/new (create) and /admin/blogs/:id/edit (edit) —
 * presence of the :id route param determines the mode.
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/admin/blog/RichTextEditor";
import { useBlog, useBlogMutations } from "../../hooks/admin/useBlogs";
import { uploadBlogImage } from "../../api/admin/blogs.api";

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);

const BLOG_CATEGORIES = ["Oral Hygiene", "Treatments", "Patient Stories", "General"];

const WORDS_PER_MINUTE = 200;

/** Client-side mirror of the server's read-time formula (blog.controller.js
 * computeReadTime) -- strip HTML tags, count words, divide by 200wpm, round
 * up. Purely a live UI estimate; the value actually stored comes from the
 * server on save. */
const estimateReadTime = (html = "") => {
  const text = String(html || "").replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));
};

/** Converts an ISO date string to the local "YYYY-MM-DDTHH:mm" value a
 * datetime-local input expects (accounting for timezone offset). */
const toLocalInputValue = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
};

const getInitialFormState = () => ({
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  content: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  category: "General",
  scheduledPublishAt: "",
});

const BlogEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const coverInputRef = useRef(null);

  const { data, isLoading } = useBlog(id);
  const {
    createBlogAsync,
    updateBlogAsync,
    isCreating,
    isUpdating,
  } = useBlogMutations();

  const [formData, setFormData] = useState(getInitialFormState());
  const [status, setStatus] = useState("draft");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [errors, setErrors] = useState({});

  const blogViews = data?.data?.blog?.views || 0;

  // Pre-fill form when editing an existing blog
  useEffect(() => {
    const blog = data?.data?.blog;
    if (blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        coverImage: blog.coverImage || "",
        content: blog.content || "",
        tags: (blog.tags || []).join(", "),
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        category: blog.category || "General",
        scheduledPublishAt: toLocalInputValue(blog.scheduledPublishAt),
      });
      setStatus(blog.status || "draft");
      setSlugTouched(true);
    }
  }, [data]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "title" && !slugTouched) {
      setFormData((prev) => ({ ...prev, title: value, slug: slugify(value) }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const result = await uploadBlogImage(file);
      const url = result?.data?.url || result?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, coverImage: url }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cover image upload failed");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const validate = (targetStatus) => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (targetStatus === "scheduled" && !formData.scheduledPublishAt) {
      newErrors.scheduledPublishAt = "Scheduled date/time is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (targetStatus) => ({
    title: formData.title.trim(),
    ...(formData.slug.trim() ? { slug: formData.slug.trim() } : {}),
    excerpt: formData.excerpt,
    coverImage: formData.coverImage || null,
    content: formData.content,
    tags: formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    seoTitle: formData.seoTitle,
    seoDescription: formData.seoDescription,
    category: formData.category,
    scheduledPublishAt:
      targetStatus === "scheduled" && formData.scheduledPublishAt
        ? new Date(formData.scheduledPublishAt).toISOString()
        : null,
    status: targetStatus,
  });

  const handleSave = async (targetStatus) => {
    if (!validate(targetStatus)) {
      if (targetStatus === "scheduled" && !formData.scheduledPublishAt) {
        toast.error("Please select a scheduled date/time");
      }
      return;
    }

    const payload = buildPayload(targetStatus);

    try {
      if (isEditMode) {
        await updateBlogAsync({ id, data: payload });
      } else {
        await createBlogAsync(payload);
      }
      const successMessage =
        targetStatus === "published"
          ? "Blog published successfully"
          : targetStatus === "scheduled"
            ? "Blog scheduled successfully"
            : "Blog saved as draft";
      toast.success(successMessage);
      navigate("/admin/blogs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save blog");
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isEditMode && isLoading) {
    return (
      <Box className="flex justify-center py-20">
        <CircularProgress sx={{ color: "#f57c00" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center gap-3">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/blogs")}
            className="text-gray-600"
          >
            Back
          </Button>
          <Box className="flex items-center gap-3">
            <Typography variant="h5" className="font-bold text-gray-800">
              {isEditMode ? "Edit Blog Post" : "New Blog Post"}
            </Typography>
            <Chip
              size="small"
              label={
                status === "published" ? "Published" : status === "scheduled" ? "Scheduled" : "Draft"
              }
              color={
                status === "published" ? "success" : status === "scheduled" ? "warning" : "default"
              }
            />
            {isEditMode && (
              <Chip
                size="small"
                variant="outlined"
                icon={<VisibilityIcon fontSize="small" />}
                label={`${blogViews.toLocaleString("en-IN")} views`}
                className="text-gray-600"
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

        {/* ── Left column ── */}
        <Box className="lg:col-span-2 space-y-4">

          {/* Card: Title + Slug + Excerpt */}
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                label="Title"
                required
                value={formData.title}
                onChange={handleChange("title")}
                error={!!errors.title}
                helperText={errors.title}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Slug"
                value={formData.slug}
                onChange={handleSlugChange}
                size="small"
                slotProps={{
                  inputLabel: { shrink: true, sx: { color: "#9ca3af" } },
                }}
                helperText={`URL: /blog/${formData.slug || "your-slug-here"}`}
              />
              <TextField
                fullWidth
                label="Excerpt"
                multiline
                rows={2}
                value={formData.excerpt}
                onChange={handleChange("excerpt")}
                inputProps={{ maxLength: 1000 }}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText={`Short summary shown in the blog listing — ${formData.excerpt.length}/1000`}
              />
            </Box>
          </Paper>

          {/* Card: Content editor */}
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Box className="flex items-center justify-between" sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Content{" "}
                {errors.content && (
                  <span className="text-red-600 font-normal">— {errors.content}</span>
                )}
              </Typography>
              <Box className="flex items-center gap-1 text-gray-500">
                <AccessTimeIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">
                  ~{estimateReadTime(formData.content)} min read
                </Typography>
              </Box>
            </Box>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
              }}
            />
          </Paper>
        </Box>

        {/* ── Right sidebar ── */}
        <Box className="space-y-4">

          {/* Cover Image */}
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Cover Image
            </Typography>
            {formData.coverImage ? (
              <Box sx={{ mb: 2 }}>
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  size="small"
                  startIcon={<CloseIcon fontSize="small" />}
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                  sx={{ mt: 1, color: "error.main" }}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  mb: 2,
                  color: "text.disabled",
                }}
              >
                <ImageIcon />
              </Box>
            )}
            <Button
              variant="outlined"
              fullWidth
              disabled={isUploadingCover}
              onClick={() => coverInputRef.current?.click()}
              startIcon={isUploadingCover ? <CircularProgress size={16} /> : <ImageIcon />}
            >
              {isUploadingCover ? "Uploading..." : "Upload Cover Image"}
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverUpload}
            />
          </Paper>

          {/* Organise — Category then Tags */}
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Organise
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Category</InputLabel>
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tags"
                value={formData.tags}
                onChange={handleChange("tags")}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Comma-separated, e.g. dental, sonipat, tips"
              />
            </Box>
          </Paper>

          {/* Publishing */}
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Publishing
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
              {status === "scheduled" && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Publish On"
                  size="small"
                  value={formData.scheduledPublishAt}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      scheduledPublishAt: e.target.value,
                    }));
                    if (errors.scheduledPublishAt) {
                      setErrors((prev) => ({ ...prev, scheduledPublishAt: "" }));
                    }
                  }}
                  error={!!errors.scheduledPublishAt}
                  helperText={
                    errors.scheduledPublishAt ||
                    "Post goes live automatically once this time passes"
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </Box>
          </Paper>

          {/* SEO Settings — collapsible; structured to accept upcoming fields */}
          <Accordion variant="outlined" className="rounded-xl!">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2,
                minHeight: "52px !important",
                "& .MuiAccordionSummary-content": { my: 1.5 },
              }}
            >
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                SEO Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2.5, pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="SEO Title"
                  value={formData.seoTitle}
                  onChange={handleChange("seoTitle")}
                  size="small"
                  inputProps={{ maxLength: 70 }}
                  helperText={`${formData.seoTitle.length}/60 characters${
                    formData.seoTitle.length > 60
                      ? " — may be truncated in search results"
                      : ""
                  }`}
                  slotProps={{
                    inputLabel: { shrink: true },
                    formHelperText: {
                      sx: {
                        color:
                          formData.seoTitle.length > 60 ? "#d32f2f" : "text.secondary",
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="SEO Description"
                  multiline
                  rows={3}
                  value={formData.seoDescription}
                  onChange={handleChange("seoDescription")}
                  size="small"
                  inputProps={{ maxLength: 170 }}
                  helperText={`${formData.seoDescription.length}/160 characters${
                    formData.seoDescription.length > 160
                      ? " — may be truncated in search results"
                      : formData.seoDescription.length > 0 &&
                          formData.seoDescription.length < 150
                        ? " — aim for 150-160"
                        : ""
                  }`}
                  slotProps={{
                    inputLabel: { shrink: true },
                    formHelperText: {
                      sx: {
                        color:
                          formData.seoDescription.length > 160
                            ? "#d32f2f"
                            : "text.secondary",
                      },
                    },
                  }}
                />
                {/* Upcoming fields append here inside this Box:
                    Focus keyword + density, Canonical URL,
                    OG image / OG title / OG description,
                    Table of contents, Related blogs */}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Actions */}
      <Divider className="my-6" />
      <Box className="flex items-center justify-end gap-3 py-5">
        <Button onClick={() => navigate("/admin/blogs")} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSave("draft")}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          Save as Draft
        </Button>
        {status === "scheduled" ? (
          <Button
            variant="contained"
            onClick={() => handleSave("scheduled")}
            disabled={isSaving}
            className="bg-accent hover:bg-accent-dark"
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
          >
            Schedule
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="bg-accent hover:bg-accent-dark"
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
          >
            Publish
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BlogEditor;
