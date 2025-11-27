import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText } from "lucide-react";

export default function OCRScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processOCR = async () => {
    if (!selectedFile) {
      toast({
        title: "⚠️ Peringatan",
        description: "Pilih file terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get Supabase session for Authorization
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("User is not authenticated");
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call Supabase Edge Function
      const response = await fetch(
        "https://gfmokpjnnnbnjlqxhoux.supabase.co/functions/v1/openai-vision-ocr",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Edge Function error: " + errText);
      }

      const ocrData = await response.json();

      if (!ocrData || !ocrData.data) {
        throw new Error("Tidak ada hasil OCR");
      }

      const extractedContent = JSON.stringify(ocrData.data, null, 2);
      setExtractedText(extractedContent);
      setConfidence(ocrData.confidence || 95);

      const { error: dbError } = await supabase.from("ocr_results").insert({
        file_name: selectedFile.name,
        extracted_text: extractedContent,
        confidence: ocrData.confidence || 95,
        image_url: ocrData.file_url,
        created_by: user?.id,
      });

      if (dbError) console.warn("DB save error:", dbError);

      toast({
        title: "✅ OCR Berhasil",
        description: "Teks berhasil diekstrak",
      });
    } catch (err: any) {
      console.error("OCR Error:", err);
      toast({
        title: "❌ Error",
        description: err.message || "OCR gagal diproses",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <Card className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">OCR Scanner</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File (Image/PDF)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <Button
            onClick={processOCR}
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process OCR
              </>
            )}
          </Button>

          {extractedText && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Extracted Text
                </h3>
                <span className="text-sm text-gray-600">
                  Confidence: {confidence}%
                </span>
              </div>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm">
                {extractedText}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
