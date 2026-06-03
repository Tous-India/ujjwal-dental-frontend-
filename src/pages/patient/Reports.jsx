import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import { useMyReports } from "../../hooks/patient/useMyReports";

const categoryConfig = {
  xray: { label: "X-Ray", color: "info" },
  opg: { label: "OPG", color: "info" },
  cbct: { label: "CBCT", color: "info" },
  lab_report: { label: "Lab Report", color: "secondary" },
  prescription: { label: "Prescription", color: "success" },
  treatment_plan: { label: "Treatment Plan", color: "warning" },
  consent_form: { label: "Consent Form", color: "default" },
  other: { label: "Other", color: "default" },
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (fileType) => {
  if (fileType?.includes("pdf")) return <PictureAsPdfIcon className="text-red-500" />;
  if (fileType?.includes("image")) return <ImageIcon className="text-blue-500" />;
  return <DescriptionIcon className="text-gray-500" />;
};

const handleDownload = (url) => {
  if (!url) return;
  // Don't add fl_attachment to signed URLs (breaks signature)
  if (url.includes("s--") || url.includes("?_a=")) {
    window.open(url, "_blank");
    return;
  }
  let downloadUrl = url;
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  }
  window.open(downloadUrl, "_blank");
};

/**
 * Patient Reports Page
 *
 * Shows medical reports with download option
 */
const Reports = () => {
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data, isLoading, error } = useMyReports({
    category: categoryFilter || undefined,
  });

  const reports = data?.data?.reports || [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Medical Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your medical reports and prescriptions
        </Typography>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Filter by Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {Object.entries(categoryConfig).map(([value, config]) => (
            <MenuItem key={value} value={value}>
              {config.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Reports List */}
      <Card>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading reports...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color="error">
                Failed to load reports. Please try again.
              </Typography>
            </Box>
          ) : reports.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No reports found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Your medical reports will appear here once uploaded by your doctor
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ bgcolor: "white" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Report</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {getFileIcon(report.file?.fileType)}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {report.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.reportNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={categoryConfig[report.category]?.label || report.category}
                          size="small"
                          color={categoryConfig[report.category]?.color || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(report.reportDate)}</TableCell>
                      <TableCell>{formatFileSize(report.file?.fileSize)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={async () => {
                              try {
                                const res = await import("../../api/patient/reports.api").then(m => m.downloadReport(report._id));
                                const url = res?.data?.downloadUrl || report.file?.url;
                                if (url?.includes(".pdf")) {
                                  window.open(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`, "_blank");
                                } else {
                                  window.open(url, "_blank");
                                }
                              } catch {
                                const url = report.file?.url;
                                if (url?.includes(".pdf")) {
                                  window.open(`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`, "_blank");
                                } else {
                                  window.open(url, "_blank");
                                }
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={async () => {
                              try {
                                const res = await import("../../api/patient/reports.api").then(m => m.downloadReport(report._id));
                                const url = res?.data?.downloadUrl || report.file?.url;
                                handleDownload(url, (report.title || "report"));
                              } catch {
                                handleDownload(report.file?.url, (report.title || "report"));
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
