import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import Header from "./Header";
import Navigation from "./Navigation";
import {
  Upload,
  FileText,
  Loader2,
  Image,
  List,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GoogleOCRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setOcrResult(null);

      // Create preview URL for image
      if (selectedFile.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Parse extracted text into list items
  const parseExtractedText = (text: string): string[] => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
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
      // Convert file to base64
      const fileBuffer = await file.arrayBuffer();
      const base64Content = btoa(
        String.fromCharCode(...new Uint8Array(fileBuffer)),
      );

      // Call Google Vision API directly
      const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

      if (!apiKey) {
        throw new Error("Google Vision API key not configured");
      }

      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Content },
                features: [
                  { type: "TEXT_DETECTION" },
                  { type: "DOCUMENT_TEXT_DETECTION" },
                ],
              },
            ],
          }),
        },
      );

      if (!visionResponse.ok) {
        const errorData = await visionResponse.json();
        throw new Error(errorData.error?.message || "Vision API failed");
      }

      const visionData = await visionResponse.json();
      const textAnnotations = visionData.responses?.[0]?.textAnnotations || [];
      const fullTextAnnotation = visionData.responses?.[0]?.fullTextAnnotation;
      const extractedText =
        fullTextAnnotation?.text || textAnnotations[0]?.description || "";

      // Upload file to Supabase Storage
      const fileName = `ocr-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.warn("Upload warning:", uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from("ocr_results").insert({
        file_url: urlData?.publicUrl || "",
        extracted_text: extractedText,
      });

      if (dbError) {
        console.warn("DB save warning:", dbError.message);
      }

      setOcrResult({
        success: true,
        extracted_text: extractedText,
        file_url: urlData?.publicUrl,
      });

      toast({
        title: "Success",
        description: "OCR processing completed successfully",
      });
    } catch (error: any) {
      console.error("OCR Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process OCR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-0">
      <Header />
      <Navigation />
      {/* Header with gradient */}
      <div className="border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Google OCR Scanner
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Google OCR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Image/PDF)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <span className="text-sm text-gray-600">{file.name}</span>
                )}
              </div>
            </div>

            <Button
              onClick={handleProcessOCR}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Process with Google Vision
                </>
              )}
            </Button>

            {ocrResult && (
              <div className="space-y-6">
                {/* Image Preview Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Extracted Image */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Gambar yang Diekstrak
                    </Label>
                    <div className="border rounded-lg overflow-hidden bg-gray-50 p-2">
                      {filePreview || ocrResult.file_url ? (
                        <img
                          src={filePreview || ocrResult.file_url}
                          alt="Extracted document"
                          className="w-full h-auto max-h-[400px] object-contain rounded"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400">
                          <span>No image preview available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extracted List */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Hasil Ekstraksi (
                      {parseExtractedText(ocrResult.extracted_text).length}{" "}
                      item)
                    </Label>
                    <div className="border rounded-lg bg-gray-50 p-4 max-h-[400px] overflow-y-auto">
                      <ul className="space-y-2">
                        {parseExtractedText(ocrResult.extracted_text).map(
                          (item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 p-2 bg-white rounded border text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Full Text (Collapsible) */}
                <div className="space-y-2">
                  <Label>Teks Lengkap</Label>
                  <Textarea
                    value={ocrResult.extracted_text || ""}
                    readOnly
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                {ocrResult.file_url && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-blue-800">
                        File tersimpan di:
                      </span>
                      <a
                        href={ocrResult.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline ml-2 break-all"
                      >
                        {ocrResult.file_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
