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
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
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

const MAX_FILES = 10;

/**
 * A single file row: Choose File / Take Photo buttons, preview, per-file
 * description, and a remove-slot button. Owns its own hidden inputs so
 * each row's camera-capture trigger is independent of the others.
 */
const FileSlot = ({
  index,
  fileEntry,
  onFileSelect,
  onDescriptionChange,
  onRemoveFile,
  onRemoveSlot,
  canRemoveSlot,
  formatFileSize,
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  return (
    <Paper variant="outlined" className="p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
      />

      <Box className="flex items-center justify-between gap-3">
        {!fileEntry.file ? (
          <Box className="flex items-center gap-2 flex-1">
            <CloudUploadIcon className="text-gray-400" />
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              className="border-teal-600 text-teal-700 hover:border-teal-700"
            >
              Choose File
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => cameraInputRef.current?.click()}
              className="border-teal-600 text-teal-700 hover:border-teal-700"
            >
              Take Photo
            </Button>
          </Box>
        ) : (
          <Box className="flex items-center gap-2 flex-1 min-w-0">
            <DescriptionIcon className="text-teal-600" sx={{ fontSize: 28 }} />
            <Box className="min-w-0">
              <Typography variant="body2" className="font-medium text-gray-800 truncate">
                {fileEntry.file.name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {formatFileSize(fileEntry.file.size)}
              </Typography>
            </Box>
            <IconButton onClick={onRemoveFile} size="small" className="text-red-500">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <IconButton
          onClick={onRemoveSlot}
          size="small"
          disabled={!canRemoveSlot}
          title="Remove this row"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        size="small"
        label="Description (optional)"
        value={fileEntry.description}
        onChange={onDescriptionChange}
        sx={{ mt: 1.5 }}
        placeholder={`Note for file ${index + 1}`}
      />
    </Paper>
  );
};

const AddReportModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient: null,
    title: "",
    category: "xray",
    description: "",
    reportDate: new Date().toISOString().split("T")[0],
    isVisibleToPatient: true,
    notes: "",
  });
  // files: [{ file: File|null, description: string }]
  const [files, setFiles] = useState([{ file: null, description: "" }]);
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

  const validateFile = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF or image file (JPEG, PNG)");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const handleFileSelect = (index) => (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, file } : f)));
    }
    e.target.value = "";
  };

  const handleDescriptionChange = (index) => (e) => {
    const value = e.target.value;
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, description: value } : f)));
  };

  const handleRemoveFile = (index) => () => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, file: null } : f)));
  };

  const addFileSlot = () => {
    if (files.length >= MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files per report`);
      return;
    }
    setFiles((prev) => [...prev, { file: null, description: "" }]);
  };

  const removeFileSlot = (index) => {
    if (files.length <= 1) {
      toast.error("At least one file is required");
      return;
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    const selectedFiles = files.filter((f) => f.file);
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    // Build FormData for multipart upload
    const data = new FormData();
    selectedFiles.forEach((f) => data.append("files", f.file));
    data.append("descriptions", JSON.stringify(selectedFiles.map((f) => f.description.trim())));
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
    setFiles([{ file: null, description: "" }]);
    setPatientSearch("");
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

          {/* Files Upload (up to MAX_FILES, each with its own description) */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
              Upload Files * ({files.length}/{MAX_FILES})
            </Typography>

            <Box className="flex flex-col gap-3">
              {files.map((f, index) => (
                <FileSlot
                  key={index}
                  index={index}
                  fileEntry={f}
                  onFileSelect={handleFileSelect(index)}
                  onDescriptionChange={handleDescriptionChange(index)}
                  onRemoveFile={handleRemoveFile(index)}
                  onRemoveSlot={() => removeFileSlot(index)}
                  canRemoveSlot={files.length > 1}
                  formatFileSize={formatFileSize}
                />
              ))}
            </Box>

            <Button
              variant="text"
              startIcon={<UploadFileIcon />}
              onClick={addFileSlot}
              disabled={files.length >= MAX_FILES}
              className="mt-2 text-teal-700"
            >
              + Add More
            </Button>
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
