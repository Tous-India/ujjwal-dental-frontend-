/**
 * Admin Reports Page
 */
import React, { useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DataTable from "../../components/common/DataTable";
import { useReports, useReportMutations } from "../../hooks/admin/useReports";
import AddReportModal from "../../components/admin/modals/AddReportModal";
import EditReportModal from "../../components/admin/modals/EditReportModal";
import PatientDetailModal from "../../components/admin/modals/PatientDetailModal";

/**
 * Helper: force download from Cloudinary by adding fl_attachment flag
 */
const handleDownload = (url) => {
  if (!url) return;
  // For Cloudinary image/PDF URLs, use fl_attachment to force download
  let downloadUrl = url;
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  }
  window.open(downloadUrl, "_blank");
};

/**
 * Table columns
 */
const columns = (onEdit, onDelete, onViewPatient) => [
  {
    field: "reportNumber",
    headerName: "Report #",
    minWidth: 130,
    render: (value) => (
      <Typography variant="body2" className="font-mono font-medium">
        {value || "-"}
      </Typography>
    ),
  },
  {
    field: "title",
    headerName: "Title",
    minWidth: 180,
    render: (value) => (
      <Typography
        variant="body2"
        className="font-medium truncate max-w-[200px]"
      >
        {value || "-"}
      </Typography>
    ),
  },
  {
    field: "category",
    headerName: "Category",
    minWidth: 120,
    render: (value) => {
      const labels = {
        xray: "X-Ray",
        opg: "OPG",
        cbct: "CBCT",
        lab_report: "Lab Report",
        prescription: "Prescription",
        treatment_plan: "Treatment Plan",
        consent_form: "Consent Form",
        other: "Other",
      };
      return (
        <Chip
          label={labels[value] || value || "-"}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: "patient",
    headerName: "Patient",
    minWidth: 160,
    render: (value) => (
      <Box
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-1 -m-1 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (value?._id) onViewPatient(value);
        }}
      >
        <Avatar sx={{ width: 32, height: 32 }} className="bg-indigo-100 text-indigo-600">
          {value?.name?.[0]?.toUpperCase() || "P"}
        </Avatar>
        <Typography variant="body2" className="text-indigo-600 hover:underline">
          {value?.name || "Unknown"}
        </Typography>
      </Box>
    ),
  },
  {
    field: "reportDate",
    headerName: "Report Date",
    minWidth: 120,
    type: "date",
  },
  {
    field: "file",
    headerName: "File",
    minWidth: 80,
    render: (value, row) =>
      value?.url ? (
        <Tooltip title="Download">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              const ext = value.fileType?.includes("pdf") ? ".pdf" : "";
              handleDownload(value.url, (row.title || "report") + ext);
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        "-"
      ),
  },
  {
    field: "_actions",
    headerName: "Actions",
    minWidth: 120,
    render: (_, row) => (
      <Box className="flex gap-1">
        {row.file?.url && (
          <Tooltip title="View Report">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                const fileUrl = row.file.url;
                if (fileUrl.includes(".pdf")) {
                  // Use Google Docs Viewer for PDF preview
                  window.open(`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`, "_blank");
                } else {
                  // Images open directly
                  window.open(fileUrl, "_blank");
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
  {
    field: "createdAt",
    headerName: "Created",
    minWidth: 110,
    type: "date",
  },
];

const Reports = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading, refetch } = useReports({
    search,
    ...filters,
  });
  const { deleteReport } = useReportMutations();

  const reports = data?.data || [];

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditModalOpen(true);
  };

  const handleDelete = (report) => {
    setConfirmDelete(report);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientModalOpen(true);
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold">
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient reports and documents
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          Upload Report
        </Button>
      </Box>

      <DataTable
        columns={columns(handleEdit, handleDelete, handleViewPatient)}
        data={reports}
        loading={isLoading}
        searchPlaceholder="Search by report number, title or patient..."
        onSearch={setSearch}
        onRefresh={refetch}
        emptyMessage="No reports found"
      />

      <AddReportModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
      />

      <EditReportModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onSuccess={refetch}
      />

      <PatientDetailModal
        open={patientModalOpen}
        onClose={() => {
          setPatientModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          deleteReport(confirmDelete._id, {
            onSuccess: () => {
              toast.success("Report deleted successfully");
              setConfirmDelete(null);
              refetch();
            },
            onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
          });
        }}
        title="Delete Report"
        message={`Are you sure you want to delete "${confirmDelete?.title || ""}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </Box>
  );
};

export default Reports;
