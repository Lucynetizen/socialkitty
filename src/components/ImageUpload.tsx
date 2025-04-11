"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string | null) => void;
  value: string | null;
  endpoint: "postImage" | "profileImage" | "messageImage";
  label?: string;
}

function ImageUpload({ endpoint, onChange, value, label }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <img src={value} alt="Upload" className="rounded-md size-40 object-cover" />
        <button
          onClick={() => onChange(null)}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  return (
    <div>
      {label && <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{label}</p>}
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res && res.length > 0) {
            onChange(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
    </div>
  );
}
export default ImageUpload;