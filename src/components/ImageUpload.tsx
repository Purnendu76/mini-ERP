import React, { useState, useRef } from "react";
import { Upload, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { axiosClient } from "@/api/axiosClient";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  description?: string;
  variant?: "circle" | "square";
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Upload Image",
  description = "Click here to select a file from your device.",
  variant = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await axiosClient.post("/uploads/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data?.success) {
          const uploadedUrl = response.data.data.url;
          onChange(uploadedUrl);
          toast.success("Image uploaded to B2 storage successfully");
        } else {
          toast.error("Failed to upload image to B2 storage");
        }
      } catch (err) {
        console.error("B2 Upload Error:", err);
        toast.error("Error uploading image to B2 storage");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const isCircle = variant === "circle";

  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-muted/50 p-5 cursor-pointer hover:bg-muted/80 transition-colors relative overflow-hidden flex flex-col justify-center items-center min-h-[140px]"
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Uploading to B2 Cloud Storage...
          </p>
        </div>
      ) : value ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className={`h-28 w-28 overflow-hidden border bg-white dark:bg-slate-900 ${
              isCircle ? "rounded-full shadow-sm" : "rounded-xl"
            }`}
          >
            <img
              src={value}
              alt="Uploaded Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-xs text-blue-600 font-medium">
            Click to change photo
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm shrink-0">
            {isCircle ? <ImagePlus className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {label}
            </p>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
