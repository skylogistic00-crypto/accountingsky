import { useState, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface OCRResult {
  id: string;
  file_name: string;
  extracted_text: string;
  confidence: number;
  created_at: string;
  image_url?: string;
}

export default function OCRScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [ocrHistory, setOcrHistory] = useState<OCRResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableReady, setTableReady] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    initializeOCRTable();
  }, []);

  const initializeOCRTable = async () => {
    try {
      // Try to create the table if it doesn't exist
      const { data, error } = await supabase.functions.invoke('supabase-functions-create-ocr-table', {});
      
      if (error) {
        console.warn('Table initialization warning:', error);
      } else {
        console.log('OCR table ready:', data);
        setTableReady(true);
      }
    } catch (error) {
      console.warn('Could not initialize OCR table:', error);
    } finally {
      // Always try to load history regardless of table creation result
      loadHistory();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedText("");
      setConfidence(0);
    }
  };

  const processOCR = async () => {
    if (!selectedFile) {
      toast({
        title: "⚠️ Peringatan",
        description: "Pilih file gambar terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const worker = await createWorker("eng", 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
      });
      
      const { data } = await worker.recognize(selectedFile);
      
      setExtractedText(data.text);
      setConfidence(data.confidence);

      await worker.terminate();

      // Upload image to Supabase storage
      const fileName = `ocr_${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // Save to database - skip if table doesn't exist
      try {
        const { error: dbError } = await supabase
          .from("ocr_results")
          .insert({
            file_name: selectedFile.name,
            extracted_text: data.text,
            confidence: data.confidence,
            image_url: publicUrl,
            created_by: user?.id,
          });

        if (dbError) {
          console.warn("Database save skipped:", dbError);
        } else {
          fetchOCRHistory();
        }
      } catch (dbErr) {
        console.warn("Database not available:", dbErr);
      }

      const confidenceNum = typeof data.confidence === 'number' ? data.confidence : Number(data.confidence) || 0;
      toast({
        title: "✅ Berhasil",
        description: `Teks berhasil diekstrak dengan confidence ${confidenceNum.toFixed(2)}%`,
      });
    } catch (error: any) {
      console.error("OCR Error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal memproses gambar",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchOCRHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ocr_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("History fetch skipped:", error);
        setOcrHistory([]);
        return;
      }

      setOcrHistory(data || []);
    } catch (error: any) {
      console.warn("History not available:", error);
      setOcrHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    await fetchOCRHistory();
  };

  const deleteOCRResult = async (id: string, imageUrl?: string) => {
    try {
      // Delete from storage if image exists
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("documents").remove([fileName]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("ocr_results")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Berhasil",
        description: "Data OCR berhasil dihapus",
      });

      fetchOCRHistory();
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast({
        title: "❌ Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📸 OCR Scanner
          </h1>
          <p className="text-gray-600">
            Ekstrak teks dari gambar menggunakan Tesseract OCR
          </p>
        </div>

        {/* Upload & Process Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload & Proses Gambar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {previewUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-96 mx-auto rounded"
                />
              </div>
            )}

            <Button
              onClick={processOCR}
              disabled={!selectedFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Ekstrak Teks
                </>
              )}
            </Button>

            {extractedText && (
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Hasil Ekstraksi:</h3>
                  <span className="text-sm text-gray-600">
                    Confidence: {(typeof confidence === 'number' ? confidence : Number(confidence) || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {extractedText}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Riwayat OCR
              </CardTitle>
              <Button onClick={fetchOCRHistory} disabled={isLoading} size="sm">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Teks Ekstrak</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ocrHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        Belum ada riwayat OCR
                      </TableCell>
                    </TableRow>
                  ) : (
                    ocrHistory.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {new Date(result.created_at).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.file_name}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">
                            {result.extracted_text}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              (typeof result.confidence === 'number' ? result.confidence : Number(result.confidence) || 0) > 80
                                ? "bg-green-100 text-green-800"
                                : (typeof result.confidence === 'number' ? result.confidence : Number(result.confidence) || 0) > 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {(typeof result.confidence === 'number' ? result.confidence : Number(result.confidence) || 0).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              deleteOCRResult(result.id, result.image_url)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
