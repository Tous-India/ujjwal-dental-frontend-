/**
 * Rich Text Editor (Tiptap)
 *
 * Toolbar: bold, italic, heading, bullet/ordered list, link, image upload.
 * Images are uploaded to Cloudinary via uploadBlogImage and inserted inline.
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadBlogImage } from "../../../api/admin/blogs.api";
import { Box, IconButton, Tooltip, CircularProgress, Divider } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import TitleIcon from "@mui/icons-material/Title";

const ToolbarButton = ({ label, active, onClick, disabled, children }) => (
  <Tooltip title={label}>
    <span>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        color={active ? "primary" : "default"}
        sx={active ? { backgroundColor: "rgba(245, 124, 0, 0.1)" } : undefined}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

export default function RichTextEditor({ content, onChange, placeholder = "Write your blog post..." }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, HTMLAttributes: { class: "blog-editor-image" } }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setIsUploadingImage(true);
    try {
      const result = await uploadBlogImage(file);
      const imageUrl = result?.data?.url || result?.url;
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(err.response?.data?.message || "Image upload failed. Please try again.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleLinkAdd = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <Box className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <Box className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <TitleIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

        <ToolbarButton
          label="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

        <ToolbarButton label="Add Link" active={editor.isActive("link")} onClick={handleLinkAdd}>
          <LinkIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label="Insert Image"
          disabled={isUploadingImage}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploadingImage ? <CircularProgress size={18} /> : <ImageIcon fontSize="small" />}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />
      </Box>

      {/* Content */}
      <EditorContent editor={editor} />
    </Box>
  );
}
