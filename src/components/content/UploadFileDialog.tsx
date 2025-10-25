import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileUploadService } from "@/services";
import { useAppDispatch } from "@/store/hooks";
import { uploadFile, fetchFiles, clearError } from "@/store/slices/filesSlice";

interface UploadFileDialogProps {
  onUploadSuccess?: (response: any) => void;
}

export function UploadFileDialog({ onUploadSuccess }: UploadFileDialogProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { uploadLoading, uploadError } = useAppSelector((state) => state.files);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile) {
      // Validate file type
      if (fileUploadService.isValidFileType(selectedFile)) {
        setFile(selectedFile);
        dispatch(clearError());
      } else {
        setFile(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    try {
      const result = await dispatch(uploadFile(file)).unwrap();

      // Reset form
      setFile(null);
      setOpen(false);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Refresh files list
      dispatch(fetchFiles());

      console.log("Upload successful:", result);
    } catch (error) {
      // Error is handled by Redux
      console.error("Upload failed:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when dialog closes
      setFile(null);
      dispatch(clearError());
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload PDF, MP4, JPG, JPEG, or PNG files.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* File Upload */}
            <div className="grid gap-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={fileUploadService.getAcceptedFileExtensions()}
                required
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, MP4, JPG, JPEG, PNG
              </p>

              {/* File Info Display */}
              {file && (
                <div className="p-3 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Type: {fileUploadService.getFileType(file)} • Size:{" "}
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {uploadError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {uploadError}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={uploadLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={uploadLoading || !file}>
              {uploadLoading ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add this import at the top
import { useAppSelector } from "@/store/hooks";
