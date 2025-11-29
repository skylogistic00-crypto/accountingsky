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
import {
  parseOCR,
  type DocumentType,
  type ParsedOCRData,
} from "@/utils/ocrParser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Convert file to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GoogleOCRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [documentType, setDocumentType] = useState<DocumentType>("NPWP");
  const [parsedData, setParsedData] = useState<ParsedOCRData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const f = e.target.files[0];
    setFile(f);

    if (f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const parseExtractedTextLines = (text: string) =>
    text
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  const handleProcessOCR = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Harap pilih file terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Convert to Base64
      const base64Content = await fileToBase64(file);

      // Call Supabase Edge Function
      const { data: raw, error: visionError } = await supabase.functions.invoke(
        "vision-google-ocr",
        {
          body: { file_base64: base64Content },
        },
      );

      if (visionError) throw visionError;

      // ===== FIX — PARSE RAW JSON FROM SUPABASE =====
      let visionData;
      try {
        visionData = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch (err) {
        console.error("❌ JSON PARSE FAILED:", err);
        console.log("RAW:", raw);
        throw new Error("Vision API returned invalid JSON.");
      }

      console.log("=== RAW GOOGLE RESPONSE ===", visionData);

      // ===== EXTRACT FINAL TEXT =====
      let fullText = "";

      const resp = visionData?.responses?.[0];

      if (resp?.textAnnotations?.length > 0) {
        fullText = resp.textAnnotations[0].description;
      } else if (resp?.fullTextAnnotation?.text) {
        fullText = resp.fullTextAnnotation.text;
      } else {
        fullText = "(EMPTY RAW TEXT – CHECK PARSER)";
      }

      console.log("=== FINAL OCR TEXT ===", fullText);

      setExtractedText(fullText);

      // Parse result based on document type
      const parsed = parseOCR(fullText, documentType);
      setParsedData(parsed);

      // Upload original file
      const fileBuffer = await file.arrayBuffer();
      const uploaded = await supabase.storage
        .from("documents")
        .upload(`ocr-${Date.now()}-${file.name}`, fileBuffer, {
          contentType: file.type,
        });

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(uploaded.data?.path || "");

      await supabase.from("ocr_results").insert({
        file_url: urlData?.publicUrl,
        extracted_text: fullText,
      });

      setOcrResult({
        extracted_text: fullText,
        file_url: urlData?.publicUrl,
      });

      toast({ title: "Success", description: "OCR berhasil diproses!" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navigation />

      {/* Header Title */}
      <div className="border-b bg-gradient-to-r from-indigo-600 to-blue-600 p-6 shadow-lg">
        <div className="container mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText /> Google OCR Scanner
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText /> Google OCR Scanner
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Document Type */}
            <div>
              <Label>Jenis Dokumen</Label>
              <Select
                value={documentType}
                onValueChange={(v) => setDocumentType(v as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="NPWP">NPWP</SelectItem>
                  <SelectItem value="SIM">SIM</SelectItem>
                  <SelectItem value="INVOICE">Invoice</SelectItem>
                  <SelectItem value="NOTA">Nota</SelectItem>
                  <SelectItem value="KWITANSI">Kwitansi</SelectItem>
                  <SelectItem value="SURAT_JALAN">Surat Jalan</SelectItem>
                  <SelectItem value="CASH_DISBURSEMENT">
                    Cash Disbursement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload File */}
            <div>
              <Label>Upload File (JPG, PNG, PDF)</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              {file && <p className="text-sm mt-1">{file.name}</p>}
            </div>

            {/* OCR Button */}
            <Button
              onClick={handleProcessOCR}
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Process with Google Vision
                </>
              )}
            </Button>

            {/* RESULTS */}
            {ocrResult && (
              <div className="space-y-6">
                {/* Parsed JSON */}
                <div className="bg-blue-50 p-4 rounded border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText /> Data {documentType}
                  </h3>
                  <pre className="bg-white rounded p-3 text-sm max-h-96 overflow-auto">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </div>

                {/* Preview & Extracted Lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Image /> Gambar Dokumen
                    </Label>
                    <div className="border bg-gray-50 rounded p-2">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          className="w-full max-h-[350px] object-contain"
                        />
                      ) : (
                        <p className="text-gray-400">Tidak ada gambar</p>
                      )}
                    </div>
                  </div>

                  {/* Extracted List */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <List /> Hasil Ekstraksi (
                      {parseExtractedTextLines(ocrResult.extracted_text).length}
                      )
                    </Label>

                    <ul className="border rounded bg-gray-50 max-h-[350px] overflow-auto p-3 space-y-2">
                      {parseExtractedTextLines(ocrResult.extracted_text).map(
                        (line, i) => (
                          <li
                            key={i}
                            className="p-2 bg-white border rounded flex gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {line}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {/* Full Text */}
                <div>
                  <Label>Full Text</Label>
                  <Textarea
                    value={ocrResult.extracted_text}
                    readOnly
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                {/* File URL */}
                {ocrResult.file_url && (
                  <div className="p-3 bg-blue-50 border rounded flex gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <a
                      href={ocrResult.file_url}
                      target="_blank"
                      className="text-blue-600 underline break-all"
                    >
                      {ocrResult.file_url}
                    </a>
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
