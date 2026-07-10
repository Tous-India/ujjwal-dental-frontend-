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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
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

const getInitialFormState = () => ({
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  content: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
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
    status: targetStatus,
  });

  const handleSave = async (targetStatus) => {
    if (!validate()) return;

    const payload = buildPayload(targetStatus);

    try {
      if (isEditMode) {
        await updateBlogAsync({ id, data: payload });
      } else {
        await createBlogAsync(payload);
      }
      toast.success(
        targetStatus === "published" ? "Blog published successfully" : "Blog saved as draft",
      );
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
          <Box>
            <Typography variant="h4" className="font-bold text-gray-800">
              {isEditMode ? "Edit Blog Post" : "New Blog Post"}
            </Typography>
            <Box className="flex items-center gap-2 mt-1">
              <Chip
                size="small"
                label={status === "published" ? "Published" : "Draft"}
                color={status === "published" ? "success" : "default"}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <Box className="lg:col-span-2 space-y-4">
          <Paper variant="outlined" className="p-4 rounded-xl">
            <TextField
              fullWidth
              label="Title"
              required
              value={formData.title}
              onChange={handleChange("title")}
              error={!!errors.title}
              helperText={errors.title}
              className="mb-1"
            />
            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              onChange={handleSlugChange}
              size="small"
              helperText={`URL: /blog/${formData.slug || "your-slug-here"}`}
              className="mt-4"
            />
            <TextField
              fullWidth
              label="Excerpt"
              multiline
              rows={2}
              value={formData.excerpt}
              onChange={handleChange("excerpt")}
              helperText="Short summary shown in the blog listing"
              className="mt-4"
            />
          </Paper>

          <Paper variant="outlined" className="p-4 rounded-xl">
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
              Content {errors.content && <span className="text-red-600 font-normal">— {errors.content}</span>}
            </Typography>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
              }}
            />
          </Paper>
        </Box>

        {/* Sidebar column */}
        <Box className="space-y-4">
          <Paper variant="outlined" className="p-4 rounded-xl">
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
              Cover Image
            </Typography>
            {formData.coverImage ? (
              <Box className="relative mb-3">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  size="small"
                  startIcon={<CloseIcon fontSize="small" />}
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                  className="mt-2 text-red-600"
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box className="w-full h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-lg mb-3 text-gray-400">
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

          <Paper variant="outlined" className="p-4 rounded-xl">
            <TextField
              fullWidth
              label="Tags"
              value={formData.tags}
              onChange={handleChange("tags")}
              size="small"
              helperText="Comma-separated, e.g. dental, sonipat, tips"
            />
          </Paper>

          <Accordion variant="outlined" className="rounded-xl!">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                SEO Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label="SEO Title"
                value={formData.seoTitle}
                onChange={handleChange("seoTitle")}
                size="small"
                inputProps={{ maxLength: 70 }}
                helperText={`${formData.seoTitle.length}/70`}
                className="mb-4"
              />
              <TextField
                fullWidth
                label="SEO Description"
                multiline
                rows={3}
                value={formData.seoDescription}
                onChange={handleChange("seoDescription")}
                inputProps={{ maxLength: 170 }}
                helperText={`${formData.seoDescription.length}/170`}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Actions */}
      <Divider className="my-6" />
      <Box className="flex items-center justify-end gap-3">
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
        <Button
          variant="contained"
          onClick={() => handleSave("published")}
          disabled={isSaving}
          className="bg-accent hover:bg-accent-dark"
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          Publish
        </Button>
      </Box>
    </Box>
  );
};

export default BlogEditor;
