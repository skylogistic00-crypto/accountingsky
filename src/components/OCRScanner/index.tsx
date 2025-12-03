import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OCRResult {
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  deskripsi: string;
  extractedText?: string;
}

interface OCRScannerProps {
  onResult: (data: OCRResult) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary";
  showPreview?: boolean;
}

const OCRScanner: React.FC<OCRScannerProps> = ({
  onResult,
  buttonText = "📷 Scan OCR",
  buttonVariant = "outline",
  showPreview = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    if (showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProcessOCR = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Check/create bucket first
      const { data: bucketCheck, error: bucketError } = await supabase.functions.invoke(
        "supabase-functions-check-storage-bucket",
        {
          body: { bucketName: "ocr_uploads" },
        }
      );

      if (bucketError) {
        console.error("Bucket check error:", bucketError);
        throw new Error(`Bucket check failed: ${bucketError.message}`);
      }

      console.log("Bucket check result:", bucketCheck);

      // 2. Upload file to Supabase Storage
      const fileName = `scan_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ocr_uploads")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("File uploaded:", uploadData.path);

      // 3. Create signed URL (valid for 300 seconds)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("ocr_uploads")
        .createSignedUrl(uploadData.path, 300);

      if (signedError) {
        console.error("Signed URL error:", signedError);
        throw new Error(`Failed to create signed URL: ${signedError.message}`);
      }

      console.log("Signed URL created:", signedData.signedUrl);

      // 3. Call edge function with signed URL
      const { data, error: ocrError } = await supabase.functions.invoke(
        "supabase-functions-vision-google-ocr",
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signedUrl: signedData.signedUrl,
          }),
        }
      );

      if (ocrError) {
        console.error("OCR Error:", ocrError);
        throw ocrError;
      }

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from OCR service");
      }

      console.log("OCR Result:", data);

      // 4. Parse the response and autofill form
      const result: OCRResult = {
        nominal: data.autofill?.nominal || data.nominal || 0,
        tanggal: data.autofill?.tanggal || data.tanggal || "",
        deskripsi: data.autofill?.deskripsi || data.deskripsi || "",
        extractedText: data.extracted_text || data.extractedText || "",
      };

      toast({
        title: "✅ OCR Success",
        description: "Data extracted successfully",
      });

      onResult(result);

      // Reset state
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("OCR Error:", err);
      toast({
        title: "OCR Error",
        description: err.message || "Failed to process OCR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={buttonVariant}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>

        {file && (
          <Button
            type="button"
            onClick={handleProcessOCR}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Process OCR
              </>
            )}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {showPreview && preview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="text-sm font-medium mb-2 block">Preview:</Label>
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded-lg"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
