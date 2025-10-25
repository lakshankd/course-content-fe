import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { FileItem } from "@/services/fileUploadService";
import { fileUploadService } from "@/services";

// Async thunks
export const fetchFiles = createAsyncThunk(
  "files/fetchFiles",
  async (_, { rejectWithValue }) => {
    try {
      const files = await fileUploadService.getAllFiles();
      return files;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch files");
    }
  }
);

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await fileUploadService.uploadFile(file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload file");
    }
  }
);

interface FilesState {
  files: FileItem[];
  loading: boolean;
  error: string | null;
  uploadLoading: boolean;
  uploadError: string | null;
  lastRefreshed: string | null;
}

const initialState: FilesState = {
  files: [],
  loading: false,
  error: null,
  uploadLoading: false,
  uploadError: null,
  lastRefreshed: null,
};

export const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    clearFiles: (state) => {
      state.files = [];
    },
    removeFile: (state, action: PayloadAction<number>) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch files
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
        state.lastRefreshed = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = null;
        // Note: We don't add to files array here since we need to refetch to get the complete file data
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload as string;
      });
  },
});

export const { clearError, clearFiles, removeFile } = filesSlice.actions;
export default filesSlice.reducer;
