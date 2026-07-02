/**
 * Add Report Modal
 *
 * Modal for uploading a new patient report with file upload to Cloudinary.
 */
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Switch,
  Autocomplete,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useReportMutations } from "../../../hooks/admin/useReports";
import { usePatients } from "../../../hooks/admin/usePatients";

/**
 * Report categories
 */
const reportCategories = [
  { value: "xray", label: "X-Ray" },
  { value: "opg", label: "OPG" },
  { value: "cbct", label: "CBCT" },
  { value: "lab_report", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "treatment_plan", label: "Treatment Plan" },
  { value: "consent_form", label: "Consent Form" },
  { value: "other", label: "Other" },
];

const AddReportModal = ({ open, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    patient: null,
    title: "",
    category: "xray",
    description: "",
    reportDate: new Date().toISOString().split("T")[0],
    isVisibleToPatient: true,
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");

  const { uploadReport, isUploading } = useReportMutations();

  // Fetch all patients for dropdown (using same hook as Patients page)
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients({
    limit: 200, // Get enough patients for dropdown
  });

  // Get patients array from response
  // API returns { success, data: [...patients], pagination } via ApiResponse.paginated
  const allPatients = Array.isArray(patientsData?.data) ? patientsData.data : (patientsData?.data?.data || []);

  // Filter patients client-side based on search input
  const filteredPatients = patientSearch.length >= 2
    ? allPatients.filter(
        (p) =>
          p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.phone?.includes(patientSearch)
      )
    : allPatients;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSwitchChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handlePatientChange = (_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      patient: newValue,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a PDF or image file (JPEG, PNG)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.patient) {
      toast.error("Please select a patient");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Report title is required");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Build FormData for multipart upload
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("patient", formData.patient._id);
    data.append("title", formData.title.trim());
    data.append("category", formData.category);
    data.append("description", formData.description.trim());
    data.append("reportDate", formData.reportDate);
    data.append("isVisibleToPatient", formData.isVisibleToPatient);
    if (formData.notes.trim()) {
      data.append("notes", formData.notes.trim());
    }

    uploadReport(data, {
      onSuccess: () => {
        resetForm();
        onSuccess?.();
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to upload report");
      },
    });
  };

  const resetForm = () => {
    setFormData({
      patient: null,
      title: "",
      category: "xray",
      description: "",
      reportDate: new Date().toISOString().split("T")[0],
      isVisibleToPatient: true,
      notes: "",
    });
    setSelectedFile(null);
    setPatientSearch("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-teal-600 to-teal-700 text-white">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <UploadFileIcon />
            <Typography variant="h6" component="span" className="font-bold">
              Upload Report
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isUploading}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-6 mt-4">
        <Grid container spacing={3}>
          {/* Patient Selection */}
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={filteredPatients}
              getOptionLabel={(option) =>
                option ? `${option.name} (${option.phone})` : ""
              }
              value={formData.patient}
              onChange={handlePatientChange}
              onInputChange={(_, value) => setPatientSearch(value)}
              loading={isLoadingPatients}
              isOptionEqualToValue={(option, value) => option?._id === value?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Patient *"
                  placeholder="Search by name or phone..."
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingPatients ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText={
                isLoadingPatients
                  ? "Loading patients..."
                  : "No patients found"
              }
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2" className="font-medium">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {option.phone} | {option.patientId}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />
          </Grid>

          {/* Report Title */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Report Title *"
              value={formData.title}
              onChange={handleChange("title")}
              placeholder="e.g., Full Mouth X-Ray"
              size="small"
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Category *"
              value={formData.category}
              onChange={handleChange("category")}
              size="small"
            >
              {reportCategories.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Report Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Report Date"
              type="date"
              value={formData.reportDate}
              onChange={handleChange("reportDate")}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Visibility */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVisibleToPatient}
                  onChange={handleSwitchChange("isVisibleToPatient")}
                  color="success"
                />
              }
              label="Visible to patient"
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              multiline
              rows={2}
              size="small"
              placeholder="Brief description of the report"
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notes (Internal)"
              value={formData.notes}
              onChange={handleChange("notes")}
              multiline
              rows={2}
              size="small"
              placeholder="Internal notes (not visible to patient)"
            />
          </Grid>

          {/* File Upload */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
              Upload File *
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <Paper
                variant="outlined"
                className="p-8 border-2 border-dashed border-gray-300 hover:border-teal-500 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Box className="flex flex-col items-center gap-2 text-gray-500">
                  <CloudUploadIcon sx={{ fontSize: 48 }} className="text-gray-400" />
                  <Typography variant="body1" className="font-medium">
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    PDF, JPEG, PNG (max 10MB)
                  </Typography>
                </Box>
              </Paper>
            ) : (
              <Paper variant="outlined" className="p-4 bg-teal-50 border-teal-200">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <DescriptionIcon className="text-teal-600" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" className="font-medium text-gray-800">
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {formatFileSize(selectedFile.size)} | {selectedFile.type}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    className="text-red-500"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={handleClose} color="inherit" disabled={isUploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isUploading}
          className="bg-teal-600 hover:bg-teal-700"
          startIcon={isUploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
        >
          {isUploading ? "Uploading..." : "Upload Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReportModal;
