/**
 * Admin Blog List Page
 *
 * Displays list of all blog posts with:
 * - Search by title
 * - Filter by status (draft/published)
 * - Publish/unpublish toggle per row
 * - Edit (navigates to editor page), Delete (confirm modal)
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import DataTable from "../../components/common/DataTable";
import { useBlogs, useBlogMutations } from "../../hooks/admin/useBlogs";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { toast } from "react-toastify";

const filterOptions = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
];

const Blogs = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { data, isLoading, refetch } = useBlogs({
    page,
    limit,
    search,
    ...filters,
  });

  const { deleteBlog, isDeleting, publishBlog, unpublishBlog } = useBlogMutations();

  const blogs = data?.data?.blogs || [];
  const total = data?.data?.total || 0;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setFilters({});
  };

  const handleRowClick = (row) => {
    navigate(`/admin/blogs/${row._id}/edit`);
  };

  const handleDeleteClick = (row, e) => {
    e.stopPropagation();
    setSelectedBlog(row);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedBlog) return;
    deleteBlog(selectedBlog._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedBlog(null);
        refetch();
      },
      onError: (error) => {
        setDeleteError(error.response?.data?.message || "Failed to delete blog");
      },
    });
  };

  const handleTogglePublish = (row, e) => {
    e.stopPropagation();
    if (row.status === "published") {
      unpublishBlog(row._id, {
        onSuccess: () => toast.success("Blog unpublished"),
        onError: (err) => toast.error(err.response?.data?.message || "Failed to unpublish"),
      });
    } else {
      publishBlog(row._id, {
        onSuccess: () => toast.success("Blog published"),
        onError: (err) => toast.error(err.response?.data?.message || "Failed to publish"),
      });
    }
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      minWidth: 260,
      render: (value) => (
        <Typography variant="body2" className="font-medium">
          {value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      render: (value) => (
        <Chip
          size="small"
          label={value === "published" ? "Published" : "Draft"}
          color={value === "published" ? "success" : "default"}
        />
      ),
    },
    {
      field: "views",
      headerName: "Views",
      minWidth: 90,
      render: (value) => <span className="font-numbers">{value || 0}</span>,
    },
    {
      field: "author",
      headerName: "Author",
      minWidth: 140,
      render: (value) => value?.name || "-",
    },
    {
      field: "createdAt",
      headerName: "Date",
      minWidth: 130,
      render: (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-"),
    },
    {
      field: "_actions",
      headerName: "Actions",
      minWidth: 150,
      render: (_, row) => (
        <Box className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={row.status === "published" ? "Unpublish" : "Publish"}>
            <IconButton size="small" onClick={(e) => handleTogglePublish(row, e)}>
              {row.status === "published" ? (
                <UnpublishedIcon fontSize="small" className="text-gray-500" />
              ) : (
                <PublishIcon fontSize="small" className="text-green-600" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/blogs/${row._id}/edit`);
              }}
            >
              <EditIcon fontSize="small" className="text-blue-600" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={(e) => handleDeleteClick(row, e)}>
              <DeleteIcon fontSize="small" className="text-red-600" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Blogs
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Create and manage blog posts
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/blogs/new")}
          className="bg-accent hover:bg-accent-dark"
        >
          New Blog Post
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={blogs}
        loading={isLoading}
        searchPlaceholder="Search by title..."
        onSearch={handleSearch}
        searchValue={search}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        pagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        onRowClick={handleRowClick}
        onRefresh={handleReset}
        emptyMessage="No blog posts yet"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        itemName={selectedBlog?.title}
        itemType="blog post"
        isDeleting={isDeleting}
        error={deleteError}
        softDelete={false}
      />
    </Box>
  );
};

export default Blogs;
