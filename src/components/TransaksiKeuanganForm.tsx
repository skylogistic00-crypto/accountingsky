import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import AddItemModal from "./AddItemModal";
import AddBrandModal from "./AddBrandModal";
import AddStockItemModal from "./AddStockItemModal";
import BorrowerForm from "./BorrowerForm";
import JournalPreviewModal from "./JournalPreviewModal";
import ApprovalTransaksi from "./ApprovalTransaksi";
import OCRScanButton from "./OCRScanButton";
import BarcodeScanButton from "./BarcodeScanButton";
import { generateJournal } from "./journalRules";
import { parseOCR, type ParsedOCRData } from "@/utils/ocrParser";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Plus,
  Search,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  CalendarIcon,
  ArrowLeft,
  Clock,
  Check,
  ChevronsUpDown,
  Trash2,
  Info,
  FileText,
  ScanLine,
  Upload,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Transaction Report Component
function TransactionReport() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Riwayat Transaksi</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Tanggal
              </th>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Journal Ref
              </th>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Jenis Transaksi
              </th>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Debit Account
              </th>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Credit Account
              </th>
              <th className="border border-slate-300 px-4 py-2 text-right">
                Debit
              </th>
              <th className="border border-slate-300 px-4 py-2 text-right">
                Credit
              </th>
              <th className="border border-slate-300 px-4 py-2 text-left">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50">
                <td className="border border-slate-300 px-4 py-2">
                  {txn.tanggal}
                </td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                  {txn.journal_ref}
                </td>
                <td className="border border-slate-300 px-4 py-2">
                  {txn.jenis_transaksi}
                </td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                  {txn.debit_account}
                </td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                  {txn.credit_account}
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  {txn.debit
                    ? new Intl.NumberFormat("id-ID").format(txn.debit)
                    : "-"}
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  {txn.credit
                    ? new Intl.NumberFormat("id-ID").format(txn.credit)
                    : "-"}
                </td>
                <td className="border border-slate-300 px-4 py-2">
                  {txn.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Financial Engine Implementation
 *
 * This form implements a multi-module financial engine that automatically
 * determines the correct COA (Chart of Accounts) based on transaction type:
 *
 * 1. Cash Engine: Handles direct cash in/out (Penerimaan/Pengeluaran Kas)
 *    - Penerimaan Kas → uses revenue_account_code
 *    - Pengeluaran Kas → uses cogs_account_code
 *
 * 2. Revenue Engine: Handles sales transactions (Penjualan Jasa/Barang)
 *    - Always uses revenue_account_code
 *
 * 3. Expense Engine: Handles purchases and expenses (Pembelian/Beban)
 *    - Pembelian → uses asset_account_code (inventory)
 *    - Beban Operasional → uses cogs_account_code
 *
 * 4. Loan Engine: Handles loan transactions (Pinjaman)
 *    - Uses specific loan liability accounts (2-2000)
 *
 * 5. Inventory Engine: Updates stock when is_barang = true
 */

export default function TransaksiKeuanganForm() {
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(true);

  const [jenisTransaksi, setJenisTransaksi] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [kategori, setKategori] = useState("");
  const [jenisLayanan, setJenisLayanan] = useState("");

  // const [items, setItems] = useState<any[]>([]);
  //const [brands, setBrands] = useState<any[]>([]);
  //const [filteredBrands, setFilteredBrands] = useState<any[]>([]);

  // Popover states for searchable selects
  const [openItemPopover, setOpenItemPopover] = useState(false);
  const [openDescriptionPopover, setOpenDescriptionPopover] = useState(false);
  // SEARCH STATES
  const [itemSearchKeyword, setItemSearchKeyword] = useState("");
  const [descriptionSearchKeyword, setDescriptionSearchKeyword] = useState("");

  // RAW DATA
  const [items, setItems] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<any[]>([]);

  // FILTERED ITEMS
  const filteredItemsComputed = Array.isArray(items)
    ? items.filter((i) =>
        (i?.item_name || "")
          .toLowerCase()
          .includes(itemSearchKeyword.toLowerCase()),
      )
    : [];

  // FILTERED DESCRIPTIONS
  const filteredDescriptionsComputed = Array.isArray(descriptions)
    ? descriptions.filter((d) =>
        (d?.description || "")
          .toLowerCase()
          .includes(descriptionSearchKeyword.toLowerCase()),
      )
    : [];

  // Safe arrays for rendering
  const safeFilteredItems = Array.isArray(filteredItemsComputed)
    ? filteredItemsComputed
    : [];

  const safeFilteredDescriptions = Array.isArray(filteredDescriptionsComputed)
    ? filteredDescriptionsComputed
    : [];

  const [coa, setCoa] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [consignees, setConsignees] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [kasAccounts, setKasAccounts] = useState<any[]>([]);

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState("");
  const [consignee, setConsignee] = useState("");
  const [supplier, setSupplier] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedKas, setSelectedKas] = useState("");

  // Stock information state
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  // Loan-related state
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState("");
  const [selectedBorrowerData, setSelectedBorrowerData] = useState<any>(null);
  const [loanType, setLoanType] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("Bulanan");
  const [principalAmount, setPrincipalAmount] = useState("0");
  const [interestAmount, setInterestAmount] = useState("0");
  const [lateFee, setLateFee] = useState("0");
  const [lateFeePercentage, setLateFeePercentage] = useState("0.1"); // Default 0.1% per day
  const [daysLate, setDaysLate] = useState("0");
  const [actualPaymentDate, setActualPaymentDate] = useState("");
  const [installmentSchedule, setInstallmentSchedule] = useState<any[]>([]);
  const [taxAmount, setTaxAmount] = useState("0");
  const [taxPercentage, setTaxPercentage] = useState("0");
  const [taxType, setTaxType] = useState(""); // PPh21, PPh23, PPN, etc.
  const [loanCalculationMethod, setLoanCalculationMethod] = useState("Anuitas");

  // Transactions list state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [nominal, setNominal] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [hargaJual, setHargaJual] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [ppnPercentage, setPpnPercentage] = useState("11");
  const [ppnAmount, setPpnAmount] = useState("0");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiUrl, setBuktiUrl] = useState("");

  const [coaSelected, setCoaSelected] = useState("");

  const [openItemModal, setOpenItemModal] = useState(false);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [openStockItemModal, setOpenStockItemModal] = useState(false);
  const [openBorrowerModal, setOpenBorrowerModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [previewLines, setPreviewLines] = useState<any[]>([]);
  const [previewMemo, setPreviewMemo] = useState("");

  const safeBanks = Array.isArray(banks) ? banks : [];
  const safeKasAccounts = Array.isArray(kasAccounts) ? kasAccounts : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeConsignees = Array.isArray(consignees) ? consignees : [];
  const safeCategories = Array.isArray(availableCategories)
    ? availableCategories
    : [];
  const safeServiceTypes = Array.isArray(serviceTypes) ? serviceTypes : [];
  const [previewTanggal, setPreviewTanggal] = useState("");
  const [previewIsCashRelated, setPreviewIsCashRelated] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Account Name Combobox state
  const [openAccountNameCombobox, setOpenAccountNameCombobox] = useState(false);
  const [searchAccountName, setSearchAccountName] = useState("");

  // Employee state for Beban Gaji
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");

  // OCR Scanner Modal state
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrFilePreview, setOcrFilePreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrExtractedText, setOcrExtractedText] = useState("");
  const [ocrParsedData, setOcrParsedData] = useState<ParsedOCRData | null>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  
  // OCR Applied Data state - untuk menampilkan breakdown setelah OCR digunakan
  const [ocrAppliedData, setOcrAppliedData] = useState<{
    imagePreview: string | null;
    extractedText: string;
    parsedData: ParsedOCRData | null;
    appliedFields: { field: string; value: string }[];
    items: { name: string; qty: number; price: number }[];
  } | null>(null);

  // Cart state - load from localStorage on mount
  const [cart, setCart] = useState<any[]>(() => {
    const savedCart = localStorage.getItem("transaksi_keuangan_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);

  // Toggle checkbox for cart item
  const toggleCartItemSelection = (itemId: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      );
      localStorage.setItem(
        "transaksi_keuangan_cart",
        JSON.stringify(updatedCart),
      );
      return updatedCart;
    });
  };

  // Select/Deselect all items
  const toggleSelectAll = () => {
    const allSelected = cart.every((item) => item.selected);
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => ({
        ...item,
        selected: !allSelected,
      }));
      localStorage.setItem(
        "transaksi_keuangan_cart",
        JSON.stringify(updatedCart),
      );
      return updatedCart;
    });
  };

  // Conditional fields state
  const [sumberPenerimaan, setSumberPenerimaan] = useState("");
  const [kasSumber, setKasSumber] = useState("");
  const [kasTujuan, setKasTujuan] = useState("");
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");

  // Pengeluaran Kas specific fields
  const [jenisPembayaranPengeluaran, setJenisPembayaranPengeluaran] =
    useState("Cash");
  const [namaKaryawanPengeluaran, setNamaKaryawanPengeluaran] = useState("");

  // COA accounts for kategori pengeluaran
  const [coaAccounts, setCoaAccounts] = useState<any[]>([]);
  const [filteredAccountNames, setFilteredAccountNames] = useState<string[]>(
    [],
  );

  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("transaksi_keuangan_cart", JSON.stringify(cart));
  }, [cart]);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
    loadCOAAccounts();
    loadEmployees();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approval_transaksi" },
        () => loadTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kas_transaksi" },
        () => loadTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales_transactions" },
        () => loadTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cash_disbursement" },
        () => loadTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_transactions" },
        () => loadTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cash_and_bank_receipts" },
        () => loadTransactions(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // OCR Scanner Functions
  const handleOCRFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setOcrFile(f);
    if (f.type.startsWith("image/")) {
      setOcrFilePreview(URL.createObjectURL(f));
    } else {
      setOcrFilePreview(null);
    }
    // Reset previous results
    setOcrExtractedText("");
    setOcrParsedData(null);
  };

  const handleProcessOCR = async () => {
    if (!ocrFile) {
      toast({
        title: "Error",
        description: "Harap pilih file terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    try {
      setOcrLoading(true);

      // Convert to Base64
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(ocrFile);
      });

      // Call Supabase Edge Function
      const { data: raw, error: visionError } = await supabase.functions.invoke(
        "supabase-functions-vision-google-ocr",
        {
          body: { file_base64: base64Content },
        }
      );

      if (visionError) throw visionError;

      // Parse raw JSON
      let visionData;
      try {
        visionData = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch (err) {
        console.error("JSON PARSE FAILED:", err);
        throw new Error("Vision API returned invalid JSON.");
      }

      // Extract text
      let fullText = "";
      const resp = visionData?.responses?.[0];
      if (resp?.textAnnotations?.length > 0) {
        fullText = resp.textAnnotations[0].description;
      } else if (resp?.fullTextAnnotation?.text) {
        fullText = resp.fullTextAnnotation.text;
      }

      setOcrExtractedText(fullText);

      // Parse with receipt parser
      const parsed = parseOCR(fullText, "RECEIPT");
      setOcrParsedData(parsed);

      toast({
        title: "OCR Berhasil",
        description: "Data berhasil diekstrak dari gambar",
      });
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "OCR Error",
        description: error instanceof Error ? error.message : "Gagal memproses OCR",
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleUseOCRResult = () => {
    console.log("=== handleUseOCRResult called ===");
    console.log("ocrParsedData:", ocrParsedData);
    console.log("ocrExtractedText:", ocrExtractedText);
    
    const appliedFields: { field: string; value: string }[] = [];
    const extractedItems: { name: string; qty: number; price: number }[] = [];
    
    // Map OCR data to form fields
    if (ocrParsedData?.nama) {
      setDescription(ocrParsedData.nama);
      appliedFields.push({ field: "Deskripsi", value: ocrParsedData.nama });
    }
    
    // Try multiple patterns to extract nominal from text
    const patterns = [
      /(?:total|jumlah|amount|bayar|grand\s*total)[:\s]*(?:rp\.?|idr)?\s*([\d.,]+)/i,
      /(?:harga\s*jual)[:\s]*([\d.,]+)/i,
      /(?:tunai|cash)[:\s]*(?:rp\.?|idr)?\s*([\d.,]+)/i,
      /(?:rp\.?|idr)\s*([\d.,]+)/i,
      /(\d{1,3}(?:[.,]\d{3})+)/g,
    ];
    
    let extractedNominal = "";
    for (const pattern of patterns) {
      const match = ocrExtractedText.match(pattern);
      if (match) {
        const numStr = match[1] || match[0];
        const cleanNum = numStr.replace(/[.,]/g, "");
        if (!extractedNominal || parseInt(cleanNum) > parseInt(extractedNominal)) {
          extractedNominal = cleanNum;
        }
      }
    }
    
    // Also try to find "HARGA JUAL:" pattern specifically from the receipt
    const hargaJualMatch = ocrExtractedText.match(/HARGA\s*JUAL[:\s]*([\d.,]+)/i);
    if (hargaJualMatch) {
      extractedNominal = hargaJualMatch[1].replace(/[.,]/g, "");
    }
    
    if (extractedNominal) {
      setNominal(extractedNominal);
      appliedFields.push({ field: "Nominal", value: `Rp ${parseInt(extractedNominal).toLocaleString("id-ID")}` });
    }
    
    // Try to extract description from receipt items
    if (!ocrParsedData?.nama) {
      const productPatterns = [
        /VOUCHER\s+([A-Z\s]+):/i,
        /([A-Z][A-Z\s]+):\s*\(\d+\)/i,
      ];
      
      for (const pattern of productPatterns) {
        const match = ocrExtractedText.match(pattern);
        if (match) {
          const productName = match[1].trim();
          setDescription(`Pembelian: ${productName}`);
          appliedFields.push({ field: "Deskripsi", value: `Pembelian: ${productName}` });
          break;
        }
      }
    }
    
    // Extract items from receipt text
    const itemPatterns = [
      /([A-Z][A-Z\s]+):\s*\((\d+)\)\s*@\s*([\d.,]+)/gi,
      /VOUCHER\s+([A-Z\s]+):\s*\((\d+)\)\s*@\s*([\d.,]+)/gi,
    ];
    
    for (const pattern of itemPatterns) {
      let itemMatch;
      while ((itemMatch = pattern.exec(ocrExtractedText)) !== null) {
        const itemName = itemMatch[1].trim();
        const qty = parseInt(itemMatch[2]) || 1;
        const price = parseInt(itemMatch[3].replace(/[.,]/g, "")) || 0;
        extractedItems.push({ name: itemName, qty, price });
      }
    }
    
    // If no items found, try simpler pattern
    if (extractedItems.length === 0) {
      const simpleItemMatch = ocrExtractedText.match(/([A-Z][A-Z\s]+ORANGE|[A-Z][A-Z\s]+SQUASH)/gi);
      if (simpleItemMatch) {
        simpleItemMatch.forEach(item => {
          extractedItems.push({ name: item.trim(), qty: 1, price: parseInt(extractedNominal) || 0 });
        });
      }
    }
    
    // Save OCR applied data for display
    const ocrData = {
      imagePreview: ocrFilePreview,
      extractedText: ocrExtractedText,
      parsedData: ocrParsedData,
      appliedFields,
      items: extractedItems,
    };
    
    setOcrAppliedData(ocrData);
    
    // Also set the OCR file as bukti file if available
    if (ocrFile) {
      setBuktiFile(ocrFile);
    }
    
    console.log("OCR Data Saved to State:", ocrData);
    console.log("Applied fields:", appliedFields);
    console.log("Extracted items:", extractedItems);
    
    if (appliedFields.length > 0) {
      toast({
        title: "Data OCR Diterapkan",
        description: appliedFields.map(f => `${f.field}: ${f.value}`).join(", "),
      });
    } else {
      toast({
        title: "Tidak ada data yang bisa diekstrak",
        description: "Silakan isi form secara manual",
        variant: "destructive",
      });
    }
    
    // Close modal and reset OCR modal state (but keep applied data)
    setShowOCRModal(false);
    setOcrFile(null);
    setOcrExtractedText("");
    setOcrParsedData(null);
  };

  // Load employees from users table
  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, entity")
      .eq("entity", "Karyawan")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error loading employees:", error);
    } else {
      setEmployees(data || []);
    }
  };

  // Load COA accounts for kategori pengeluaran
  const loadCOAAccounts = async () => {
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("*")
      .order("account_name", { ascending: true });

    if (error) {
      console.error("Error loading COA accounts:", error);
    } else {
      setCoaAccounts(data || []);
    }
  };

  // Handler when account_type is selected
  const handleAccountTypeChange = (accountType: string) => {
    setSelectedAccountType(accountType);

    // Get all unique account_names for accounts with the same account_type
    const accountNames = coaAccounts
      .filter((acc) => acc.account_type === accountType)
      .map((acc) => acc.account_name)
      .filter((value, index, self) => self.indexOf(value) === index);

    setFilteredAccountNames(accountNames);

    // If only one account_name, auto-select it
    if (accountNames.length === 1) {
      setSelectedAccountName(accountNames[0]);
      setKategoriPengeluaran(accountNames[0]);
    } else {
      setSelectedAccountName("");
      setKategoriPengeluaran("");
    }
  };

  // Handler when account_name is selected (after account_type)
  const handleAccountNameChangeAfterType = (accountName: string) => {
    setSelectedAccountName(accountName);
    setKategoriPengeluaran(accountName);
  };

  /** Conditional Logic - Determine field visibility and state */
  const shouldShowField = (fieldName: string): boolean => {
    switch (fieldName) {
      case "kategoriLayanan":
      case "jenisLayanan":
        return jenisTransaksi === "Penjualan Jasa";

      case "itemBarang":
      case "description":
        return ["Penjualan Barang", "Pembelian Barang"].includes(
          jenisTransaksi,
        );

      case "akunCoa":
        return ![
          "Penerimaan Kas",
          "Pengeluaran Kas",
          "Mutasi Kas",
          "Pelunasan Piutang",
          "Pembayaran Hutang",
          "Pinjaman Masuk",
          "Pelunasan Pinjaman",
        ].includes(jenisTransaksi);

      case "sumberPenerimaan":
        return jenisTransaksi === "Penerimaan Kas";

      case "kasSumber":
      case "kasTujuan":
        return jenisTransaksi === "Mutasi Kas";

      case "kategoriPengeluaran":
        return jenisTransaksi === "Pengeluaran Kas";

      default:
        return true;
    }
  };

  const shouldDisableField = (fieldName: string): boolean => {
    if (fieldName === "paymentType") {
      return [
        "Penerimaan Kas",
        "Pelunasan Piutang",
        "Pembayaran Hutang",
      ].includes(jenisTransaksi);
    }
    return false;
  };

  /** Auto-set Payment Type based on Jenis Transaksi */
  useEffect(() => {
    if (jenisTransaksi) {
      const penerimaanTypes = [
        "Penjualan Barang",
        "Penjualan Jasa",
        "Penerimaan Kas",
        "Pinjaman Masuk",
      ];

      const pengeluaranTypes = [
        "Pembelian",
        "Pengeluaran Kas",
        "Pembayaran Pinjaman",
      ];

      if (penerimaanTypes.includes(jenisTransaksi)) {
        setPaymentType("Penerimaan Kas");
      } else if (pengeluaranTypes.includes(jenisTransaksi)) {
        setPaymentType("Pengeluaran Kas");
      }

      // Auto-set payment type to Cash for specific transactions
      if (
        ["Penerimaan Kas", "Pelunasan Piutang", "Pembayaran Hutang"].includes(
          jenisTransaksi,
        )
      ) {
        setPaymentType("Cash");
      }

      // Auto-filter kategori based on jenis transaksi
      loadCategoriesForTransaction(jenisTransaksi);
      setKategori(""); // Reset kategori
      setJenisLayanan(""); // Reset jenis layanan
      setCoaSelected(""); // Reset COA
    }
  }, [jenisTransaksi]);

  /** Load available categories based on Jenis Transaksi */
  const loadCategoriesForTransaction = async (transactionType: string) => {
    try {
      // Define category mapping based on transaction type
      let allowedCategories: string[] = [];

      if (transactionType === "Penjualan Jasa") {
        // Only service categories (Jasa)
        allowedCategories = [
          "Jasa Cargo",
          "Jasa Gudang",
          "Jasa Kepabeanan",
          "Jasa Trucking",
          "Jasa Lainnya",
          "Unit Disewakan",
        ];
      } else if (transactionType === "Penjualan Barang") {
        // Barang/Persediaan categories
        allowedCategories = ["Persediaan", "Barang"];
      } else if (
        transactionType === "Pembelian Barang" ||
        transactionType === "Pembelian Jasa"
      ) {
        // Pembelian barang/persediaan
        allowedCategories = ["Persediaan", "Barang"];
      } else if (transactionType === "Penerimaan Kas") {
        // All income categories
        allowedCategories = [
          "Jasa Cargo",
          "Jasa Gudang",
          "Jasa Kepabeanan",
          "Jasa Trucking",
          "Jasa Lainnya",
          "Unit Disewakan",
          "Persediaan",
          "Barang",
        ];
      } else if (transactionType === "Pengeluaran Kas") {
        // Expense categories
        allowedCategories = ["Beban"];
      } else if (
        transactionType === "Pinjaman Masuk" ||
        transactionType === "Pembayaran Pinjaman"
      ) {
        // Only Pinjaman
        allowedCategories = ["Pinjaman"];
      }

      // Fetch categories from database that match allowed list
      const { data, error } = await supabase
        .from("coa_category_mapping")
        .select("service_category")
        .in("service_category", allowedCategories)
        .eq("is_active", true);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(data?.map((item) => item.service_category).filter(Boolean)),
      ) as string[];

      setAvailableCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      setAvailableCategories([]);
    }
  };

  /** Load Items & Brands */
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadItems(),
        loadSuppliers(),
        loadCustomers(),
        loadConsignees(),
        loadBanks(),
        loadKasAccounts(),
        loadBorrowers(),
        loadTransactions(),
      ]);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load transactions when showReport is true
  useEffect(() => {
    if (showReport) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReport]);

  // Debug state changes
  useEffect(() => {
    console.log("🔍 State Debug:", {
      customers: customers.length,
      banks: banks.length,
      suppliers: suppliers.length,
    });
  }, [customers, banks, suppliers]);

  // Refresh loan data when borrower changes or form opens
  useEffect(() => {
    const refreshLoanData = async () => {
      if (selectedBorrower && jenisTransaksi === "Pembayaran Pinjaman") {
        try {
          // Load loan details
          const { data: loans } = await supabase
            .from("loans")
            .select("*")
            .eq("lender_name", selectedBorrower)
            .eq("status", "Aktif")
            .order("loan_date", { ascending: false })
            .limit(1);

          if (loans && loans.length > 0) {
            const loan = loans[0];

            // Reload installment schedule
            const { data: installments } = await supabase
              .from("loan_installments")
              .select("*")
              .eq("loan_id", loan.id)
              .order("installment_number", { ascending: true });

            if (installments && installments.length > 0) {
              const schedule = installments.map((inst) => ({
                installment: inst.installment_number,
                dueDate: inst.due_date,
                principalAmount: inst.principal_amount,
                interestAmount: inst.interest_amount,
                totalPayment: inst.total_amount,
                remainingBalance: inst.remaining_balance,
                status: inst.status,
                paidAmount: inst.paid_amount || 0,
              }));
              setInstallmentSchedule(schedule);

              // Find next unpaid installment
              const nextUnpaid = installments.find(
                (inst) => inst.status === "Belum Bayar",
              );
              if (nextUnpaid) {
                setPrincipalAmount(
                  nextUnpaid.principal_amount?.toString() || "0",
                );
                setInterestAmount(
                  nextUnpaid.interest_amount?.toString() || "0",
                );
                setTanggal(nextUnpaid.due_date || "");
              }
            }
          }
        } catch (error) {
          // Error refreshing loan data
        }
      }
    };

    refreshLoanData();
  }, [selectedBorrower, jenisTransaksi, showForm]);

  // Load descriptions when item changes
  useEffect(() => {
    if (itemName) {
      loadDescriptions(itemName);
    } else {
      setDescriptions([]);
      setDescription("");
    }
  }, [itemName]);

  // No longer filtering brands by item - show all brands
  // This allows newly added brands to appear immediately
  /*useEffect(() => {
    setFilteredBrands(brands);
  }, [brands]);
  */

  const loadItems = async () => {
    const { data } = await supabase
      .from("stock")
      .select("item_name, description, quantity, selling_price")
      .not("item_name", "is", null);

    const uniqueItems = Array.from(
      new Set(data?.map((item) => item.item_name) || []),
    ).map((item_name) => {
      const match = data.find((d) => d.item_name === item_name);
      return {
        item_name,
        description: match?.description || "",
        quantity: match?.quantity || 0,
        selling_price: match?.selling_price || 0,
      };
    });

    setItems(uniqueItems);
  };

  const loadDescriptions = async (selectedItemName: string) => {
    if (!selectedItemName) {
      setDescriptions([]);
      return;
    }

    const { data } = await supabase
      .from("stock")
      .select("description")
      .eq("item_name", selectedItemName)
      .not("description", "is", null);

    const uniqueDescriptions = Array.from(
      new Set(data?.map((item) => item.description) || []),
    ).map((description) => ({ description }));

    setDescriptions(uniqueDescriptions);
  };

  // Fetch stock information when item and description are selected
  const fetchStockInfo = async (itemName: string, description: string) => {
    if (!itemName || !description) {
      setStockInfo(null);
      return;
    }

    setLoadingStock(true);
    try {
      const { data, error } = await supabase
        .from("stock")
        .select(
          `
          *,
          warehouses!warehouse_id(name, code, address)
        `,
        )
        .eq("item_name", itemName)
        .eq("description", description)
        .maybeSingle();

      if (error) throw error;

      setStockInfo(data);

      // Auto-fill harga jual if available
      if (data?.harga_jual) {
        setHargaJual(data.harga_jual.toString());
      }
    } catch (error) {
      console.error("Error fetching stock info:", error);
      setStockInfo(null);
    } finally {
      setLoadingStock(false);
    }
  };

  // Update stock info when item or description changes
  useEffect(() => {
    fetchStockInfo(itemName, description);
  }, [itemName, description]);

  const loadSuppliers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("suppliers").select("*");
      if (error) throw error;
      console.log("Suppliers loaded:", data);
      setSuppliers(data || []);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setSuppliers([]);
    }
  };

  const loadCustomers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      console.log("Customers loaded:", data);
      console.log("Total customers:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Sample customer:", data[0]);
      }
      setCustomers(data || []);
    } catch (err) {
      console.error("Error loading customers:", err);
      setCustomers([]);
    }
  };

  const loadConsignees = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("consignees").select("*");
      if (error) throw error;
      console.log("Consignees loaded:", data);
      setConsignees(data || []);
    } catch (err) {
      console.error("Error loading consignees:", err);
      setConsignees([]);
    }
  };

  const loadBanks = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .ilike("account_name", "%bank - %")
        .order("account_code");
      if (error) throw error;
      console.log("Banks loaded:", data);
      setBanks(data || []);
    } catch (err) {
      console.error("Error loading banks:", err);
      setBanks([]);
    }
  };

  const loadKasAccounts = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .ilike("account_name", "%kas - %")
        .order("account_code");
      if (error) throw error;
      console.log("Kas accounts loaded:", data);
      setKasAccounts(data || []);
    } catch (err) {
      console.error("Error loading kas accounts:", err);
      setKasAccounts([]);
    }
  };

  const loadBorrowers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("borrowers").select("*");
      if (error) throw error;
      setBorrowers(data || []);
    } catch (err) {
      setBorrowers([]);
    }
  };

  // Load transactions from database - combining all transaction tables
  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      console.log("🔄 Loading transactions from all tables...");

      // Load from kas_transaksi (approved, waiting approval, and rejected)
      const { data: kasData, error: kasError } = await supabase
        .from("kas_transaksi")
        .select("*")
        .or(
          "approval_status.eq.approved,approval_status.eq.waiting_approval,approval_status.eq.rejected,approval_status.is.null",
        )
        .order("tanggal", { ascending: false });

      if (kasError) {
        console.error("Error loading kas_transaksi:", kasError);
      }

      // Load from cash_disbursement (approved, waiting approval, and rejected)
      const { data: cashDisbursementData, error: cashDisbursementError } =
        await supabase
          .from("cash_disbursement")
          .select("*")
          .or(
            "approval_status.eq.approved,approval_status.eq.waiting_approval,approval_status.eq.rejected",
          )
          .order("transaction_date", { ascending: false });

      if (cashDisbursementError) {
        console.error(
          "❌ Error loading cash_disbursement:",
          cashDisbursementError,
        );
      }

      // Load from purchase_transactions (approved, waiting approval, and rejected)
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchase_transactions")
        .select("*")
        .or(
          "approval_status.eq.approved,approval_status.eq.waiting_approval,approval_status.eq.rejected,approval_status.is.null",
        )
        .order("transaction_date", { ascending: false });

      if (purchaseError) {
        console.error("Error loading purchase_transactions:", purchaseError);
      }

      // Load from sales_transactions
      const { data: salesData, error: salesError } = await supabase
        .from("sales_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (salesError) {
        console.error("Error loading sales_transactions:", salesError);
      }

      // Load from internal_usage
      const { data: internalData, error: internalError } = await supabase
        .from("internal_usage")
        .select("*")
        .order("usage_date", { ascending: false });

      if (internalError) {
        console.error("Error loading internal_usage:", internalError);
      }

      // Load from cash_and_bank_receipts (Penerimaan Kas & Bank)
      const { data: cashReceiptsData, error: cashReceiptsError } =
        await supabase
          .from("cash_and_bank_receipts")
          .select("*")
          .order("transaction_date", { ascending: false });

      if (cashReceiptsError) {
        console.error(
          "Error loading cash_and_bank_receipts:",
          cashReceiptsError,
        );
      } else {
        console.log("Cash receipts data loaded:", cashReceiptsData);
        console.log(
          "First cash receipt bukti:",
          cashReceiptsData?.[0]?.bukti,
        );
      }

      // Load from approval_transaksi (Penjualan Jasa, etc - approved, waiting approval, and rejected)
      const { data: approvalData, error: approvalError } = await supabase
        .from("approval_transaksi")
        .select("*")
        .or(
          "approval_status.eq.approved,approval_status.eq.waiting_approval,approval_status.eq.rejected",
        )
        .order("transaction_date", { ascending: false });

      if (approvalError) {
        console.error("Error loading approval_transaksi:", approvalError);
      }

      // Note: expenses and loans tables are not used in this view

      console.log("📊 Query results:", {
        kas: kasData?.length || 0,
        cashDisbursement: cashDisbursementData?.length || 0,
        purchase: purchaseData?.length || 0,
        sales: salesData?.length || 0,
        internal: internalData?.length || 0,
        cashReceipts: cashReceiptsData?.length || 0,
        approval: approvalData?.length || 0,
      });

      // Combine all transactions with source identifier
      const allTransactions = [
        ...(kasData || []).map((t) => ({
          ...t,
          source: "kas_transaksi",
          tanggal: t.tanggal,
        })),
        ...(cashDisbursementData || []).map((t) => ({
          ...t,
          source: "cash_disbursement",
          tanggal: t.transaction_date,
          nominal: t.amount,
          keterangan: t.description,
          payment_type: "Pengeluaran Kas",
          document_number: t.document_number,
        })),
        ...(cashReceiptsData || []).map((t) => {
          const mapped = {
            ...t,
            source: "cash_receipts",
            tanggal: t.transaction_date,
            nominal: t.amount,
            keterangan: t.description,
            payment_type: "Penerimaan Kas",
            document_number: t.reference_number,
            approval_status: "approved", // Penerimaan Kas langsung Approved tanpa perlu approval
            bukti: t.bukti, // Explicitly include bukti field
          };
          console.log("🔍 Mapped cash receipt:", {
            id: t.id,
            bukti: t.bukti,
            mapped_bukti: mapped.bukti,
          });
          return mapped;
        }),
        ...(purchaseData || []).map((t) => ({
          ...t,
          source: "PURCHASE TRANSACTIONS",
          tanggal: t.transaction_date,
          jenis: "Pembelian",
          nominal: t.total_amount,
        })),
        ...(salesData || []).map((t) => ({
          ...t,
          source: "sales_transactions",
          tanggal: t.transaction_date,
          jenis: "Penjualan",
          nominal: t.total_amount,
        })),
        ...(internalData || []).map((t) => ({
          ...t,
          source: "internal_usage",
          tanggal: t.usage_date,
          jenis: "Pemakaian Internal",
          nominal: t.total_value,
        })),
        ...(approvalData || [])
          .filter(
            (t) => t.type !== "Penjualan Barang" && t.type !== "Penjualan Jasa",
          ) // Exclude sales transactions (already in sales_transactions table)
          .map((t) => ({
            ...t,
            source:
              t.type === "Pembelian Jasa"
                ? "PURCHASE TRANSACTIONS"
                : "approval_transaksi",
            tanggal: t.transaction_date,
            jenis: t.type === "Pembelian Jasa" ? "Pembelian" : t.type,
            nominal: t.total_amount,
            keterangan: t.description || t.notes,
            payment_type: t.type,
            document_number: t.document_number,
          })),
      ];

      // Sort by date descending
      allTransactions.sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
      );

      setTransactions(allTransactions);
      console.log("Total transactions loaded:", allTransactions.length);

      if (allTransactions.length === 0) {
        toast({
          title: "ℹ️ Tidak Ada Data",
          description: "Belum ada transaksi. Silakan tambah transaksi baru.",
        });
      } else {
        toast({
          title: "✅ Data Loaded",
          description: `${allTransactions.length} transaksi berhasil dimuat dari semua tabel`,
        });
      }
    } catch (err: any) {
      console.error("Exception:", err);
      setTransactions([]);
      toast({
        title: "❌ Error",
        description: err.message || "Gagal memuat transaksi",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transaction: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from(transaction.source)
        .delete()
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "✅ Berhasil",
        description: "Transaksi berhasil dihapus",
      });

      // Reload transactions
      await loadTransactions();
    } catch (err: any) {
      toast({
        title: "❌ Error",
        description: err.message || "Gagal menghapus transaksi",
        variant: "destructive",
      });
    }
  };

  // Calculate installment schedule
  const calculateInstallmentSchedule = () => {
    if (!nominal || !loanTermMonths || !interestRate || !tanggal) {
      setInstallmentSchedule([]);
      return;
    }

    const principal = Number(nominal);
    const months = Number(loanTermMonths);
    const annualRate = Number(interestRate) / 100;
    const monthlyRate = annualRate / 12;

    const schedule: any[] = [];
    let remainingPrincipal = principal;

    // Calculate based on payment schedule type
    if (paymentSchedule === "Bulanan") {
      // Monthly installment with reducing balance
      const monthlyPayment =
        monthlyRate === 0
          ? principal / months
          : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

      for (let i = 1; i <= months; i++) {
        const interestPayment = remainingPrincipal * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingPrincipal -= principalPayment;

        const dueDate = new Date(tanggal);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedule.push({
          installment: i,
          dueDate: dueDate.toISOString().split("T")[0],
          principalAmount: principalPayment,
          interestAmount: interestPayment,
          totalPayment: monthlyPayment,
          remainingBalance: Math.max(0, remainingPrincipal),
        });
      }
    } else if (paymentSchedule === "Jatuh Tempo") {
      // Lump sum at maturity
      const totalInterest = principal * annualRate * (months / 12);
      const dueDate = maturityDate || new Date(tanggal);

      schedule.push({
        installment: 1,
        dueDate:
          typeof dueDate === "string"
            ? dueDate
            : dueDate.toISOString().split("T")[0],
        principalAmount: principal,
        interestAmount: totalInterest,
        totalPayment: principal + totalInterest,
        remainingBalance: 0,
      });
    }

    setInstallmentSchedule(schedule);
  };

  // Calculate late fee
  const calculateLateFee = (
    dueDate: string,
    paymentDate: string,
    amount: number,
  ) => {
    const due = new Date(dueDate);
    const payment = new Date(paymentDate);
    const daysLate = Math.floor(
      (payment.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLate <= 0) return 0;

    // 0.1% per day late (configurable)
    const dailyPenaltyRate = 0.001;
    return amount * dailyPenaltyRate * daysLate;
  };

  // Recalculate schedule when loan parameters change
  useEffect(() => {
    if (
      jenisTransaksi === "Pinjaman Masuk" ||
      jenisTransaksi === "Pembayaran Pinjaman"
    ) {
      calculateInstallmentSchedule();
    }
  }, [
    nominal,
    loanTermMonths,
    interestRate,
    paymentSchedule,
    tanggal,
    maturityDate,
  ]);

  /** Load Service Types when Kategori changes */
  useEffect(() => {
    if (kategori) {
      loadServiceTypes(kategori);
      setJenisLayanan(""); // Reset jenis layanan
      setCoaSelected(""); // Reset COA
    } else {
      setServiceTypes([]);
    }
  }, [kategori]);

  const loadServiceTypes = async (category: string) => {
    try {
      // Special handling for "Kas & Bank" category
      if (category === "Kas & Bank") {
        const { data, error } = await supabase
          .from("chart_of_accounts")
          .select("*")
          .ilike("account_name", "%kas - %")
          .order("account_code");

        if (error) throw error;

        // Use account names as service types for Kas & Bank
        const kasAccounts = data?.map((acc) => acc.account_name) || [];
        setServiceTypes(kasAccounts);
        console.log("Kas accounts loaded:", kasAccounts);
      } else {
        // Normal flow for other categories
        const { data, error } = await supabase
          .from("coa_category_mapping")
          .select("service_type")
          .eq("service_category", category)
          .eq("is_active", true);

        if (error) throw error;

        const uniqueTypes = Array.from(
          new Set(data?.map((item) => item.service_type).filter(Boolean)),
        ) as string[];

        setServiceTypes(uniqueTypes);
      }
    } catch (error) {
      console.error("Error loading service types:", error);
    }
  };

  /** Auto-fill COA when Kategori and Jenis Layanan are selected */
  useEffect(() => {
    if (kategori && jenisLayanan) {
      autoFillCOA();
    }
  }, [kategori, jenisLayanan, paymentType]);

  const autoFillCOA = async () => {
    try {
      // Financial Engine Logic
      let accountCode = "";

      // Cash Engine - Direct cash transactions
      if (
        paymentType === "Penerimaan Kas" ||
        paymentType === "Pengeluaran Kas"
      ) {
        // Get mapping for the selected service
        const { data: mapping } = await supabase
          .from("coa_category_mapping")
          .select("*")
          .eq("service_category", kategori)
          .eq("service_type", jenisLayanan)
          .eq("is_active", true)
          .single();

        if (mapping) {
          if (paymentType === "Penerimaan Kas") {
            // For income: use revenue account
            accountCode = mapping.revenue_account_code;
          } else if (paymentType === "Pengeluaran Kas") {
            // For expense: use COGS/expense account
            accountCode = mapping.cogs_account_code;
          }
        }
      }

      // Revenue Engine - Sales transactions
      else if (
        jenisTransaksi === "Penjualan Jasa" ||
        jenisTransaksi === "Penjualan Barang"
      ) {
        const { data: mapping } = await supabase
          .from("coa_category_mapping")
          .select("*")
          .eq("service_category", kategori)
          .eq("service_type", jenisLayanan)
          .eq("is_active", true)
          .single();

        if (mapping) {
          // Use revenue account for sales
          accountCode = mapping.revenue_account_code;
        }
      }

      // Expense Engine - Purchase and expense transactions
      else if (
        jenisTransaksi === "Pembelian" ||
        jenisTransaksi === "Beban Operasional"
      ) {
        const { data: mapping } = await supabase
          .from("coa_category_mapping")
          .select("*")
          .eq("service_category", kategori)
          .eq("service_type", jenisLayanan)
          .eq("is_active", true)
          .single();

        if (mapping) {
          if (jenisTransaksi === "Pembelian") {
            // For purchases: use asset account (inventory)
            accountCode =
              mapping.asset_account_code || mapping.cogs_account_code;
          } else {
            // For expenses: use COGS/expense account
            accountCode = mapping.cogs_account_code;
          }
        }
      }

      // Loan Engine - Loan transactions
      else if (
        jenisTransaksi === "Pinjaman Masuk" ||
        jenisTransaksi === "Pembayaran Pinjaman"
      ) {
        // For loans, use specific loan accounts
        if (jenisTransaksi === "Pinjaman Masuk") {
          accountCode = "2-2000"; // Hutang Bank
        } else {
          accountCode = "2-2000"; // Hutang Bank (debit side)
        }
      }

      // Set the selected COA
      if (accountCode) {
        setCoaSelected(accountCode);

        // Load the full COA details for display
        const { data: coaData, error: coaError } = await supabase
          .from("chart_of_accounts")
          .select("*")
          .eq("account_code", accountCode)
          .maybeSingle();

        if (coaError) {
          console.error("Error loading COA details:", coaError);
        } else if (coaData) {
          setCoa([coaData]);
        }
      }
    } catch (error) {
      console.error("Error auto-filling COA:", error);
      // If no mapping found, load all COA
      loadCOA();
    }
  };

  /** Load COA with dynamic filter */
  useEffect(() => {
    loadCOA();
  }, [kategori, jenisLayanan, paymentType]);

  const loadCOA = async () => {
    const { data } = await supabase
      .from("chart_of_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("is_header", false)
      .order("account_code");

    let filtered = data || [];

    if (paymentType === "Penerimaan Kas") {
      filtered = filtered.filter((c) =>
        ["Pendapatan", "Aset", "Ekuitas"].includes(c.account_type),
      );
    }

    if (paymentType === "Pengeluaran Kas") {
      filtered = filtered.filter((c) =>
        ["Beban", "HPP", "Kewajiban"].includes(c.account_type),
      );
    }

    if (kategori) {
      filtered = filtered.filter((c) => c.kategori_layanan === kategori);
    }

    setCoa(filtered);
  };

  /** Handle Preview Jurnal */
  const handlePreview = async () => {
    try {
      // Validate Input
      validateInput({
        jenisTransaksi,
        nominal,
        tanggal,
      });

      // Normalize Input
      const normalizedInput = normalizeInput({
        jenisTransaksi,
        paymentType,
        nominal,
        tanggal,
        deskripsi: description,
        sumberPenerimaan: "",
        kategoriPengeluaran: kategori,
        kasTujuan: "",
        kasSumber: "",
      });

      // Run Financial Engine
      const result = await runFinancialEngine(normalizedInput);

      // Build Journal Lines
      const journalData = buildJournalLines(
        { account_code: result.debit, account_name: result.debitName },
        { account_code: result.credit, account_name: result.creditName },
        normalizedInput.nominal,
        normalizedInput.deskripsi,
        normalizedInput.tanggal,
        result.hpp_entry,
        normalizedInput.nominal * 0.7,
      );

      // Show Preview
      setPreviewLines(journalData.lines);
      setPreviewMemo(journalData.memo);
      setPreviewTanggal(journalData.tanggal);
      setPreviewIsCashRelated(result.is_cash_related);
      setPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.details ? error.details.join(", ") : error.message,
        variant: "destructive",
      });
    }
  };

  /** Choose Mapping Rule - Generate filter strings for COA queries */
  const chooseMappingRule = (normalizedInput: any) => {
    const jenis = normalizedInput.jenisTransaksi;
    const payment = normalizedInput.paymentType;
    const sumber = normalizedInput.sumberPenerimaan;
    const kategori = normalizedInput.kategoriPengeluaran;

    let debitFilter: any = null;
    let creditFilter: any = null;
    let extras = {
      needs_hpp: false,
      hppFilter: null as any,
      is_cash_related: false,
    };

    switch (jenis) {
      case "Penjualan Jasa":
        debitFilter = { flow_type: "cash" };
        creditFilter = { usage_role: "pendapatan_jasa" };
        extras.is_cash_related = payment === "cash";
        break;

      case "Penjualan Barang":
        debitFilter = { flow_type: "cash" };
        creditFilter = { usage_role: "pendapatan_barang" };
        extras.is_cash_related = payment === "cash";
        extras.needs_hpp = true;
        extras.hppFilter = { usage_role: "hpp" };
        break;

      case "Penerimaan Kas":
        debitFilter = { flow_type: "cash" };
        if (sumber === "Pinjaman Bank") creditFilter = { usage_role: "hutang" };
        else if (sumber === "Setoran Modal")
          creditFilter = { trans_type: "equity" };
        else if (sumber === "Pelunasan Piutang")
          creditFilter = { usage_role: "piutang" };
        else creditFilter = { usage_role: "other" };
        extras.is_cash_related = true;
        break;

      case "Pengeluaran Kas":
        debitFilter =
          kategori === "Beban Kendaraan"
            ? { usage_role: "beban_kendaraan" }
            : { usage_role: "beban_operasional" };
        creditFilter = { flow_type: "cash" };
        extras.is_cash_related = true;
        break;

      case "Pembelian Barang":
        debitFilter = { usage_role: "inventory" };
        creditFilter =
          payment === "cash" ? { flow_type: "cash" } : { usage_role: "hutang" };
        extras.is_cash_related = payment === "cash";
        break;

      case "Pembelian Jasa":
        debitFilter = { usage_role: "beban_operasional" };
        creditFilter =
          payment === "cash" ? { flow_type: "cash" } : { usage_role: "hutang" };
        extras.is_cash_related = payment === "cash";
        break;

      case "Pembayaran Hutang":
        debitFilter = { usage_role: "hutang" };
        creditFilter = { flow_type: "cash" };
        extras.is_cash_related = true;
        break;

      case "Pelanggan Bayar Piutang":
        debitFilter = { flow_type: "cash" };
        creditFilter = { usage_role: "piutang" };
        extras.is_cash_related = true;
        break;

      case "Pinjaman Masuk":
        debitFilter = { flow_type: "cash" };
        creditFilter = { usage_role: "hutang" };
        extras.is_cash_related = true;
        break;

      case "Pelunasan Pinjaman":
        debitFilter = { usage_role: "hutang" };
        creditFilter = { flow_type: "cash" };
        extras.is_cash_related = true;
        break;

      case "Pembayaran Pinjaman":
        debitFilter = { usage_role: "hutang" };
        creditFilter = { flow_type: "cash" };
        extras.is_cash_related = true;
        break;

      case "Mutasi Kas":
        return {
          special: "mutasi",
          debit_account_code: normalizedInput.kasTujuan,
          credit_account_code: normalizedInput.kasSumber,
          is_cash_related: true,
        };

      default:
        throw { message: "jenisTransaksi tidak dikenali" };
    }

    return { debitFilter, creditFilter, extras, input: normalizedInput };
  };

  /** Fallback and Upsert COA - Create placeholder accounts if missing */
  const fallbackAndUpsertCOA = async (
    debitAccount: any,
    creditAccount: any,
    mappingRule: any,
  ) => {
    const toUpsert: any[] = [];
    let resultDebit = debitAccount;
    let resultCredit = creditAccount;

    if (!debitAccount) {
      // Create placeholder debit account
      const code =
        mappingRule.special === "mutasi"
          ? mappingRule.debit_account_code
          : "1-1199"; // Placeholder cash account

      const placeholder = {
        account_code: code,
        account_name: "AUTO-PLACEHOLDER-DEBIT",
        account_type: "Aset",
        trans_type: "asset",
        flow_type: "cash",
        usage_role: "kas",
        is_active: true,
      };

      toUpsert.push(placeholder);
      resultDebit = placeholder;
    }

    if (!creditAccount) {
      // Determine placeholder credit account based on filter
      let code = "4-9999"; // Default: other revenue
      let accountType = "Pendapatan";
      let transType = "revenue";
      let usageRole = "other";

      if (mappingRule.creditFilter?.usage_role === "hutang") {
        code = "2-2999";
        accountType = "Kewajiban";
        transType = "liability";
        usageRole = "hutang";
      }

      const placeholder = {
        account_code: code,
        account_name: "AUTO-PLACEHOLDER-CREDIT",
        account_type: accountType,
        trans_type: transType,
        flow_type: "non_cash",
        usage_role: usageRole,
        is_active: true,
      };

      toUpsert.push(placeholder);
      resultCredit = placeholder;
    }

    // Upsert if needed
    if (toUpsert.length > 0) {
      try {
        const { error } = await supabase
          .from("chart_of_accounts")
          .upsert(toUpsert, { onConflict: "account_code" });

        if (error) {
          console.error("Error upserting placeholder COA:", error);
        }

        return {
          upserted: true,
          debitAccount: resultDebit,
          creditAccount: resultCredit,
        };
      } catch (error) {
        console.error("Error in fallbackAndUpsertCOA:", error);
      }
    }

    return {
      upserted: false,
      debitAccount: resultDebit,
      creditAccount: resultCredit,
    };
  };

  /** Build Journal Lines */
  const buildJournalLines = (
    debitAccount: any,
    creditAccount: any,
    nominal: number,
    memo: string,
    tanggal: string,
    hppEntry: any,
    hppAmount: number = 0,
  ) => {
    const lines: any[] = [
      {
        account_code: debitAccount.account_code,
        account_name: debitAccount.account_name,
        dc: "D",
        amount: nominal,
      },
      {
        account_code: creditAccount.account_code,
        account_name: creditAccount.account_name,
        dc: "C",
        amount: nominal,
      },
    ];

    // Add HPP lines if needed (for Penjualan Barang)
    if (hppEntry) {
      lines.push({
        account_code: hppEntry.debit,
        account_name: hppEntry.debitName || "HPP",
        dc: "D",
        amount: hppAmount,
      });
      lines.push({
        account_code: hppEntry.credit,
        account_name: hppEntry.creditName || "Persediaan",
        dc: "C",
        amount: hppAmount,
      });
    }

    return { lines, memo, tanggal };
  };

  /** Load COA by filter */
  const loadCOAByFilter = async (filter: any) => {
    if (!filter) return null;

    let query = supabase
      .from("chart_of_accounts")
      .select("account_code, account_name, trans_type, flow_type, usage_role")
      .eq("is_active", true)
      .limit(1)
      .order("account_code", { ascending: true });

    // Apply filters
    Object.keys(filter).forEach((key) => {
      query = query.eq(key, filter[key]);
    });

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Error loading COA:", error);
      return null;
    }

    return data;
  };

  /** Financial Engine - Determine Debit/Credit Accounts using filter-based mapping */
  const runFinancialEngine = async (normalizedInput: any) => {
    try {
      // Step 1: Choose mapping rule
      const mappingRule = chooseMappingRule(normalizedInput);

      // Handle special case: Mutasi Kas
      if (mappingRule.special === "mutasi") {
        return {
          debit: mappingRule.debit_account_code,
          credit: mappingRule.credit_account_code,
          is_cash_related: mappingRule.is_cash_related,
          hpp_entry: null,
        };
      }

      // Step 2: Load Debit COA
      let debitAccount = await loadCOAByFilter(mappingRule.debitFilter);

      // Step 3: Load Credit COA
      let creditAccount = await loadCOAByFilter(mappingRule.creditFilter);

      // Step 4: Fallback and Upsert COA if missing
      const fallbackResult = await fallbackAndUpsertCOA(
        debitAccount,
        creditAccount,
        mappingRule,
      );

      if (fallbackResult.upserted) {
        // Reload accounts after upsert
        if (!debitAccount) {
          debitAccount = fallbackResult.debitAccount;
        }
        if (!creditAccount) {
          creditAccount = fallbackResult.creditAccount;
        }
      }

      // Step 5: Load HPP COA if needed
      let hppEntry = null;
      if (mappingRule.extras.needs_hpp) {
        const hppDebitAccount = await loadCOAByFilter(
          mappingRule.extras.hppFilter,
        );
        const hppCreditAccount = await loadCOAByFilter({
          usage_role: "inventory",
        });

        if (hppDebitAccount && hppCreditAccount) {
          hppEntry = {
            debit: hppDebitAccount.account_code,
            credit: hppCreditAccount.account_code,
            debitName: hppDebitAccount.account_name,
            creditName: hppCreditAccount.account_name,
          };
        }
      }

      return {
        debit: debitAccount?.account_code || "",
        credit: creditAccount?.account_code || "",
        debitName: debitAccount?.account_name || "",
        creditName: creditAccount?.account_name || "",
        is_cash_related: mappingRule.extras.is_cash_related,
        hpp_entry: hppEntry,
      };
    } catch (error) {
      console.error("Error in runFinancialEngine:", error);
      throw error;
    }
  };

  /** Validate Input */
  const validateInput = (form: any) => {
    const errors: string[] = [];
    if (!form.jenisTransaksi) errors.push("jenisTransaksi wajib diisi");
    if (!form.nominal || Number(form.nominal) <= 0)
      errors.push("nominal harus > 0");
    if (!form.tanggal) errors.push("tanggal wajib diisi");

    if (errors.length) {
      throw { message: "Validation failed", details: errors };
    }
    return { ok: true };
  };

  /** Normalize Input */
  const normalizeInput = (form: any) => {
    const jenis = (form.jenisTransaksi || "").trim();
    const payment = (form.paymentType || "").toLowerCase(); // 'cash' or 'tempo'
    const nominalValue = Number(form.nominal || 0);
    const sumber = (form.sumberPenerimaan || "").trim(); // e.g. 'Pinjaman Bank'
    const kategoriPengeluaranValue = (form.kategoriPengeluaran || "").trim();

    return {
      jenisTransaksi: jenis,
      paymentType: payment,
      nominal: nominalValue,
      tanggal: form.tanggal,
      deskripsi: form.deskripsi || "",
      sumberPenerimaan: sumber,
      kategoriPengeluaran: kategoriPengeluaranValue,
      kasTujuan: form.kasTujuan || "",
      kasSumber: form.kasSumber || "",
    };
  };

  /** Save Transaction (Jurnal + Cash Book) */
  const handleSave = async () => {
    try {
      // Step 1: Validate Input
      validateInput({
        jenisTransaksi,
        nominal,
        tanggal,
      });

      // Step 2: Normalize Input
      const normalizedInput = normalizeInput({
        jenisTransaksi,
        paymentType,
        nominal,
        tanggal,
        deskripsi: description,
        sumberPenerimaan: sumberPenerimaan,
        kategoriPengeluaran: kategoriPengeluaran,
        kasTujuan: kasTujuan,
        kasSumber: kasSumber,
      });

      // Step 3: Run Financial Engine
      const result = await runFinancialEngine(normalizedInput);

      // Step 4: Build Journal Lines
      const journalData = buildJournalLines(
        { account_code: result.debit, account_name: result.debitName },
        { account_code: result.credit, account_name: result.creditName },
        normalizedInput.nominal,
        normalizedInput.deskripsi,
        normalizedInput.tanggal,
        result.hpp_entry,
        normalizedInput.nominal * 0.7, // HPP amount (70% of sales as example)
      );

      // Step 5: Show Preview Modal
      setPreviewLines(journalData.lines);
      setPreviewMemo(journalData.memo);
      setPreviewTanggal(journalData.tanggal);
      setPreviewIsCashRelated(result.is_cash_related);
      setPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.details ? error.details.join(", ") : error.message,
        variant: "destructive",
      });
    }
  };

  /** ROUTER UTAMA - Route Transaction Based on Type */
  const routeTransaction = async (
    journalRef: string,
    uploadedBuktiUrl: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Prepare OCR data
    const ocrDataPayload = ocrAppliedData
      ? {
          extractedText: ocrAppliedData.extractedText,
          items: ocrAppliedData.items,
          appliedFields: ocrAppliedData.appliedFields,
        }
      : null;

    console.log("🔀 ROUTER: Routing transaction type:", jenisTransaksi);
    console.log("💾 ROUTER: OCR Applied Data State:", ocrAppliedData);
    console.log("📤 ROUTER: OCR Data Payload to DB:", ocrDataPayload);
    console.log("🔍 ROUTER: Has OCR Data?", ocrDataPayload !== null);

    const mainDebitLine = previewLines.find((l) => l.dc === "D");
    const mainCreditLine = previewLines.find((l) => l.dc === "C");

    switch (jenisTransaksi) {
      case "Penjualan Barang": {
        // Insert to sales_transactions
        const unitPrice = Number(nominal) || 0;
        const quantity = 1;
        const subtotal = unitPrice * quantity;
        const taxPercentage = 11;
        const taxAmount = subtotal * (taxPercentage / 100);
        const totalAmount = subtotal + taxAmount;

        const { data: stockData } = await supabase
          .from("stock")
          .select("quantity, cost_per_unit")
          .eq("item_name", itemName)
          .eq("description", description)
          .maybeSingle();

        const { error } = await supabase.from("sales_transactions").insert({
          transaction_date: previewTanggal,
          transaction_type: "Barang",
          item_name: itemName,
          description: description,
          stock_before: stockData?.quantity || 0,
          quantity: quantity,
          stock_after: (stockData?.quantity || 0) - quantity,
          unit_price: unitPrice,
          subtotal: subtotal,
          tax_percentage: taxPercentage,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_method: paymentType === "cash" ? "Tunai" : "Piutang",
          customer_name: customer || "",
          coa_cash_code: paymentType === "cash" ? "1-1100" : "1-1200",
          coa_revenue_code: mainCreditLine?.account_code || "",
          coa_cogs_code: "5-1100",
          coa_inventory_code: coaSelected || "",
          coa_tax_code: taxAmount > 0 ? "2-1250" : null,
          description: description,
          notes: description,
          journal_ref: journalRef,
          approval_status: "approved",
          bukti: uploadedBuktiUrl || null,
          ocr_data: ocrDataPayload,
        });

        if (error) throw new Error(`Sales Transaction: ${error.message}`);
        console.log("ROUTER: Sales transaction (Barang) saved");
        break;
      }

      case "Penjualan Jasa": {
        // Insert to sales_transactions
        const unitPrice = Number(nominal) || 0;
        const quantity = 1;
        const subtotal = unitPrice * quantity;
        const taxPercentage = 11;
        const taxAmount = subtotal * (taxPercentage / 100);
        const totalAmount = subtotal + taxAmount;

        const { error } = await supabase.from("sales_transactions").insert({
          transaction_date: previewTanggal,
          transaction_type: "Jasa",
          item_name: `${kategori} - ${jenisLayanan}`,
          description: null,
          stock_before: null,
          quantity: quantity,
          stock_after: null,
          unit_price: unitPrice,
          subtotal: subtotal,
          tax_percentage: taxPercentage,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_method: paymentType === "cash" ? "Tunai" : "Piutang",
          customer_name: customer || "",
          coa_cash_code: paymentType === "cash" ? "1-1100" : "1-1200",
          coa_revenue_code: mainCreditLine?.account_code || "",
          coa_cogs_code: null,
          coa_inventory_code: null,
          coa_tax_code: taxAmount > 0 ? "2-1250" : null,
          description: description,
          notes: description,
          journal_ref: journalRef,
          approval_status: "approved",
          bukti: uploadedBuktiUrl || null,
          ocr_data: ocrDataPayload,
        });

        if (error) throw new Error(`Sales Transaction: ${error.message}`);
        console.log("ROUTER: Sales transaction (Jasa) saved");
        break;
      }

      case "Pembelian Barang": {
        // Insert to purchase_transactions
        const { error } = await supabase.from("purchase_transactions").insert({
          transaction_date: previewTanggal,
          supplier_name: supplier || "",
          item_name: itemName,
          description: description,
          quantity: 1,
          unit_price: nominal,
          total_amount: nominal,
          payment_method: paymentType === "cash" ? "Tunai" : "Hutang",
          coa_inventory_code: mainDebitLine?.account_code || "",
          coa_cash_code: mainCreditLine?.account_code || "",
          description: description,
          notes: description,
          journal_ref: journalRef,
          bukti: uploadedBuktiUrl || null,
          ocr_data: ocrDataPayload,
        });

        if (error)
          throw new Error(`Purchase Transaction: ${error.message}`);
        console.log("ROUTER: Purchase transaction (Barang) saved");
        break;
      }

      case "Pembelian Jasa": {
        // Insert to cash_disbursement
        const expenseLine = previewLines.find((l) => l.dc === "D");
        const cashLine = previewLines.find((l) => l.dc === "C");

        const { error } = await supabase.from("cash_disbursement").insert({
          transaction_date: previewTanggal,
          payee_name: supplier || "Pembelian Jasa",
          description: previewMemo,
          category: kategori,
          amount: nominal,
          payment_method: paymentType === "cash" ? "Tunai" : "Transfer Bank",
          coa_expense_code: expenseLine?.account_code || "6-1100",
          coa_cash_code: cashLine?.account_code || "1-1100",
          description: description,
          notes: description,
          created_by: user?.id,
          approval_status: "waiting_approval",
          bukti: uploadedBuktiUrl || null,
          ocr_data: ocrDataPayload,
        });

        if (error)
          throw new Error(`Cash Disbursement: ${error.message}`);
        console.log("ROUTER: Cash disbursement (Pembelian Jasa) saved");
        break;
      }

      case "Penerimaan Kas & Bank":
      case "Penerimaan Kas":
      case "Pinjaman Masuk": {
        // Insert to cash_and_bank_receipts
        const { error } = await supabase
          .from("cash_and_bank_receipts")
          .insert({
            transaction_date: previewTanggal,
            transaction_type: "Penerimaan",
            category: kategori || sumberPenerimaan,
            source_destination:
              sumberPenerimaan || customer || supplier || "Penerimaan Kas",
            amount: nominal,
            payment_method: paymentType === "cash" ? "Tunai" : "Bank",
            coa_cash_code: mainDebitLine?.account_code || "1-1100",
            coa_contra_code: mainCreditLine?.account_code || "4-1100",
            description: previewMemo,
            reference_number: `PKM-${Date.now()}`,
            journal_ref: journalRef,
            approval_status: "approved",
            bukti: uploadedBuktiUrl || null,
            ocr_data: ocrDataPayload,
          });

        if (error) throw new Error(`Cash Receipt: ${error.message}`);
        console.log("ROUTER: Cash receipt saved");
        break;
      }

      case "Pengeluaran Kas":
      case "Pembayaran Pinjaman": {
        // Insert to cash_disbursement
        const expenseLine = previewLines.find((l) => l.dc === "D");
        const cashLine = previewLines.find((l) => l.dc === "C");

        const { error } = await supabase.from("cash_disbursement").insert({
          transaction_date: previewTanggal,
          payee_name:
            namaKaryawanPengeluaran ||
            supplier ||
            customer ||
            "Pengeluaran Kas",
          description: previewMemo,
          category: kategori,
          amount: nominal,
          payment_method:
            jenisPembayaranPengeluaran === "Cash" ? "Tunai" : "Transfer Bank",
          coa_expense_code: expenseLine?.account_code || "6-1100",
          coa_cash_code: cashLine?.account_code || "1-1100",
          description: description,
          notes: description,
          created_by: user?.id,
          approval_status: "waiting_approval",
          bukti: uploadedBuktiUrl || null,
          ocr_data: ocrDataPayload,
        });

        if (error)
          throw new Error(`Cash Disbursement: ${error.message}`);
        console.log("ROUTER: Cash disbursement saved");
        break;
      }

      default:
        console.warn("⚠️ ROUTER: Unknown transaction type:", jenisTransaksi);
    }
  };

  /** Confirm and Save Journal Entries */
  const handleConfirmSave = async () => {
    try {
      setIsConfirming(true);
      
      // Debug: Log file states at the start
      console.log("🚀 handleConfirmSave started");
      console.log("📁 buktiFile at start:", buktiFile);
      console.log("📁 ocrFile at start:", ocrFile);
      console.log("📁 ocrAppliedData at start:", ocrAppliedData);

      // Generate journal reference
      const journalRef = `JRN-${Date.now()}`;

      // Step 6: Create Journal Entries
      const mainDebitLine = previewLines.find((l) => l.dc === "D");
      const mainCreditLine = previewLines.find((l) => l.dc === "C");

      if (mainDebitLine && mainCreditLine) {
        const { data, error } = await supabase.from("journal_entries").insert({
          journal_ref: journalRef,
          debit_account: mainDebitLine.account_code,
          credit_account: mainCreditLine.account_code,
          debit: mainDebitLine.amount,
          credit: mainCreditLine.amount,
          description: previewMemo,
          tanggal: previewTanggal,
          kategori,
          jenis_transaksi: jenisTransaksi,
        });

        if (error) {
          console.error("Journal Entry Error:", error);
          throw new Error(`Journal Entry: ${error.message}`);
        }
        console.log("Journal Entry saved:", data);
      }

      // Step 7: Save HPP entry if exists (for Penjualan Barang)
      if (previewLines.length > 2) {
        const hppDebitLine = previewLines[2]; // HPP debit
        const hppCreditLine = previewLines[3]; // Inventory credit

        const { data, error } = await supabase.from("journal_entries").insert({
          journal_ref: journalRef,
          debit_account: hppDebitLine.account_code,
          credit_account: hppCreditLine.account_code,
          debit: hppDebitLine.amount,
          credit: hppCreditLine.amount,
          description: `HPP - ${previewMemo}`,
          tanggal: previewTanggal,
          kategori,
          jenis_transaksi: jenisTransaksi,
        });

        if (error) {
          console.error("HPP Entry Error:", error);
          throw new Error(`HPP Entry: ${error.message}`);
        }
        console.log("HPP Entry saved:", data);
      }

      // Step 8: Upload bukti file ONCE if exists
      let uploadedBuktiUrl = "";
      console.log("🔍 DEBUG - buktiFile state:", buktiFile);
      console.log("🔍 DEBUG - ocrFile state:", ocrFile);
      console.log("🔍 DEBUG - ocrAppliedData state:", ocrAppliedData);
      
      // Use ocrFile as fallback if buktiFile is not set
      const fileToUpload = buktiFile || ocrFile;
      console.log("📁 DEBUG - fileToUpload:", fileToUpload);

      if (fileToUpload) {
        console.log("🔍 DEBUG - Starting file upload...", {
          name: fileToUpload.name,
          size: fileToUpload.size,
        });

        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `bukti-transaksi/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, fileToUpload);

        if (uploadError) {
          console.error("File Upload Error:", uploadError);
          throw new Error(`File Upload: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        uploadedBuktiUrl = urlData.publicUrl;
        console.log("File uploaded successfully:", uploadedBuktiUrl);
      } else {
        console.log("⚠️ No buktiFile or ocrFile found - skipping upload");
      }

      // Step 9: Create Cash Book if needed (Penerimaan/Pengeluaran Kas)
      if (
        jenisTransaksi === "Penerimaan Kas" ||
        jenisTransaksi === "Pengeluaran Kas"
      ) {
        const cashLine = previewLines.find(
          (l) => l.account_code.startsWith("1-11"), // Cash/Bank accounts
        );

        if (cashLine) {
          // Generate document number
          const docNumber = `${jenisTransaksi === "Penerimaan Kas" ? "PKM" : "PKK"}-${Date.now()}`;

          const { data, error } = await supabase.from("kas_transaksi").insert({
            tanggal: previewTanggal,
            document_number: docNumber,
            payment_type: jenisTransaksi, // "Penerimaan Kas" or "Pengeluaran Kas"
            account_number: cashLine.account_code,
            account_name: cashLine.account_name,
            nominal: parseFloat(String(cashLine.amount)),
            keterangan: previewMemo,
            description: previewMemo,
            notes: previewMemo,
            bukti: uploadedBuktiUrl || null,
            ocr_data: ocrAppliedData ? {
              extractedText: ocrAppliedData.extractedText,
              items: ocrAppliedData.items,
              appliedFields: ocrAppliedData.appliedFields,
            } : null,
          } as any);

          if (error) {
            console.error("Cash Book Error:", error);
            throw new Error(`Cash Book: ${error.message}`);
          }
          console.log("Cash Book saved:", data);
        }
      }

      // Step 10: ROUTER - Route transaction to appropriate table
      await routeTransaction(journalRef, uploadedBuktiUrl);

      toast({
        title: "✅ Berhasil",
        description: `Transaksi berhasil disimpan. Ref: ${journalRef}`,
      });

      // Reset form and close modal
      resetForm();
      setPreviewOpen(false);

      // Always refresh transactions list to show new data
      await loadTransactions();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const resetForm = () => {
    setJenisTransaksi("");
    setPaymentType("");
    setKategori("");
    setJenisLayanan("");
    setItemName("");
    setDescription("");
    setCustomer("");
    setSupplier("");
    setNominal("");
    setQuantity("1");
    setHargaJual("");
    setHargaBeli("");
    setPpnPercentage("11");
    setPpnAmount("0");
    setTanggal(new Date().toISOString().split("T")[0]);
    setDescription("");
    setCoaSelected("");
    setSumberPenerimaan("");
    setKasSumber("");
    setKasTujuan("");
    setKategoriPengeluaran("");
    setConsignee("");
    setSelectedBank("");
    setSelectedKas("");
    setStockInfo(null);
    setJenisPembayaranPengeluaran("Cash");
    setNamaKaryawanPengeluaran("");
    setBuktiFile(null);
    setBuktiUrl("");
    setOcrAppliedData(null);
    setOcrFile(null);
    setOcrFilePreview(null);
    setOcrExtractedText("");
    setOcrParsedData(null);
  };

  // Add to cart function
  const handleAddToCart = () => {
    // Validate required fields
    if (!jenisTransaksi) {
      toast({
        title: "⚠️ Peringatan",
        description: "Pilih jenis transaksi terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!nominal || Number(nominal) <= 0) {
      toast({
        title: "⚠️ Peringatan",
        description: "Masukkan nominal yang valid",
        variant: "destructive",
      });
      return;
    }

    // Validate employee selection for Beban Gaji
    if (selectedAccountName === "Beban Gaji & Karyawan" && !selectedEmployee) {
      toast({
        title: "⚠️ Peringatan",
        description: "Pilih nama karyawan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Validate Pengeluaran Kas fields
    if (jenisTransaksi === "Pengeluaran Kas") {
      if (!jenisPembayaranPengeluaran) {
        toast({
          title: "⚠️ Peringatan",
          description: "Pilih jenis pembayaran terlebih dahulu",
          variant: "destructive",
        });
        return;
      }
      if (!namaKaryawanPengeluaran.trim()) {
        toast({
          title: "⚠️ Peringatan",
          description: "Masukkan nama karyawan terlebih dahulu",
          variant: "destructive",
        });
        return;
      }
    }

    // Get employee name if selected
    const employeeName = selectedEmployee
      ? employees.find((emp) => emp.id === selectedEmployee)?.full_name
      : "";

    // Create cart item
    const cartItem = {
      id: Date.now().toString(),
      jenisTransaksi,
      paymentType,
      kategori,
      jenisLayanan,
      itemName,
      description,
      customer,
      supplier,
      consignee,
      nominal,
      quantity,
      hargaJual,
      hargaBeli,
      ppnPercentage,
      ppnAmount,
      tanggal,
      description,
      coaSelected,
      sumberPenerimaan,
      kasSumber,
      kasTujuan,
      kategoriPengeluaran,
      selectedBank,
      selectedKas,
      stockInfo,
      selectedAccountType,
      selectedAccountName,
      employeeId: selectedEmployee,
      employeeName,
      // Pengeluaran Kas fields
      jenisPembayaranPengeluaran,
      namaKaryawanPengeluaran,
      // Loan fields
      borrowerName: selectedBorrower,
      loanType,
      interestRate,
      loanTermMonths,
      maturityDate,
      paymentSchedule,
      principalAmount,
      interestAmount,
      lateFee,
      lateFeePercentage,
      daysLate,
      actualPaymentDate,
      installmentSchedule,
      taxAmount,
      taxPercentage,
      taxType,
      // Bukti file
      buktiFile: buktiFile, // Store the file object in cart
      // Checkbox selection
      selected: true,
    };

    setCart([...cart, cartItem]);

    toast({
      title: "✅ Berhasil",
      description: "Transaksi ditambahkan ke keranjang",
    });

    // Reset form but keep date
    const currentDate = tanggal;
    resetForm();
    setTanggal(currentDate);
  };

  // Remove from cart
  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
    toast({
      title: "✅ Berhasil",
      description: "Transaksi dihapus dari keranjang",
    });
  };

  // Checkout all items in cart
  const handleCheckoutCart = async () => {
    const selectedItems = cart.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      toast({
        title: "⚠️ Peringatan",
        description: "Pilih minimal satu transaksi untuk di-checkout",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      for (const item of selectedItems) {
        // Upload bukti file if exists (for all transaction types)
        let uploadedBuktiUrl = "";
        console.log("🔍 DEBUG Checkout - item.buktiFile:", item.buktiFile);

        if (item.buktiFile) {
          console.log("🔍 DEBUG Checkout - Starting file upload...", {
            name: item.buktiFile.name,
            size: item.buktiFile.size,
          });

          const fileExt = item.buktiFile.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `bukti-transaksi/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePath, item.buktiFile);

          if (uploadError) {
            console.error("Upload error:", uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from("documents")
              .getPublicUrl(filePath);
            uploadedBuktiUrl = urlData.publicUrl;
            console.log("Bukti file uploaded:", uploadedBuktiUrl);
          }
        } else {
          console.log("⚠️ No buktiFile found in cart item - skipping upload");
        }

        // Check if this transaction needs approval
        const needsApproval =
          item.jenisTransaksi === "Pembelian Barang" ||
          item.jenisTransaksi === "Pembelian Jasa" ||
          item.jenisTransaksi === "Pengeluaran Kas";

        // Step 1: Normalize Input
        const normalizedInput = normalizeInput({
          jenisTransaksi: item.jenisTransaksi,
          paymentType: item.paymentType,
          nominal: item.nominal,
          tanggal: item.tanggal,
          deskripsi: item.description,
          sumberPenerimaan: item.sumberPenerimaan,
          kategoriPengeluaran: item.kategoriPengeluaran,
          kasTujuan: item.kasTujuan,
          kasSumber: item.kasSumber,
        });

        // Step 2: Run Financial Engine
        const result = await runFinancialEngine(normalizedInput);

        // Step 3: Build Journal Lines
        const journalData = buildJournalLines(
          { account_code: result.debit, account_name: result.debitName },
          { account_code: result.credit, account_name: result.creditName },
          normalizedInput.nominal,
          normalizedInput.deskripsi,
          normalizedInput.tanggal,
          result.hpp_entry,
          normalizedInput.nominal * 0.7, // HPP amount (70% of sales as example)
        );

        const journalRef = `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Step 4: Create Journal Entries (skip if needs approval)
        const mainDebitLine = journalData.lines.find((l) => l.dc === "D");
        const mainCreditLine = journalData.lines.find((l) => l.dc === "C");

        if (!needsApproval && mainDebitLine && mainCreditLine) {
          const { error } = await supabase.from("journal_entries").insert({
            journal_ref: journalRef,
            debit_account: mainDebitLine.account_code,
            credit_account: mainCreditLine.account_code,
            debit: mainDebitLine.amount,
            credit: mainCreditLine.amount,
            description: journalData.memo,
            tanggal: journalData.tanggal,
            kategori: item.kategori,
            jenis_transaksi: item.jenisTransaksi,
          });

          if (error) throw new Error(`Journal Entry: ${error.message}`);
        }

        // Step 5: Save HPP entry if exists (for Penjualan Barang) - skip if needs approval
        if (!needsApproval && journalData.lines.length > 2) {
          const hppDebitLine = journalData.lines[2];
          const hppCreditLine = journalData.lines[3];

          const { error } = await supabase.from("journal_entries").insert({
            journal_ref: journalRef,
            debit_account: hppDebitLine.account_code,
            credit_account: hppCreditLine.account_code,
            debit: hppDebitLine.amount,
            credit: hppCreditLine.amount,
            description: `HPP - ${journalData.memo}`,
            tanggal: journalData.tanggal,
            kategori: item.kategori,
            jenis_transaksi: item.jenisTransaksi,
          });

          if (error) throw new Error(`HPP Entry: ${error.message}`);
        }

        // Step 6: Create Cash Book if needed - skip if needs approval
        if (!needsApproval && result.is_cash_related) {
          const cashLine = journalData.lines.find((l) =>
            l.account_code.startsWith("1-11"),
          );

          if (cashLine) {
            await supabase.from("kas_transaksi").insert({
              payment_type: item.paymentType,
              service_category: item.kategori,
              service_type: item.jenisLayanan,
              account_number: cashLine.account_code,
              nominal: parseFloat(String(cashLine.amount)),
              tanggal: journalData.tanggal,
              keterangan: journalData.memo,
              description: journalData.memo,
              notes: journalData.memo,
              source:
                item.jenisTransaksi === "Pembelian Jasa"
                  ? "Service Purchase"
                  : null,
              bukti: uploadedBuktiUrl || null, // Add bukti URL
              ocr_data: ocrAppliedData ? {
                extractedText: ocrAppliedData.extractedText,
                items: ocrAppliedData.items,
                appliedFields: ocrAppliedData.appliedFields,
              } : null,
            } as any);
          }
        }

        // Step 6b: If Pengeluaran Kas, save to cash_disbursement table
        if (item.jenisTransaksi === "Pengeluaran Kas") {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          const expenseLine = journalData.lines.find((l) => l.dc === "D");
          const cashLine = journalData.lines.find((l) => l.dc === "C");

          const { error: cashDisbursementError } = await supabase
            .from("cash_disbursement")
            .insert({
              transaction_date: journalData.tanggal,
              payee_name:
                item.namaKaryawanPengeluaran ||
                item.supplier ||
                item.customer ||
                "Pengeluaran Kas",
              description: journalData.memo,
              category: item.kategori,
              amount: normalizedInput.nominal,
              payment_method:
                item.jenisPembayaranPengeluaran === "Cash"
                  ? "Tunai"
                  : item.paymentType === "cash"
                    ? "Tunai"
                    : "Transfer Bank",
              coa_expense_code: expenseLine?.account_code || "6-1100",
              coa_cash_code: cashLine?.account_code || "1-1100",
              notes: item.description,
              created_by: user?.id,
              approval_status: "waiting_approval",
              bukti: uploadedBuktiUrl || null,
              ocr_data: ocrAppliedData ? {
                extractedText: ocrAppliedData.extractedText,
                items: ocrAppliedData.items,
                appliedFields: ocrAppliedData.appliedFields,
              } : null,
            });

          if (cashDisbursementError) {
            console.error(
              "❌ Error saving to cash_disbursement:",
              cashDisbursementError,
            );
            throw new Error(
              `Cash Disbursement: ${cashDisbursementError.message}`,
            );
          } else {
            console.log(
              "✅ Cash disbursement saved successfully - waiting for approval",
            );
          }
        }

        // Step 6c: If Penerimaan Kas, save to cash_and_bank_receipts table
        if (item.jenisTransaksi === "Penerimaan Kas") {
          const debitLine = journalData.lines.find((l) => l.dc === "D");
          const creditLine = journalData.lines.find((l) => l.dc === "C");

          console.log(
            "🔍 DEBUG Checkout - uploadedBuktiUrl before insert:",
            uploadedBuktiUrl,
          );

          const { error: cashReceiptError } = await supabase
            .from("cash_and_bank_receipts")
            .insert({
              transaction_date: journalData.tanggal,
              transaction_type: "Penerimaan",
              category: item.kategori || item.sumberPenerimaan,
              source_destination:
                item.sumberPenerimaan ||
                item.customer ||
                item.supplier ||
                "Penerimaan Kas",
              amount: normalizedInput.nominal,
              payment_method: item.paymentType === "cash" ? "Tunai" : "Bank",
              coa_cash_code: debitLine?.account_code || "1-1100",
              coa_contra_code: creditLine?.account_code || "4-1100",
              description: journalData.memo,
              reference_number: `PKM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              journal_ref: journalRef,
              approval_status: "approved", // Penerimaan Kas langsung Approved tanpa perlu approval
              bukti: uploadedBuktiUrl || null, // URL bukti file from earlier upload
              ocr_data: ocrAppliedData ? {
                extractedText: ocrAppliedData.extractedText,
                items: ocrAppliedData.items,
                appliedFields: ocrAppliedData.appliedFields,
              } : null,
            });

          if (cashReceiptError) {
            console.error(
              "Error saving to cash_and_bank_receipts:",
              cashReceiptError,
            );
            throw new Error(`Cash Receipt: ${cashReceiptError.message}`);
          } else {
            console.log("Cash and bank receipt saved successfully");
          }
        }

        // Step 7: Create Sales Transaction if applicable
        if (
          item.jenisTransaksi === "Penjualan Barang" ||
          item.jenisTransaksi === "Penjualan Jasa"
        ) {
          const unitPrice = Number(item.hargaJual || item.nominal) || 0;
          const quantity = Number(item.quantity) || 1;
          const subtotal = unitPrice * quantity;
          const taxPercentage = 11;
          const taxAmount = subtotal * (taxPercentage / 100);
          const totalAmount = subtotal + taxAmount;

          if (item.jenisTransaksi === "Penjualan Barang") {
            const { data: stockData } = await supabase
              .from("stock")
              .select("quantity, cost_per_unit")
              .eq("item_name", item.itemName)
              .eq("description", item.description)
              .maybeSingle();

            await supabase.from("sales_transactions").insert({
              transaction_date: item.tanggal,
              transaction_type: "Barang",
              item_name: item.itemName,
              description: item.description,
              stock_before: stockData?.quantity || 0,
              quantity: quantity,
              stock_after: (stockData?.quantity || 0) - quantity,
              unit_price: unitPrice,
              subtotal: subtotal,
              tax_percentage: taxPercentage,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              payment_method: item.paymentType === "cash" ? "Tunai" : "Piutang",
              customer_name: item.customer || "",
              coa_cash_code: item.paymentType === "cash" ? "1-1100" : "1-1200",
              coa_revenue_code: mainCreditLine?.account_code || "",
              coa_cogs_code: "5-1100",
              coa_inventory_code: item.coaSelected || "",
              coa_tax_code: taxAmount > 0 ? "2-1250" : null,
              notes: item.description,
              journal_ref: journalRef,
              approval_status: "approved", // Set approval status to approved
              bukti: uploadedBuktiUrl || null, // Add bukti URL
              ocr_data: ocrAppliedData ? {
                extractedText: ocrAppliedData.extractedText,
                items: ocrAppliedData.items,
                appliedFields: ocrAppliedData.appliedFields,
              } : null,
            });

            // Stock quantity is automatically updated by database trigger
          } else if (item.jenisTransaksi === "Penjualan Jasa") {
            await supabase.from("sales_transactions").insert({
              transaction_date: item.tanggal,
              transaction_type: "Jasa",
              item_name: `${item.kategori} - ${item.jenisLayanan}`,
              description: item.description,
              stock_before: null,
              quantity: quantity,
              stock_after: null,
              unit_price: unitPrice,
              subtotal: subtotal,
              tax_percentage: taxPercentage,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              payment_method: item.paymentType === "cash" ? "Tunai" : "Piutang",
              customer_name: item.customer || "",
              coa_cash_code: item.paymentType === "cash" ? "1-1100" : "1-1200",
              coa_revenue_code: mainCreditLine?.account_code || "",
              coa_cogs_code: null,
              coa_inventory_code: null,
              coa_tax_code: taxAmount > 0 ? "2-1250" : null,
              notes: item.description,
              journal_ref: journalRef,
              approval_status: "approved", // Set approval status to approved
              bukti: uploadedBuktiUrl || null, // Add bukti URL
              ocr_data: ocrAppliedData ? {
                extractedText: ocrAppliedData.extractedText,
                items: ocrAppliedData.items,
                appliedFields: ocrAppliedData.appliedFields,
              } : null,
            });
          }
        }

        // Step 8: Create Loan if applicable
        if (item.jenisTransaksi === "Pinjaman Masuk") {
          console.log("💰 Creating loan entry...");

          // Get borrower_id from borrower name
          let borrowerId = null;
          if (item.borrowerName) {
            const { data: borrowerData, error: borrowerError } = await supabase
              .from("borrowers")
              .select("id")
              .eq("borrower_name", item.borrowerName)
              .single();

            if (borrowerError) {
              console.error("Error fetching borrower:", borrowerError);
            } else {
              borrowerId = borrowerData?.id;
              console.log("Borrower ID found:", borrowerId);
            }
          }

          const loanData = {
            loan_date: item.tanggal,
            borrower_id: borrowerId,
            lender_name:
              item.borrowerName || item.supplier || item.customer || "Unknown",
            lender_type: item.loanType || "Lainnya",
            principal_amount: Number(item.nominal),
            interest_rate: Number(item.interestRate) || 0,
            loan_term_months: Number(item.loanTermMonths) || 12,
            maturity_date: item.maturityDate || null,
            payment_schedule: item.paymentSchedule || "Jatuh Tempo",
            late_fee_percentage: Number(item.lateFeePercentage) || 0.1,
            tax_type: item.taxType || null,
            tax_percentage: Number(item.taxPercentage) || 0,
            tax_amount: Number(item.taxAmount) || 0,
            status: "Aktif",
            coa_cash_code: mainDebitLine?.account_code || "1-1100",
            coa_loan_code: mainCreditLine?.account_code || "2-2000",
            coa_interest_code: "6-1200",
            purpose: item.description || "Pinjaman",
            notes: item.description,
            journal_ref: journalRef,
          };

          console.log("📝 Loan data to insert:", loanData);

          const { data: loanResult, error: loanError } = await supabase
            .from("loans")
            .insert(loanData)
            .select();

          if (loanError) {
            console.error("Error creating loan:", loanError);
            throw new Error(`Failed to create loan: ${loanError.message}`);
          } else {
            console.log("Loan created successfully:", loanResult);

            // Create installment schedule if available
            if (
              item.installmentSchedule &&
              item.installmentSchedule.length > 0 &&
              loanResult[0]
            ) {
              const installments = item.installmentSchedule.map(
                (inst: any) => ({
                  loan_id: loanResult[0].id,
                  installment_number: inst.installment,
                  due_date: inst.dueDate,
                  principal_amount: inst.principalAmount,
                  interest_amount: inst.interestAmount,
                  total_amount: inst.totalPayment,
                  remaining_balance: inst.remainingBalance,
                  late_fee_percentage: Number(item.lateFeePercentage) || 0.1,
                  tax_type: item.taxType || null,
                  tax_percentage: Number(item.taxPercentage) || 0,
                  tax_amount: Number(item.taxAmount) || 0,
                  status: "Belum Bayar",
                }),
              );

              const { error: installmentError } = await supabase
                .from("loan_installments")
                .insert(installments);

              if (installmentError) {
                console.error(
                  "❌ Error creating installments:",
                  installmentError,
                );
              } else {
                console.log("Installments created successfully");
              }
            }
          }
        }

        // Step 8b: Process Loan Payment if applicable
        if (item.jenisTransaksi === "Pembayaran Pinjaman") {
          // Get active loans to find the loan being paid
          const { data: activeLoans } = await supabase
            .from("loans")
            .select("*")
            .eq("status", "Aktif")
            .order("loan_date", { ascending: true });

          if (activeLoans && activeLoans.length > 0) {
            // Use the first active loan or match by borrower name if available
            let targetLoan = activeLoans[0];
            if (item.borrowerName) {
              const matchedLoan = activeLoans.find(
                (l) => l.lender_name === item.borrowerName,
              );
              if (matchedLoan) targetLoan = matchedLoan;
            }

            // Call the add_loan_payment function
            const principalPmt = Number(item.principalAmount) || 0;
            const interestPmt = Number(item.interestAmount) || 0;
            const lateFeePmt = Number(item.lateFee) || 0;
            const daysLateNum = Number(item.daysLate) || 0;
            const lateFeePerc = Number(item.lateFeePercentage) || 0.1;

            const { error: paymentError } = await supabase.rpc(
              "add_loan_payment",
              {
                p_loan_id: targetLoan.id,
                p_payment_date: item.actualPaymentDate || item.tanggal,
                p_principal_amount: principalPmt,
                p_interest_amount: interestPmt + lateFeePmt, // Include late fee in interest
                p_payment_method:
                  item.paymentType === "cash" ? "Tunai" : "Bank",
                p_bank_name: item.selectedBank || null,
                p_reference_number: journalRef,
                p_notes: item.description || null,
              },
            );

            if (paymentError) {
              console.error("Error adding loan payment:", paymentError);
            } else {
              // Update loan installment status - handle overpayment
              const { data: unpaidInstallments } = await supabase
                .from("loan_installments")
                .select("*")
                .eq("loan_id", targetLoan.id)
                .eq("status", "Belum Bayar")
                .order("installment_number", { ascending: true });

              if (unpaidInstallments && unpaidInstallments.length > 0) {
                // Use the nominal amount entered by user (not just principal + interest)
                let totalPaymentAmount =
                  Number(item.nominal) ||
                  principalPmt +
                    interestPmt +
                    lateFeePmt +
                    Number(item.taxAmount);
                let remainingPayment = totalPaymentAmount;

                console.log("💰 Processing payment:", {
                  totalPaymentAmount,
                  unpaidInstallmentsCount: unpaidInstallments.length,
                  firstInstallment: unpaidInstallments[0],
                });

                // Process each unpaid installment
                for (const installment of unpaidInstallments) {
                  if (remainingPayment <= 0) break;

                  const installmentTotal = installment.total_amount;
                  const currentPaidAmount = installment.paid_amount || 0;
                  const remainingInstallmentAmount =
                    installmentTotal - currentPaidAmount;

                  console.log(`📋 Cicilan ${installment.installment_number}:`, {
                    total: installmentTotal,
                    alreadyPaid: currentPaidAmount,
                    remaining: remainingInstallmentAmount,
                    paymentAvailable: remainingPayment,
                  });

                  if (remainingPayment >= remainingInstallmentAmount) {
                    // Full payment for this installment
                    const newPaidAmount =
                      currentPaidAmount + remainingInstallmentAmount;

                    await supabase
                      .from("loan_installments")
                      .update({
                        actual_payment_date:
                          item.actualPaymentDate || item.tanggal,
                        days_late: daysLateNum,
                        late_fee:
                          installment.installment_number ===
                          unpaidInstallments[0].installment_number
                            ? lateFeePmt
                            : 0,
                        late_fee_percentage: lateFeePerc,
                        tax_type: item.taxType || null,
                        tax_percentage: Number(item.taxPercentage) || 0,
                        tax_amount:
                          installment.installment_number ===
                          unpaidInstallments[0].installment_number
                            ? Number(item.taxAmount)
                            : 0,
                        paid_amount: newPaidAmount,
                        payment_date: item.actualPaymentDate || item.tanggal,
                        status: "Lunas",
                      })
                      .eq("id", installment.id);

                    console.log(
                      `✅ Cicilan ${installment.installment_number} LUNAS - Terbayar: ${newPaidAmount}`,
                    );
                    remainingPayment -= remainingInstallmentAmount;
                  } else {
                    // Partial payment for this installment
                    const newPaidAmount = currentPaidAmount + remainingPayment;

                    await supabase
                      .from("loan_installments")
                      .update({
                        actual_payment_date:
                          item.actualPaymentDate || item.tanggal,
                        days_late: daysLateNum,
                        late_fee:
                          installment.installment_number ===
                          unpaidInstallments[0].installment_number
                            ? lateFeePmt
                            : 0,
                        late_fee_percentage: lateFeePerc,
                        tax_type: item.taxType || null,
                        tax_percentage: Number(item.taxPercentage) || 0,
                        tax_amount:
                          installment.installment_number ===
                          unpaidInstallments[0].installment_number
                            ? Number(item.taxAmount)
                            : 0,
                        paid_amount: newPaidAmount,
                        payment_date: item.actualPaymentDate || item.tanggal,
                        status: "Sebagian",
                      })
                      .eq("id", installment.id);

                    console.log(
                      `🔵 Cicilan ${installment.installment_number} SEBAGIAN - Terbayar: ${newPaidAmount}`,
                    );
                    remainingPayment = 0;
                  }
                }

                console.log(
                  "✅ Payment processing complete. Remaining:",
                  remainingPayment,
                );
              }

              // Check if all installments are paid, then update loan status
              const { data: allInstallments } = await supabase
                .from("loan_installments")
                .select("*")
                .eq("loan_id", targetLoan.id);

              if (allInstallments) {
                const allPaid = allInstallments.every(
                  (inst) => inst.status === "Lunas",
                );
                if (allPaid) {
                  await supabase
                    .from("loans")
                    .update({ status: "Lunas" })
                    .eq("id", targetLoan.id);
                }
              }
            }
          }
        }

        // Step 9: Create Purchase Transaction if applicable
        if (item.jenisTransaksi === "Pembelian Barang") {
          const unitPrice = Number(item.hargaBeli || item.nominal) || 0;
          const quantity = Number(item.quantity) || 1;
          const subtotal = unitPrice * quantity;
          const ppnPercentage = Number(item.ppnPercentage) || 0;
          const ppnAmount = Number(item.ppnAmount) || 0;
          const totalAmount = subtotal + ppnAmount;

          const purchaseData: any = {
            transaction_date: item.tanggal,
            transaction_type: "Barang",
            item_name:
              item.itemName || `${item.kategori} - ${item.jenisLayanan}`,
            brand: item.description || null,
            supplier_name: item.supplier || "",
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: subtotal,
            ppn_percentage: ppnPercentage,
            ppn_amount: ppnAmount,
            total_amount: totalAmount,
            payment_method: item.paymentType === "cash" ? "Tunai" : "Hutang",
            coa_cash_code:
              item.paymentType === "cash" && mainCreditLine?.account_code
                ? mainCreditLine.account_code
                : null,
            coa_expense_code: mainDebitLine?.account_code || null,
            coa_inventory_code: item.coaSelected || null,
            coa_payable_code:
              item.paymentType !== "cash" ? mainCreditLine?.account_code : null,
            description: item.description || null,
            notes: item.description || null,
            journal_ref: journalRef,
            approval_status: needsApproval ? "waiting_approval" : "approved",
            bukti: uploadedBuktiUrl || null,
            ocr_data: ocrAppliedData ? {
              extractedText: ocrAppliedData.extractedText,
              items: ocrAppliedData.items,
              appliedFields: ocrAppliedData.appliedFields,
            } : null,
          };

          console.log("📦 Purchase Transaction Data:", purchaseData);

          const { data: purchaseData_result, error: purchaseError } =
            await supabase.from("purchase_transactions").insert(purchaseData);

          if (purchaseError) {
            console.error("Purchase Transaction Error:", purchaseError);
            throw new Error(`Purchase Transaction: ${purchaseError.message}`);
          }
          console.log("Purchase Transaction saved:", purchaseData_result);
        }

        // Send Pembelian Jasa to purchase_transactions table
        if (item.jenisTransaksi === "Pembelian Jasa") {
          const unitPrice = Number(item.hargaBeli || item.nominal) || 0;
          const quantity = Number(item.quantity) || 1;
          const subtotal = unitPrice * quantity;
          const ppnPercentage = Number(item.ppnPercentage) || 0;
          const ppnAmount = Number(item.ppnAmount) || 0;
          const totalAmount = subtotal + ppnAmount;

          const purchaseData: any = {
            transaction_date: item.tanggal,
            transaction_type: "Jasa",
            item_name:
              item.itemName || `${item.kategori} - ${item.jenisLayanan}`,
            brand: item.description || null,
            supplier_name: item.supplier || "",
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: subtotal,
            ppn_percentage: ppnPercentage,
            ppn_amount: ppnAmount,
            total_amount: totalAmount,
            payment_method: item.paymentType === "cash" ? "Tunai" : "Hutang",
            coa_cash_code:
              item.paymentType === "cash" && mainCreditLine?.account_code
                ? mainCreditLine.account_code
                : null,
            coa_expense_code: mainDebitLine?.account_code || null,
            coa_inventory_code: item.coaSelected || null,
            coa_payable_code:
              item.paymentType !== "cash" ? mainCreditLine?.account_code : null,
            description: item.description || null,
            notes: item.description || null,
            journal_ref: journalRef,
            approval_status: needsApproval ? "waiting_approval" : "approved",
            bukti: uploadedBuktiUrl || null,
            ocr_data: ocrAppliedData ? {
              extractedText: ocrAppliedData.extractedText,
              items: ocrAppliedData.items,
              appliedFields: ocrAppliedData.appliedFields,
            } : null,
          };

          console.log("📦 Purchase Transaction Data (Jasa):", purchaseData);

          const { data: purchaseData_result, error: purchaseError } =
            await supabase.from("purchase_transactions").insert(purchaseData);

          if (purchaseError) {
            console.error("Purchase Transaction Error:", purchaseError);
            throw new Error(`Purchase Transaction: ${purchaseError.message}`);
          }
          console.log(
            "✅ Purchase Transaction saved (Jasa):",
            purchaseData_result,
          );
        }
      }

      toast({
        title: "✅ Berhasil",
        description: `${cart.length} transaksi berhasil disimpan`,
      });

      // Refresh loan data if payment was made
      const hasLoanPayment = cart.some(
        (item) => item.jenisTransaksi === "Pembayaran Pinjaman",
      );
      if (hasLoanPayment && selectedBorrower) {
        // Reload loan details
        const { data: loans } = await supabase
          .from("loans")
          .select("*")
          .eq("lender_name", selectedBorrower)
          .eq("status", "Aktif")
          .order("loan_date", { ascending: false })
          .limit(1);

        if (loans && loans.length > 0) {
          const loan = loans[0];

          // Reload installment schedule
          const { data: installments } = await supabase
            .from("loan_installments")
            .select("*")
            .eq("loan_id", loan.id)
            .order("installment_number", { ascending: true });

          if (installments && installments.length > 0) {
            const schedule = installments.map((inst) => ({
              installment: inst.installment_number,
              dueDate: inst.due_date,
              principalAmount: inst.principal_amount,
              interestAmount: inst.interest_amount,
              totalPayment: inst.total_amount,
              remainingBalance: inst.remaining_balance,
              status: inst.status,
              paidAmount: inst.paid_amount || 0,
            }));
            setInstallmentSchedule(schedule);
          }
        }
      }

      // Remove only checked items from cart
      const remainingItems = cart.filter((item) => !item.selected);
      setCart(remainingItems);
      localStorage.setItem(
        "transaksi_keuangan_cart",
        JSON.stringify(remainingItems),
      );

      if (remainingItems.length === 0) {
        setShowCart(false);
      }

      // Show success message
      toast({
        title: "✅ Berhasil",
        description: "Transaksi berhasil disimpan",
      });

      // Reload transactions to show new data
      await loadTransactions();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Calculate summary data from approved transactions only
  const summaryData = {
    totalTransactions: transactions.length,
    totalPenerimaan: transactions
      .filter((t) => {
        // Only count approved transactions
        if (t.approval_status !== "approved") return false;

        // Income from Penjualan Jasa
        if (t.source === "sales_transactions" && t.transaction_type === "Jasa")
          return true;
        // Income from Penjualan Barang
        if (
          t.source === "sales_transactions" &&
          t.transaction_type === "Barang"
        )
          return true;
        // Income from Penerimaan Cash & Bank
        if (t.source === "cash_receipts") return true;

        return false;
      })
      .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0),
    totalPengeluaran: transactions
      .filter((t) => {
        // Only count approved transactions
        if (t.approval_status !== "approved") return false;

        // Expenses from kas_transaksi
        if (
          t.source === "kas_transaksi" &&
          t.payment_type === "Pengeluaran Kas"
        )
          return true;
        // Expenses from purchases
        if (t.source === "purchase_transactions") return true;
        // Expenses from internal usage
        if (t.source === "internal_usage") return true;
        // Expenses from expenses table
        if (t.source === "expenses") return true;
        // Expenses from cash_disbursement (approved only)
        if (t.source === "cash_disbursement") return true;
        return false;
      })
      .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0),
    waitingApproval: transactions.filter(
      (t) => t.approval_status === "waiting_approval",
    ).length,
  };

  const netAmount = summaryData.totalPenerimaan - summaryData.totalPengeluaran;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2 bg-white/20 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Transaksi Keuangan
              </h1>
              <p className="text-sm text-blue-100">
                Pencatatan Penerimaan dan Pengeluaran Kas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {showForm && (
              <>
                <OCRScanButton
                  onImageUploaded={(url, filePath) => {
                    toast({
                      title: "Gambar berhasil diupload",
                      description: `File: ${filePath}`,
                    });
                  }}
                />
                <BarcodeScanButton
                  onBarcodeScanned={(code, format) => {
                    toast({
                      title: "Barcode berhasil discan",
                      description: `Format: ${format}`,
                    });
                  }}
                  onAutofill={(data) => {
                    if (data.is_qris && data.qris_nominal) {
                      setNominal(data.qris_nominal.toString());
                      if (data.qris_merchant) {
                        setDescription(`Pembayaran QRIS - ${data.qris_merchant}`);
                      }
                    } else if (data.product_name) {
                      setDescription(data.product_name);
                      if (data.supplier) {
                        setSupplier(data.supplier);
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowCart(!showCart)}
                  className="relative bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  🛒 Keranjang
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setShowReport(true);
                    resetForm();
                  }}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  ← Kembali ke Laporan
                </Button>
              </>
            )}
            {showReport && !showForm && (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setShowReport(false);
                }}
                className="bg-white text-indigo-600 hover:bg-blue-50 shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Transaksi
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* REPORT VIEW */}
        {showReport && !showForm && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card
                className="border-none shadow-lg bg-blue-400/90 text-white hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setFilterJenis("");
                  setFilterStatus("");
                  setFilterSource("");
                  setSearchQuery("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-white/90">
                      Total Transaksi
                    </CardDescription>
                    <Receipt className="h-8 w-8 text-white/80" />
                  </div>
                  <CardTitle className="text-4xl font-bold">
                    {summaryData.totalTransactions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/90">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Total transaksi kas
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-none shadow-lg bg-emerald-400/90 text-white hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setFilterJenis("Penerimaan Kas");
                  setFilterStatus("");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-white/90">
                      Total Penerimaan
                    </CardDescription>
                    <TrendingUp className="h-8 w-8 text-white/80" />
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {
                      formatCurrency(summaryData.totalPenerimaan)
                        .replace("Rp", "")
                        .trim()
                        .split(",")[0]
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/90">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Kas masuk
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-none shadow-lg bg-pink-400/90 text-white hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setFilterJenis("Pengeluaran Kas");
                  setFilterStatus("");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-white/90">
                      Total Pengeluaran
                    </CardDescription>
                    <TrendingDown className="h-8 w-8 text-white/80" />
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {
                      formatCurrency(summaryData.totalPengeluaran)
                        .replace("Rp", "")
                        .trim()
                        .split(",")[0]
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/90">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Kas keluar
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`border-none shadow-lg text-white hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform ${
                  netAmount >= 0 ? "bg-purple-400/90" : "bg-red-400/90"
                }`}
                onClick={() => {
                  setFilterJenis("");
                  setFilterStatus("");
                  setFilterSource("");
                  setSearchQuery("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-white/90">
                      Net
                    </CardDescription>
                    <DollarSign className="h-8 w-8 text-white/80" />
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {
                      formatCurrency(netAmount)
                        .replace("Rp", "")
                        .trim()
                        .split(",")[0]
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/90">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Saldo bersih
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-none shadow-lg bg-amber-400/90 text-white hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setFilterStatus("waiting_approval");
                  setFilterJenis("");
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-white/90">
                      Waiting Approval
                    </CardDescription>
                    <Clock className="h-8 w-8 text-white/80" />
                  </div>
                  <CardTitle className="text-4xl font-bold">
                    {summaryData.waitingApproval}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/90">
                    <Clock className="mr-2 h-4 w-4" />
                    Menunggu persetujuan
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Filter className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>Filter & Pencarian</span>
                  </div>

                  {/* Date Range Filter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="filterDateFrom"
                        className="text-sm font-medium text-slate-700"
                      >
                        Dari Tanggal
                      </Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="filterDateFrom"
                          type="date"
                          className="pl-10"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="filterDateTo"
                        className="text-sm font-medium text-slate-700"
                      >
                        Sampai Tanggal
                      </Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="filterDateTo"
                          type="date"
                          className="pl-10"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan no. dokumen, jenis, akun, atau keterangan..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Additional Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="filterJenis"
                        className="text-sm font-medium text-slate-700"
                      >
                        Jenis Transaksi
                      </Label>
                      <select
                        id="filterJenis"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value)}
                      >
                        <option value="">Semua Jenis</option>
                        <option value="Penerimaan Kas">Penerimaan Kas</option>
                        <option value="Pengeluaran Kas">Pengeluaran Kas</option>
                        <option value="Penjualan">Penjualan</option>
                        <option value="Penjualan Jasa">Penjualan Jasa</option>
                        <option value="Pembelian">Pembelian</option>
                        <option value="Pembelian Jasa">Pembelian Jasa</option>
                        <option value="Pinjaman">Pinjaman</option>
                        <option value="Pemakaian Internal">
                          Pemakaian Internal
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="filterSource"
                        className="text-sm font-medium text-slate-700"
                      >
                        Source
                      </Label>
                      <select
                        id="filterSource"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                      >
                        <option value="">Semua Source</option>
                        <option value="kas_transaksi">KAS_TRANSAKSI</option>
                        <option value="cash_disbursement">
                          CASH_DISBURSEMENT
                        </option>
                        <option value="cash_and_bank_receipts">
                          CASH_AND_BANK_RECEIPTS
                        </option>
                        <option value="purchase_transactions">
                          PURCHASE_TRANSACTIONS
                        </option>
                        <option value="sales_transactions">
                          SALES_TRANSACTIONS
                        </option>
                        <option value="internal_usage">INTERNAL_USAGE</option>
                        <option value="approval_transaksi">
                          APPROVAL_TRANSAKSI
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="filterStatus"
                        className="text-sm font-medium text-slate-700"
                      >
                        Status
                      </Label>
                      <select
                        id="filterStatus"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">Semua Status</option>
                        <option value="approved">Approved</option>
                        <option value="waiting_approval">
                          Waiting Approval
                        </option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(filterDateFrom ||
                    filterDateTo ||
                    searchQuery ||
                    filterJenis ||
                    filterSource ||
                    filterStatus) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterDateFrom("");
                        setFilterDateTo("");
                        setSearchQuery("");
                        setFilterJenis("");
                        setFilterSource("");
                        setFilterStatus("");
                      }}
                      className="w-full md:w-auto"
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold w-16">No</TableHead>
                      <TableHead className="font-semibold">Tanggal</TableHead>
                      <TableHead className="font-semibold">
                        No. Dokumen
                      </TableHead>
                      <TableHead className="font-semibold">Jenis</TableHead>
                      <TableHead className="font-semibold">Source</TableHead>
                      <TableHead className="font-semibold">
                        Keterangan
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">
                        Informasi
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        OCR Data
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Bukti
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Nominal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTransactions ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center text-gray-500 py-8"
                        >
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center text-gray-500 py-8"
                        >
                          Belum ada transaksi. Klik "Tambah Transaksi" untuk
                          memulai.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions
                        .filter((t) => {
                          // Date range filter
                          if (filterDateFrom || filterDateTo) {
                            const transactionDate = new Date(t.tanggal);
                            if (filterDateFrom) {
                              const fromDate = new Date(filterDateFrom);
                              if (transactionDate < fromDate) return false;
                            }
                            if (filterDateTo) {
                              const toDate = new Date(filterDateTo);
                              toDate.setHours(23, 59, 59, 999); // Include the entire end date
                              if (transactionDate > toDate) return false;
                            }
                          }

                          // Jenis filter
                          if (filterJenis) {
                            const jenis =
                              t.payment_type ||
                              t.jenis ||
                              t.transaction_type ||
                              t.expense_type ||
                              "";
                            if (
                              !jenis
                                .toLowerCase()
                                .includes(filterJenis.toLowerCase())
                            )
                              return false;
                          }

                          // Source filter
                          if (filterSource) {
                            if (t.source !== filterSource) return false;
                          }

                          // Status filter
                          if (filterStatus) {
                            if (t.approval_status !== filterStatus)
                              return false;
                          }

                          // Search query filter
                          if (!searchQuery) return true;
                          const query = searchQuery.toLowerCase();
                          return (
                            t.payment_type?.toLowerCase().includes(query) ||
                            t.jenis?.toLowerCase().includes(query) ||
                            t.account_name?.toLowerCase().includes(query) ||
                            t.keterangan?.toLowerCase().includes(query) ||
                            t.description?.toLowerCase().includes(query) ||
                            t.notes?.toLowerCase().includes(query) ||
                            t.item_name?.toLowerCase().includes(query) ||
                            t.supplier_name?.toLowerCase().includes(query) ||
                            t.customer_name?.toLowerCase().includes(query) ||
                            t.lender_name?.toLowerCase().includes(query) ||
                            t.document_number?.toLowerCase().includes(query) ||
                            t.loan_number?.toLowerCase().includes(query) ||
                            t.source?.toLowerCase().includes(query)
                          );
                        })
                        .map((transaction, index) => {
                          // Determine display values based on source
                          let displayJenis =
                            transaction.jenis ||
                            transaction.payment_type ||
                            transaction.transaction_type ||
                            transaction.expense_type ||
                            "-";

                          // Add service category/type for Pengeluaran Kas if available
                          if (
                            transaction.payment_type === "Pengeluaran Kas" &&
                            transaction.service_category
                          ) {
                            displayJenis = `${transaction.payment_type} - ${transaction.service_category}`;
                            if (transaction.service_type) {
                              displayJenis += ` (${transaction.service_type})`;
                            }
                          }

                          const displayKeterangan =
                            transaction.keterangan ||
                            transaction.description ||
                            transaction.notes ||
                            transaction.item_name ||
                            "-";
                          const displayNominal =
                            transaction.nominal ||
                            transaction.total_amount ||
                            transaction.amount ||
                            transaction.total_value ||
                            0;
                          const displayDocNumber =
                            transaction.document_number ||
                            transaction.loan_number ||
                            transaction.journal_ref ||
                            transaction.id?.substring(0, 8) ||
                            "-";

                          // Determine if it's income or expense
                          const isIncome =
                            transaction.payment_type === "Penerimaan Kas" ||
                            transaction.source === "sales_transactions" ||
                            transaction.source === "cash_and_bank_receipts" ||
                            transaction.source === "loans" ||
                            displayJenis === "Penjualan";

                          return (
                            <TableRow
                              key={transaction.id}
                              className="hover:bg-slate-50"
                            >
                              <TableCell className="text-center font-medium text-gray-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  transaction.tanggal,
                                ).toLocaleDateString("id-ID")}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {displayDocNumber}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    isIncome
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {displayJenis}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {transaction.source ===
                                  "cash_and_bank_receipts"
                                    ? "CASH AND BANK RECEIPTS"
                                    : transaction.source
                                        ?.replace(/_/g, " ")
                                        .toUpperCase() || "KAS"}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {displayKeterangan}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    transaction.approval_status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : transaction.approval_status ===
                                          "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : transaction.approval_status ===
                                            "waiting_approval"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {transaction.approval_status === "approved"
                                    ? "✓ Approved"
                                    : transaction.approval_status === "rejected"
                                      ? "✗ Rejected"
                                      : transaction.approval_status ===
                                          "waiting_approval"
                                        ? "⏳ Waiting"
                                        : "-"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Detail Informasi Transaksi
                                      </DialogTitle>
                                      <DialogDescription>
                                        Informasi lengkap untuk transaksi{" "}
                                        {displayDocNumber}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {console.log("🔍 Transaction OCR Data:", transaction.ocr_data)}
                                    <div className="space-y-4 mt-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Tanggal
                                          </p>
                                          <p className="text-sm">
                                            {new Date(
                                              transaction.tanggal,
                                            ).toLocaleDateString("id-ID")}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            No. Dokumen
                                          </p>
                                          <p className="text-sm font-mono">
                                            {displayDocNumber}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Jenis Transaksi
                                          </p>
                                          <p className="text-sm">
                                            {displayJenis}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Source
                                          </p>
                                          <p className="text-sm">
                                            {transaction.source
                                              ?.replace(/_/g, " ")
                                              .toUpperCase() || "KAS"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Status
                                          </p>
                                          <p className="text-sm">
                                            {transaction.approval_status ===
                                            "approved"
                                              ? "✓ Approved"
                                              : transaction.approval_status ===
                                                  "rejected"
                                                ? "✗ Rejected"
                                                : transaction.approval_status ===
                                                    "waiting_approval"
                                                  ? "⏳ Waiting Approval"
                                                  : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Nominal
                                          </p>
                                          <p
                                            className={`text-sm font-medium ${isIncome ? "text-green-600" : "text-red-600"}`}
                                          >
                                            {isIncome ? "+" : "-"}Rp{" "}
                                            {new Intl.NumberFormat(
                                              "id-ID",
                                            ).format(displayNominal)}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-sm font-semibold text-gray-600">
                                          Keterangan
                                        </p>
                                        <p className="text-sm">
                                          {displayKeterangan}
                                        </p>
                                      </div>

                                      {/* Additional details based on transaction type */}
                                      {transaction.supplier_name && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Supplier
                                          </p>
                                          <p className="text-sm">
                                            {transaction.supplier_name}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.customer_name && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Customer
                                          </p>
                                          <p className="text-sm">
                                            {transaction.customer_name}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.item_name && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Item
                                          </p>
                                          <p className="text-sm">
                                            {transaction.item_name}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.quantity && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Quantity
                                          </p>
                                          <p className="text-sm">
                                            {transaction.quantity}{" "}
                                            {transaction.unit || ""}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.service_category && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Service Category
                                          </p>
                                          <p className="text-sm">
                                            {transaction.service_category}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.service_type && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Service Type
                                          </p>
                                          <p className="text-sm">
                                            {transaction.service_type}
                                          </p>
                                        </div>
                                      )}

                                      {transaction.account_name && (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-600">
                                            Account
                                          </p>
                                          <p className="text-sm">
                                            {transaction.account_name}
                                          </p>
                                        </div>
                                      )}

                                      {/* Upload Bukti */}
                                      {transaction.bukti && (
                                        <div className="border-t pt-4">
                                          <p className="text-sm font-semibold text-gray-600 mb-2">
                                            Upload Bukti
                                          </p>
                                          <a
                                            href={transaction.bukti}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                          >
                                            <Receipt className="h-4 w-4" />
                                            Lihat Bukti Transaksi
                                          </a>
                                        </div>
                                      )}

                                      {/* Tax information if available */}
                                      {(transaction.ppn_amount ||
                                        transaction.pph_amount) && (
                                        <div className="border-t pt-4">
                                          <p className="text-sm font-semibold text-gray-600 mb-2">
                                            Informasi Pajak
                                          </p>
                                          {transaction.ppn_amount && (
                                            <div className="flex justify-between text-sm">
                                              <span>
                                                PPN (
                                                {transaction.ppn_rate || 11}%)
                                              </span>
                                              <span>
                                                Rp{" "}
                                                {new Intl.NumberFormat(
                                                  "id-ID",
                                                ).format(
                                                  transaction.ppn_amount,
                                                )}
                                              </span>
                                            </div>
                                          )}
                                          {transaction.pph_amount && (
                                            <div className="flex justify-between text-sm">
                                              <span>
                                                PPh ({transaction.pph_rate || 2}
                                                %)
                                              </span>
                                              <span>
                                                Rp{" "}
                                                {new Intl.NumberFormat(
                                                  "id-ID",
                                                ).format(
                                                  transaction.pph_amount,
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Loan information if available */}
                                      {transaction.loan_number && (
                                        <div className="border-t pt-4">
                                          <p className="text-sm font-semibold text-gray-600 mb-2">
                                            Informasi Pinjaman
                                          </p>
                                          {transaction.lender_name && (
                                            <div className="flex justify-between text-sm mb-1">
                                              <span>Pemberi Pinjaman</span>
                                              <span>
                                                {transaction.lender_name}
                                              </span>
                                            </div>
                                          )}
                                          {transaction.interest_rate && (
                                            <div className="flex justify-between text-sm mb-1">
                                              <span>Bunga</span>
                                              <span>
                                                {transaction.interest_rate}%
                                              </span>
                                            </div>
                                          )}
                                          {transaction.installment_count && (
                                            <div className="flex justify-between text-sm">
                                              <span>Jumlah Cicilan</span>
                                              <span>
                                                {transaction.installment_count}x
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* OCR Scan Result if available */}
                                      {transaction.ocr_data ? (
                                        <div className="border-t pt-4">
                                          <p className="text-sm font-semibold text-gray-600 mb-2">
                                            📋 Hasil Scan OCR
                                          </p>
                                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-200">
                                            {/* Applied Fields */}
                                            {transaction.ocr_data.appliedFields && transaction.ocr_data.appliedFields.length > 0 && (
                                              <div>
                                                <p className="text-xs font-semibold text-blue-700 mb-2">Data yang Diekstrak:</p>
                                                <div className="bg-white rounded-lg p-3 border shadow-sm space-y-2">
                                                  {transaction.ocr_data.appliedFields.map((field: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center py-1 border-b last:border-0">
                                                      <span className="text-sm text-slate-600">{field.field}</span>
                                                      <span className="text-sm font-medium text-slate-800">{field.value}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Items List */}
                                            {transaction.ocr_data.items && transaction.ocr_data.items.length > 0 && (
                                              <div>
                                                <p className="text-xs font-semibold text-blue-700 mb-2">Daftar Item:</p>
                                                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                                                  <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                      <tr>
                                                        <th className="text-left p-2 font-medium text-slate-700">Nama Item</th>
                                                        <th className="text-center p-2 font-medium text-slate-700">Qty</th>
                                                        <th className="text-right p-2 font-medium text-slate-700">Harga</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {transaction.ocr_data.items.map((item: any, idx: number) => (
                                                        <tr key={idx} className="border-t">
                                                          <td className="p-2 text-slate-800">{item.name}</td>
                                                          <td className="p-2 text-center text-slate-600">{item.qty}</td>
                                                          <td className="p-2 text-right text-slate-800">
                                                            Rp {item.price?.toLocaleString("id-ID")}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Raw Text Preview (Collapsible) */}
                                            {transaction.ocr_data.extractedText && (
                                              <details className="text-sm">
                                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                                                  📄 Lihat Teks Mentah OCR
                                                </summary>
                                                <div className="mt-2 p-3 bg-white rounded-lg border text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto text-slate-600">
                                                  {transaction.ocr_data.extractedText}
                                                </div>
                                              </details>
                                            )}
                                            
                                            {/* No data message */}
                                            {(!transaction.ocr_data.appliedFields || transaction.ocr_data.appliedFields.length === 0) && 
                                             (!transaction.ocr_data.items || transaction.ocr_data.items.length === 0) && 
                                             !transaction.ocr_data.extractedText && (
                                              <p className="text-sm text-slate-500 italic">Tidak ada data OCR yang tersimpan</p>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="border-t pt-4">
                                          <p className="text-sm text-slate-500 italic">
                                            💡 Transaksi ini tidak menggunakan OCR scan
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                              <TableCell className="text-center">
                                {transaction.ocr_data ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                      >
                                        <ScanLine className="h-4 w-4 mr-1" />
                                        OCR
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>📄 Data OCR</DialogTitle>
                                        <DialogDescription>
                                          Data OCR untuk transaksi {displayDocNumber}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 space-y-4">
                                        {/* Extracted Text */}
                                        {transaction.ocr_data.extractedText && (
                                          <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                              Teks yang Diekstrak:
                                            </p>
                                            <div className="p-4 bg-slate-50 rounded-lg border text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto text-slate-700">
                                              {transaction.ocr_data.extractedText}
                                            </div>
                                          </div>
                                        )}

                                        {/* Raw OCR Data */}
                                        {!transaction.ocr_data.extractedText && (
                                          <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                              Data OCR Mentah:
                                            </p>
                                            <div className="p-4 bg-slate-50 rounded-lg border text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto text-slate-700">
                                              {JSON.stringify(transaction.ocr_data, null, 2)}
                                            </div>
                                          </div>
                                        )}

                                        {/* Applied Fields */}
                                        {transaction.ocr_data.appliedFields && transaction.ocr_data.appliedFields.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                              Field yang Diterapkan:
                                            </p>
                                            <div className="space-y-2">
                                              {transaction.ocr_data.appliedFields.map((field: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                                                  <span className="text-sm font-medium text-blue-900">{field.field}</span>
                                                  <span className="text-sm text-blue-700">{field.value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Items */}
                                        {transaction.ocr_data.items && transaction.ocr_data.items.length > 0 && (
                                          <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                              Item yang Diekstrak:
                                            </p>
                                            <table className="w-full text-sm border">
                                              <thead className="bg-slate-100">
                                                <tr>
                                                  <th className="p-2 text-left border">Item</th>
                                                  <th className="p-2 text-center border">Qty</th>
                                                  <th className="p-2 text-right border">Harga</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {transaction.ocr_data.items.map((item: any, idx: number) => (
                                                  <tr key={idx} className="border-t">
                                                    <td className="p-2 text-slate-800">{item.name}</td>
                                                    <td className="p-2 text-center text-slate-600">{item.qty}</td>
                                                    <td className="p-2 text-right text-slate-800">
                                                      Rp {item.price?.toLocaleString("id-ID")}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {transaction.bukti ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        <FileText className="h-4 w-4 mr-1" />
                                        Lihat
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Bukti Transaksi</DialogTitle>
                                        <DialogDescription>
                                          Bukti untuk transaksi {displayDocNumber}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4">
                                        {transaction.bukti.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                          <img
                                            src={transaction.bukti}
                                            alt="Bukti Transaksi"
                                            className="w-full h-auto max-h-[60vh] object-contain rounded-lg border"
                                          />
                                        ) : transaction.bukti.match(/\.pdf$/i) ? (
                                          <iframe
                                            src={transaction.bukti}
                                            className="w-full h-[60vh] rounded-lg border"
                                            title="Bukti PDF"
                                          />
                                        ) : (
                                          <a
                                            href={transaction.bukti}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                                          >
                                            <FileText className="h-5 w-5" />
                                            Buka Bukti di Tab Baru
                                          </a>
                                        )}
                                      </div>
                                      <div className="mt-4 flex justify-end">
                                        <a
                                          href={transaction.bukti}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                          <FileText className="h-4 w-4" />
                                          Buka di Tab Baru
                                        </a>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span
                                  className={
                                    isIncome ? "text-green-600" : "text-red-600"
                                  }
                                >
                                  {isIncome ? "+" : "-"}
                                  Rp{" "}
                                  {new Intl.NumberFormat("id-ID").format(
                                    displayNominal,
                                  )}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                  <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                    {/* Total Penerimaan Kas */}
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-right font-bold text-lg"
                      >
                        Total Penerimaan Kas:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        <span className="text-green-600">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            transactions
                              .filter((t) => {
                                // Apply same filters as table
                                if (filterDateFrom || filterDateTo) {
                                  const transactionDate = new Date(t.tanggal);
                                  if (filterDateFrom) {
                                    const fromDate = new Date(filterDateFrom);
                                    if (transactionDate < fromDate)
                                      return false;
                                  }
                                  if (filterDateTo) {
                                    const toDate = new Date(filterDateTo);
                                    toDate.setHours(23, 59, 59, 999);
                                    if (transactionDate > toDate) return false;
                                  }
                                }
                                if (filterJenis) {
                                  const jenis =
                                    t.payment_type ||
                                    t.jenis ||
                                    t.transaction_type ||
                                    t.expense_type ||
                                    "";
                                  if (
                                    !jenis
                                      .toLowerCase()
                                      .includes(filterJenis.toLowerCase())
                                  )
                                    return false;
                                }
                                if (filterSource) {
                                  if (t.source !== filterSource) return false;
                                }
                                if (filterStatus) {
                                  if (t.approval_status !== filterStatus)
                                    return false;
                                }
                                if (searchQuery) {
                                  const query = searchQuery.toLowerCase();
                                  const matchesSearch =
                                    t.payment_type
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.jenis?.toLowerCase().includes(query) ||
                                    t.account_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.keterangan
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.description
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.notes?.toLowerCase().includes(query) ||
                                    t.item_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.supplier_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.customer_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.lender_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.document_number
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.loan_number
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.source?.toLowerCase().includes(query);
                                  if (!matchesSearch) return false;
                                }

                                // Only count Penerimaan (approved)
                                if (t.approval_status !== "approved")
                                  return false;

                                // Income from Penjualan Jasa
                                if (
                                  t.source === "sales_transactions" &&
                                  t.transaction_type === "Jasa"
                                )
                                  return true;
                                // Income from Penjualan Barang
                                if (
                                  t.source === "sales_transactions" &&
                                  t.transaction_type === "Barang"
                                )
                                  return true;
                                // Income from Penerimaan Cash & Bank
                                if (t.source === "cash_receipts") return true;

                                return false;
                              })
                              .reduce((sum, t) => {
                                const nominal = parseFloat(
                                  t.nominal ||
                                    t.amount ||
                                    t.total_amount ||
                                    t.total_value ||
                                    0,
                                );
                                return sum + nominal;
                              }, 0),
                          )}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Total Pengeluaran Kas */}
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-right font-bold text-lg"
                      >
                        Total Pengeluaran Kas:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        <span className="text-red-600">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            transactions
                              .filter((t) => {
                                // Apply same filters as table
                                if (filterDateFrom || filterDateTo) {
                                  const transactionDate = new Date(t.tanggal);
                                  if (filterDateFrom) {
                                    const fromDate = new Date(filterDateFrom);
                                    if (transactionDate < fromDate)
                                      return false;
                                  }
                                  if (filterDateTo) {
                                    const toDate = new Date(filterDateTo);
                                    toDate.setHours(23, 59, 59, 999);
                                    if (transactionDate > toDate) return false;
                                  }
                                }
                                if (filterJenis) {
                                  const jenis =
                                    t.payment_type ||
                                    t.jenis ||
                                    t.transaction_type ||
                                    t.expense_type ||
                                    "";
                                  if (
                                    !jenis
                                      .toLowerCase()
                                      .includes(filterJenis.toLowerCase())
                                  )
                                    return false;
                                }
                                if (filterSource) {
                                  if (t.source !== filterSource) return false;
                                }
                                if (filterStatus) {
                                  if (t.approval_status !== filterStatus)
                                    return false;
                                }
                                if (searchQuery) {
                                  const query = searchQuery.toLowerCase();
                                  const matchesSearch =
                                    t.payment_type
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.jenis?.toLowerCase().includes(query) ||
                                    t.account_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.keterangan
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.description
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.notes?.toLowerCase().includes(query) ||
                                    t.item_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.supplier_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.customer_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.lender_name
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.document_number
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.loan_number
                                      ?.toLowerCase()
                                      .includes(query) ||
                                    t.source?.toLowerCase().includes(query);
                                  if (!matchesSearch) return false;
                                }

                                // Only count Pengeluaran (approved)
                                if (t.approval_status !== "approved")
                                  return false;

                                // Expenses from kas_transaksi
                                if (
                                  t.source === "kas_transaksi" &&
                                  t.payment_type === "Pengeluaran Kas"
                                )
                                  return true;
                                // Expenses from purchase_transactions
                                if (t.source === "purchase_transactions")
                                  return true;
                                // Expenses from internal_usage
                                if (t.source === "internal_usage") return true;
                                // Expenses from expenses table
                                if (t.source === "expenses") return true;
                                // Expenses from cash_disbursement
                                if (t.source === "cash_disbursement")
                                  return true;

                                return false;
                              })
                              .reduce((sum, t) => {
                                const nominal = parseFloat(
                                  t.nominal ||
                                    t.amount ||
                                    t.total_amount ||
                                    t.total_value ||
                                    0,
                                );
                                return sum + nominal;
                              }, 0),
                          )}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Total Net */}
                    <TableRow className="bg-slate-200">
                      <TableCell
                        colSpan={10}
                        className="text-right font-bold text-xl"
                      >
                        Total Net:
                      </TableCell>
                      <TableCell className="text-right font-bold text-xl">
                        <span className="text-indigo-700">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            (() => {
                              const filteredTransactions = transactions.filter(
                                (t) => {
                                  // Apply same filters as table
                                  if (filterDateFrom || filterDateTo) {
                                    const transactionDate = new Date(t.tanggal);
                                    if (filterDateFrom) {
                                      const fromDate = new Date(filterDateFrom);
                                      if (transactionDate < fromDate)
                                        return false;
                                    }
                                    if (filterDateTo) {
                                      const toDate = new Date(filterDateTo);
                                      toDate.setHours(23, 59, 59, 999);
                                      if (transactionDate > toDate)
                                        return false;
                                    }
                                  }
                                  if (filterJenis) {
                                    const jenis =
                                      t.payment_type ||
                                      t.jenis ||
                                      t.transaction_type ||
                                      t.expense_type ||
                                      "";
                                    if (
                                      !jenis
                                        .toLowerCase()
                                        .includes(filterJenis.toLowerCase())
                                    )
                                      return false;
                                  }
                                  if (filterSource) {
                                    if (t.source !== filterSource) return false;
                                  }
                                  if (filterStatus) {
                                    if (t.approval_status !== filterStatus)
                                      return false;
                                  }
                                  if (searchQuery) {
                                    const query = searchQuery.toLowerCase();
                                    return (
                                      t.payment_type
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.jenis?.toLowerCase().includes(query) ||
                                      t.account_name
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.keterangan
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.description
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.notes?.toLowerCase().includes(query) ||
                                      t.item_name
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.supplier_name
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.customer_name
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.lender_name
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.document_number
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.loan_number
                                        ?.toLowerCase()
                                        .includes(query) ||
                                      t.source?.toLowerCase().includes(query)
                                    );
                                  }
                                  return true;
                                },
                              );

                              const totalPenerimaan = filteredTransactions
                                .filter((t) => {
                                  if (t.approval_status !== "approved")
                                    return false;
                                  if (
                                    t.source === "sales_transactions" &&
                                    t.transaction_type === "Jasa"
                                  )
                                    return true;
                                  if (
                                    t.source === "sales_transactions" &&
                                    t.transaction_type === "Barang"
                                  )
                                    return true;
                                  if (t.source === "cash_receipts") return true;
                                  return false;
                                })
                                .reduce((sum, t) => {
                                  const nominal = parseFloat(
                                    t.nominal ||
                                      t.amount ||
                                      t.total_amount ||
                                      t.total_value ||
                                      0,
                                  );
                                  return sum + nominal;
                                }, 0);

                              const totalPengeluaran = filteredTransactions
                                .filter((t) => {
                                  if (t.approval_status !== "approved")
                                    return false;
                                  if (
                                    t.source === "kas_transaksi" &&
                                    t.payment_type === "Pengeluaran Kas"
                                  )
                                    return true;
                                  if (t.source === "purchase_transactions")
                                    return true;
                                  if (t.source === "internal_usage")
                                    return true;
                                  if (t.source === "expenses") return true;
                                  if (t.source === "cash_disbursement")
                                    return true;
                                  return false;
                                })
                                .reduce((sum, t) => {
                                  const nominal = parseFloat(
                                    t.nominal ||
                                      t.amount ||
                                      t.total_amount ||
                                      t.total_value ||
                                      0,
                                  );
                                  return sum + nominal;
                                }, 0);

                              return totalPenerimaan - totalPengeluaran;
                            })(),
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* FORM VIEW */}
        {showForm && !showCart && (
          <Card className="bg-white rounded-xl shadow-lg border border-slate-200">
            <CardContent className="p-6 space-y-6">
              
              {/* ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jenis_transaksi">Jenis Transaksi *</Label>
                  <Select
                    value={jenisTransaksi}
                    onValueChange={setJenisTransaksi}
                  >
                    <SelectTrigger id="jenis_transaksi">
                      <SelectValue placeholder="-- pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Penjualan Barang">
                        Penjualan Barang
                      </SelectItem>
                      <SelectItem value="Penjualan Jasa">
                        Penjualan Jasa
                      </SelectItem>
                      <SelectItem value="Pembelian Barang">
                        Pembelian Barang
                      </SelectItem>
                      <SelectItem value="Pembelian Jasa">
                        Pembelian Jasa
                      </SelectItem>
                      <SelectItem value="Penerimaan Kas">
                        Penerimaan Kas & Bank
                      </SelectItem>
                      <SelectItem value="Pengeluaran Kas">
                        Pengeluaran Kas
                      </SelectItem>
                      <SelectItem value="Pinjaman Masuk">
                        Pinjaman Masuk
                      </SelectItem>
                      <SelectItem value="Pembayaran Pinjaman">
                        Pembayaran Pinjaman
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {jenisTransaksi === "Penerimaan Kas" && (
                  <div className="space-y-2">
                    <Label htmlFor="payment_type">Payment Type *</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger id="payment_type">
                        <SelectValue placeholder="-- pilih --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Transfer Bank">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Bank Selection - Show only if Transfer Bank */}
              {paymentType === "Transfer Bank" && (
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank *</Label>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger id="bank">
                      <SelectValue placeholder="-- pilih bank --" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem
                          key={bank.account_code}
                          value={bank.account_code}
                        >
                          {bank.account_code} — {bank.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Kas Selection - Show only if Cash */}
              {paymentType === "Cash" && (
                <div className="space-y-2">
                  <Label htmlFor="kas">Kas *</Label>
                  <Select value={selectedKas} onValueChange={setSelectedKas}>
                    <SelectTrigger id="kas">
                      <SelectValue placeholder="-- pilih kas --" />
                    </SelectTrigger>
                    <SelectContent>
                      {kasAccounts.map((kas) => (
                        <SelectItem
                          key={kas.account_code}
                          value={kas.account_code}
                        >
                          {kas.account_code} — {kas.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ROW 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shouldShowField("kategoriLayanan") && (
                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori Layanan</Label>
                    <Select
                      value={kategori}
                      onValueChange={setKategori}
                      disabled={!jenisTransaksi}
                    >
                      <SelectTrigger id="kategori">
                        <SelectValue
                          placeholder={
                            jenisTransaksi
                              ? "-- pilih --"
                              : "Pilih jenis transaksi terlebih dahulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.filter((cat) => cat).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {jenisTransaksi && availableCategories.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {availableCategories.length} kategori tersedia
                      </p>
                    )}
                  </div>
                )}

                {shouldShowField("jenisLayanan") && (
                  <div className="space-y-2">
                    <Label htmlFor="jenis_layanan">Jenis Layanan</Label>
                    <Select
                      value={jenisLayanan}
                      onValueChange={setJenisLayanan}
                      disabled={!kategori || serviceTypes.length === 0}
                    >
                      <SelectTrigger id="jenis_layanan">
                        <SelectValue
                          placeholder={
                            kategori
                              ? "-- pilih --"
                              : "Pilih kategori terlebih dahulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.filter((type) => type).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {kategori && serviceTypes.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {serviceTypes.length} jenis layanan tersedia
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ITEM & DESCRIPTION */}
              {shouldShowField("itemBarang") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_barang">Item Barang</Label>
                    <div className="flex gap-2">
                      <Popover
                        open={openItemPopover}
                        onOpenChange={setOpenItemPopover}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="flex-1 justify-between"
                          >
                            {itemName || "-- pilih item --"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[400px] p-2">
                          <Input
                            placeholder="Ketik untuk mencari item..."
                            value={itemSearchKeyword}
                            onChange={(e) =>
                              setItemSearchKeyword(e.target.value)
                            }
                            className="mb-2"
                          />

                          <div className="max-h-[300px] overflow-auto">
                            {safeFilteredItems
                              .filter((i) =>
                                (i.item_name || "")
                                  .toLowerCase()
                                  .includes(itemSearchKeyword.toLowerCase()),
                              )
                              .map((i, index) => (
                                <div
                                  key={index}
                                  className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                  onClick={() => {
                                    setItemName(i.item_name);
                                    setDescription("");
                                    setOpenItemPopover(false);
                                    setItemSearchKeyword("");
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      itemName === i.item_name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {i.item_name}
                                </div>
                              ))}

                            {safeFilteredItems.filter((i) =>
                              (i.item_name || "")
                                .toLowerCase()
                                .includes(itemSearchKeyword.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                Tidak ada item ditemukan.
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setOpenStockItemModal(true)}
                        title="Tambah Item & Stock Sekaligus"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {shouldShowField("description") && (
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <div className="flex gap-2">
                        <Popover
                          open={openDescriptionPopover}
                          onOpenChange={setOpenDescriptionPopover}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="flex-1 justify-between"
                              disabled={!itemName}
                            >
                              {description ||
                                (itemName
                                  ? "-- pilih deskripsi --"
                                  : "Pilih item terlebih dahulu")}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-[400px] p-2">
                            <Input
                              placeholder="Ketik untuk mencari deskripsi..."
                              value={descriptionSearchKeyword}
                              onChange={(e) =>
                                setDescriptionSearchKeyword(e.target.value)
                              }
                              className="mb-2"
                            />

                            <div className="max-h-[300px] overflow-auto">
                              {safeFilteredDescriptions
                                .filter((d) =>
                                  (d.description || "")
                                    .toLowerCase()
                                    .includes(
                                      descriptionSearchKeyword.toLowerCase(),
                                    ),
                                )
                                .map((d, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                    onClick={() => {
                                      setDescription(d.description);
                                      setOpenDescriptionPopover(false);
                                      setDescriptionSearchKeyword("");
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        description === d.description
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {d.description}
                                  </div>
                                ))}

                              {safeFilteredDescriptions.filter((d) =>
                                (d.description || "")
                                  .toLowerCase()
                                  .includes(
                                    descriptionSearchKeyword.toLowerCase(),
                                  ),
                              ).length === 0 && (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  Tidak ada deskripsi ditemukan.
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STOCK INFORMATION */}
              {shouldShowField("itemBarang") && itemName && description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    📦 Informasi Stock
                  </h4>
                  {loadingStock ? (
                    <p className="text-sm text-gray-600">
                      Memuat data stock...
                    </p>
                  ) : stockInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Sisa Stock:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {stockInfo.quantity || 0} {stockInfo.unit || "pcs"}
                        </span>
                      </div>
                      {stockInfo.warehouses && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Gudang:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {stockInfo.warehouses.name} (
                            {stockInfo.warehouses.code})
                          </span>
                        </div>
                      )}
                      {stockInfo.location && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Lokasi:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {stockInfo.location}
                          </span>
                        </div>
                      )}
                      {stockInfo.harga_jual && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Harga Jual (Gudang):
                          </span>
                          <span className="ml-2 text-gray-900">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              stockInfo.harga_jual,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600">
                      ⚠️ Stock tidak ditemukan untuk item dan deskripsi ini
                    </p>
                  )}
                </div>
              )}

              {/* QUANTITY & HARGA JUAL - Only for Penjualan Barang */}
              {jenisTransaksi === "Penjualan Barang" &&
                itemName &&
                description && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          // Auto-calculate nominal
                          if (hargaJual) {
                            const total =
                              Number(e.target.value) * Number(hargaJual);
                            setNominal(total.toString());
                          }
                        }}
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="harga_jual">Harga Jual per Unit *</Label>
                      <Input
                        id="harga_jual"
                        type="number"
                        value={hargaJual}
                        onChange={(e) => {
                          setHargaJual(e.target.value);
                          // Auto-calculate nominal
                          if (quantity) {
                            const total =
                              Number(quantity) * Number(e.target.value);
                            setNominal(total.toString());
                          }
                        }}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Total: Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          Number(quantity || 0) * Number(hargaJual || 0),
                        )}
                      </p>
                    </div>
                  </div>
                )}

              {/* QUANTITY, HARGA BELI & PPN - Only for Pembelian Barang */}
              {jenisTransaksi === "Pembelian Barang" &&
                itemName &&
                description && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity_beli">Quantity *</Label>
                        <Input
                          id="quantity_beli"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value);
                            // Auto-calculate nominal with PPN
                            if (hargaBeli) {
                              const subtotal =
                                Number(e.target.value) * Number(hargaBeli);
                              const ppn =
                                subtotal * (Number(ppnPercentage) / 100);
                              setPpnAmount(ppn.toString());
                              setNominal((subtotal + ppn).toString());
                            }
                          }}
                          placeholder="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="harga_beli">
                          Harga Beli per Unit *
                        </Label>
                        <Input
                          id="harga_beli"
                          type="number"
                          value={hargaBeli}
                          onChange={(e) => {
                            setHargaBeli(e.target.value);
                            // Auto-calculate nominal with PPN
                            if (quantity) {
                              const subtotal =
                                Number(quantity) * Number(e.target.value);
                              const ppn =
                                subtotal * (Number(ppnPercentage) / 100);
                              setPpnAmount(ppn.toString());
                              setNominal((subtotal + ppn).toString());
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ppn_percentage">PPN (%) *</Label>
                        <Input
                          id="ppn_percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={ppnPercentage}
                          onChange={(e) => {
                            setPpnPercentage(e.target.value);
                            // Recalculate PPN and total
                            if (quantity && hargaBeli) {
                              const subtotal =
                                Number(quantity) * Number(hargaBeli);
                              const ppn =
                                subtotal * (Number(e.target.value) / 100);
                              setPpnAmount(ppn.toString());
                              setNominal((subtotal + ppn).toString());
                            }
                          }}
                          placeholder="11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ppn_amount">Jumlah PPN</Label>
                        <Input
                          id="ppn_amount"
                          type="number"
                          value={ppnAmount}
                          readOnly
                          className="bg-gray-100"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Subtotal:
                          </span>
                          <span className="ml-2 text-gray-900">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              Number(quantity || 0) * Number(hargaBeli || 0),
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            PPN ({ppnPercentage}%):
                          </span>
                          <span className="ml-2 text-gray-900">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              Number(ppnAmount || 0),
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-blue-300">
                          <span className="font-bold text-gray-900 text-lg">
                            Total:
                          </span>
                          <span className="ml-2 text-blue-700 font-bold text-lg">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              Number(quantity || 0) * Number(hargaBeli || 0) +
                                Number(ppnAmount || 0),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* CUSTOMER / SUPPLIER */}
              {(jenisTransaksi === "Penjualan Barang" ||
                jenisTransaksi === "Penjualan Jasa") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={customer} onValueChange={setCustomer}>
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="-- pilih customer --" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            Tidak ada data customer
                          </SelectItem>
                        ) : (
                          customers.filter((c) => c.customer_name).map((c) => (
                            <SelectItem key={c.id} value={c.customer_name}>
                              {c.customer_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {customers.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Silakan tambahkan customer terlebih dahulu
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consignee">Consignee</Label>
                    <Select value={consignee} onValueChange={setConsignee}>
                      <SelectTrigger id="consignee">
                        <SelectValue placeholder="-- pilih consignee --" />
                      </SelectTrigger>
                      <SelectContent>
                        {consignees.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            Tidak ada data consignee
                          </SelectItem>
                        ) : (
                          consignees.filter((c) => c.consignee_name).map((c) => (
                            <SelectItem key={c.id} value={c.consignee_name}>
                              {c.consignee_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {consignees.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Silakan tambahkan consignee terlebih dahulu
                      </p>
                    )}
                  </div>
                </>
              )}

              {(jenisTransaksi === "Pembelian Barang" ||
                jenisTransaksi === "Pembelian Jasa") && (
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select value={supplier} onValueChange={setSupplier}>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="-- pilih supplier --" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.filter((s) => s.supplier_name).map((s) => (
                        <SelectItem key={s.id} value={s.supplier_name}>
                          {s.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* LOAN FIELDS - Show for Pinjaman Masuk */}
              {jenisTransaksi === "Pinjaman Masuk" && (
                <div className="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                    💰 Informasi Pinjaman
                  </h4>

                  {/* Borrower Name */}
                  <div className="space-y-2">
                    <Label htmlFor="borrower">Nama Peminjam *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedBorrower}
                        onValueChange={setSelectedBorrower}
                      >
                        <SelectTrigger id="borrower" className="flex-1">
                          <SelectValue placeholder="-- pilih peminjam --" />
                        </SelectTrigger>
                        <SelectContent>
                          {borrowers.length === 0 ? (
                            <SelectItem value="no-data" disabled>
                              Tidak ada data peminjam
                            </SelectItem>
                          ) : (
                            borrowers.filter((b) => b.borrower_name).map((b) => (
                              <SelectItem key={b.id} value={b.borrower_name}>
                                {b.borrower_name} ({b.borrower_code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setOpenBorrowerModal(true)}
                        title="Tambah Peminjam Baru"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Loan Type */}
                  <div className="space-y-2">
                    <Label htmlFor="loan_type">Tipe Pinjaman</Label>
                    <Select value={loanType} onValueChange={setLoanType}>
                      <SelectTrigger id="loan_type">
                        <SelectValue placeholder="-- pilih tipe --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank">Bank</SelectItem>
                        <SelectItem value="Individu">Individu</SelectItem>
                        <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Interest Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="interest_rate">Bunga (%) *</Label>
                      <Input
                        id="interest_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {/* Loan Term */}
                    <div className="space-y-2">
                      <Label htmlFor="loan_term">Lama Pinjaman (Bulan) *</Label>
                      <Input
                        id="loan_term"
                        type="number"
                        min="1"
                        value={loanTermMonths}
                        onChange={(e) => {
                          setLoanTermMonths(e.target.value);
                          // Auto-calculate maturity date
                          if (tanggal && e.target.value) {
                            const date = new Date(tanggal);
                            date.setMonth(
                              date.getMonth() + parseInt(e.target.value),
                            );
                            setMaturityDate(date.toISOString().split("T")[0]);
                          }
                        }}
                        placeholder="12"
                      />
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_schedule">
                      Jadwal Pembayaran *
                    </Label>
                    <Select
                      value={paymentSchedule}
                      onValueChange={setPaymentSchedule}
                    >
                      <SelectTrigger id="payment_schedule">
                        <SelectValue placeholder="-- pilih --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bulanan">
                          Bulanan (Cicilan)
                        </SelectItem>
                        <SelectItem value="Jatuh Tempo">
                          Jatuh Tempo (Lump Sum)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Maturity Date */}
                  <div className="space-y-2">
                    <Label htmlFor="maturity_date">
                      Jatuh Tempo / Maturity Date
                    </Label>
                    <Input
                      id="maturity_date"
                      type="date"
                      value={maturityDate}
                      onChange={(e) => setMaturityDate(e.target.value)}
                      className="bg-gray-100"
                    />
                    {maturityDate && (
                      <p className="text-xs text-purple-600">
                        📅 Jatuh tempo:{" "}
                        {new Date(maturityDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Installment Schedule Display */}
                  {installmentSchedule.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-semibold text-sm text-purple-900">
                        📊 Jadwal Cicilan
                      </h4>
                      <div className="max-h-64 overflow-y-auto border border-purple-200 rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="bg-purple-100 sticky top-0">
                            <tr>
                              <th className="px-2 py-1 text-left">Cicilan</th>
                              <th className="px-2 py-1 text-left">
                                Jatuh Tempo
                              </th>
                              <th className="px-2 py-1 text-right">Pokok</th>
                              <th className="px-2 py-1 text-right">Bunga</th>
                              <th className="px-2 py-1 text-right">Total</th>
                              <th className="px-2 py-1 text-right">Sisa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installmentSchedule.map((inst, idx) => (
                              <tr
                                key={idx}
                                className="border-t border-purple-100"
                              >
                                <td className="px-2 py-1">
                                  {inst.installment}
                                </td>
                                <td className="px-2 py-1">
                                  {new Date(inst.dueDate).toLocaleDateString(
                                    "id-ID",
                                  )}
                                </td>
                                <td className="px-2 py-1 text-right">
                                  {new Intl.NumberFormat("id-ID").format(
                                    inst.principalAmount,
                                  )}
                                </td>
                                <td className="px-2 py-1 text-right">
                                  {new Intl.NumberFormat("id-ID").format(
                                    inst.interestAmount,
                                  )}
                                </td>
                                <td className="px-2 py-1 text-right font-semibold">
                                  {new Intl.NumberFormat("id-ID").format(
                                    inst.totalPayment,
                                  )}
                                </td>
                                <td className="px-2 py-1 text-right text-gray-600">
                                  {new Intl.NumberFormat("id-ID").format(
                                    inst.remainingBalance,
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-purple-50 font-semibold">
                            <tr>
                              <td colSpan={2} className="px-2 py-1">
                                Total
                              </td>
                              <td className="px-2 py-1 text-right">
                                {new Intl.NumberFormat("id-ID").format(
                                  installmentSchedule.reduce(
                                    (sum, inst) => sum + inst.principalAmount,
                                    0,
                                  ),
                                )}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {new Intl.NumberFormat("id-ID").format(
                                  installmentSchedule.reduce(
                                    (sum, inst) => sum + inst.interestAmount,
                                    0,
                                  ),
                                )}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {new Intl.NumberFormat("id-ID").format(
                                  installmentSchedule.reduce(
                                    (sum, inst) => sum + inst.totalPayment,
                                    0,
                                  ),
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payment Details for Pembayaran Pinjaman */}
                  {jenisTransaksi === "Pembayaran Pinjaman" && (
                    <div className="space-y-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-yellow-900">
                        💳 Detail Pembayaran
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="principal_payment">
                            Pembayaran Pokok (Rp)
                          </Label>
                          <Input
                            id="principal_payment"
                            type="number"
                            value={principalAmount}
                            onChange={(e) => setPrincipalAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interest_payment">
                            Pembayaran Bunga (Rp)
                          </Label>
                          <Input
                            id="interest_payment"
                            type="number"
                            value={interestAmount}
                            onChange={(e) => setInterestAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Late Fee Calculation Section */}
                      <div className="space-y-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm text-red-900">
                          ⏰ Perhitungan Denda Keterlambatan
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="actual_payment_date">
                              Tanggal Pembayaran Aktual
                            </Label>
                            <Input
                              id="actual_payment_date"
                              type="date"
                              value={actualPaymentDate}
                              onChange={(e) => {
                                setActualPaymentDate(e.target.value);
                                // Auto-calculate days late and late fee
                                if (e.target.value && tanggal) {
                                  const due = new Date(tanggal);
                                  const payment = new Date(e.target.value);
                                  const days = Math.floor(
                                    (payment.getTime() - due.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  );
                                  const daysLateCalc = Math.max(0, days);
                                  setDaysLate(daysLateCalc.toString());

                                  // Calculate late fee
                                  if (daysLateCalc > 0 && principalAmount) {
                                    const installmentAmount =
                                      Number(principalAmount) +
                                      Number(interestAmount);
                                    const fee =
                                      installmentAmount *
                                      (Number(lateFeePercentage) / 100) *
                                      daysLateCalc;
                                    setLateFee(fee.toFixed(2));
                                  } else {
                                    setLateFee("0");
                                  }
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="late_fee_percentage">
                              Persentase Denda per Hari (%)
                            </Label>
                            <Input
                              id="late_fee_percentage"
                              type="number"
                              step="0.01"
                              value={lateFeePercentage}
                              onChange={(e) => {
                                setLateFeePercentage(e.target.value);
                                // Recalculate late fee
                                if (Number(daysLate) > 0 && principalAmount) {
                                  const installmentAmount =
                                    Number(principalAmount) +
                                    Number(interestAmount);
                                  const fee =
                                    installmentAmount *
                                    (Number(e.target.value) / 100) *
                                    Number(daysLate);
                                  setLateFee(fee.toFixed(2));
                                }
                              }}
                              placeholder="0.1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="days_late">
                              Hari Keterlambatan
                            </Label>
                            <Input
                              id="days_late"
                              type="number"
                              value={daysLate}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="late_fee">
                              Denda Keterlambatan (Rp)
                            </Label>
                            <Input
                              id="late_fee"
                              type="number"
                              value={lateFee}
                              onChange={(e) => setLateFee(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {Number(daysLate) > 0 && (
                          <div className="bg-red-100 p-3 rounded">
                            <p className="text-xs text-red-800">
                              📊 Perhitungan: (Pokok + Bunga) ×{" "}
                              {lateFeePercentage}% × {daysLate} hari = Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                Number(lateFee),
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tax Section */}
                      <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm text-blue-900">
                          🧾 Pajak
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tax_type">Jenis Pajak</Label>
                            <Select value={taxType} onValueChange={setTaxType}>
                              <SelectTrigger id="tax_type">
                                <SelectValue placeholder="-- pilih --" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PPh21">
                                  PPh 21 (Gaji)
                                </SelectItem>
                                <SelectItem value="PPh23">
                                  PPh 23 (Jasa)
                                </SelectItem>
                                <SelectItem value="PPh4(2)">
                                  PPh 4(2) (Final)
                                </SelectItem>
                                <SelectItem value="PPN">PPN</SelectItem>
                                <SelectItem value="PPnBM">PPnBM</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tax_percentage">
                              Persentase Pajak (%)
                            </Label>
                            <Input
                              id="tax_percentage"
                              type="number"
                              step="0.01"
                              value={taxPercentage}
                              onChange={(e) => {
                                setTaxPercentage(e.target.value);
                                // Auto-calculate tax amount
                                const baseAmount =
                                  Number(principalAmount) +
                                  Number(interestAmount);
                                const tax =
                                  baseAmount * (Number(e.target.value) / 100);
                                setTaxAmount(tax.toFixed(2));
                              }}
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tax_amount">
                              Jumlah Pajak (Rp)
                            </Label>
                            <Input
                              id="tax_amount"
                              type="number"
                              value={taxAmount}
                              onChange={(e) => setTaxAmount(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {Number(taxAmount) > 0 && (
                          <div className="bg-blue-100 p-3 rounded">
                            <p className="text-xs text-blue-800">
                              📊 Perhitungan: (Pokok + Bunga) × {taxPercentage}%
                              = Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                Number(taxAmount),
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-100 p-3 rounded">
                        <p className="text-sm font-semibold text-yellow-900">
                          Total Pembayaran: Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            Number(principalAmount) +
                              Number(interestAmount) +
                              Number(lateFee) +
                              Number(taxAmount),
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LOAN PAYMENT FIELDS - Show for Pembayaran Pinjaman */}
              {jenisTransaksi === "Pembayaran Pinjaman" && (
                <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    💳 Pembayaran Pinjaman
                  </h4>

                  {/* Select Active Loan */}
                  <div className="space-y-2">
                    <Label htmlFor="select_loan">Pilih Pinjaman *</Label>
                    <Select
                      value={selectedBorrower}
                      onValueChange={async (value) => {
                        setSelectedBorrower(value);

                        // Load loan details from selected borrower
                        const { data: loans } = await supabase
                          .from("loans")
                          .select("*")
                          .eq("lender_name", value)
                          .eq("status", "Aktif")
                          .order("loan_date", { ascending: false })
                          .limit(1);

                        if (loans && loans.length > 0) {
                          const loan = loans[0];

                          // Auto-fill loan details
                          setLoanType(loan.lender_type || "");
                          setInterestRate(
                            loan.interest_rate?.toString() || "0",
                          );
                          setLoanTermMonths(
                            loan.loan_term_months?.toString() || "12",
                          );
                          setMaturityDate(loan.maturity_date || "");
                          setPaymentSchedule(
                            loan.payment_schedule || "Bulanan",
                          );
                          setLateFeePercentage(
                            loan.late_fee_percentage?.toString() || "0.1",
                          );
                          setTaxType(loan.tax_type || "");
                          setTaxPercentage(
                            loan.tax_percentage?.toString() || "0",
                          );

                          // Set nominal to principal amount to trigger schedule calculation
                          setNominal(loan.principal_amount?.toString() || "0");

                          // Load installment schedule from database
                          const { data: installments } = await supabase
                            .from("loan_installments")
                            .select("*")
                            .eq("loan_id", loan.id)
                            .order("installment_number", { ascending: true });

                          if (installments && installments.length > 0) {
                            // Map installments to schedule format
                            const schedule = installments.map((inst) => ({
                              installment: inst.installment_number,
                              dueDate: inst.due_date,
                              principalAmount: inst.principal_amount,
                              interestAmount: inst.interest_amount,
                              totalPayment: inst.total_amount,
                              remainingBalance: inst.remaining_balance,
                              status: inst.status,
                              paidAmount: inst.paid_amount || 0,
                            }));
                            setInstallmentSchedule(schedule);

                            // Find next unpaid installment and auto-fill payment amounts
                            const nextUnpaid = installments.find(
                              (inst) => inst.status === "Belum Bayar",
                            );
                            if (nextUnpaid) {
                              setPrincipalAmount(
                                nextUnpaid.principal_amount?.toString() || "0",
                              );
                              setInterestAmount(
                                nextUnpaid.interest_amount?.toString() || "0",
                              );
                              setTanggal(nextUnpaid.due_date || "");
                            }
                          }

                          // Load borrower default settings
                          const { data: borrower } = await supabase
                            .from("borrowers")
                            .select("*")
                            .eq("borrower_name", value)
                            .single();

                          if (borrower) {
                            if (!loan.late_fee_percentage) {
                              setLateFeePercentage(
                                borrower.default_late_fee_percentage?.toString() ||
                                  "0.1",
                              );
                            }
                            if (!loan.tax_type) {
                              setTaxType(borrower.default_tax_type || "");
                              setTaxPercentage(
                                borrower.default_tax_percentage?.toString() ||
                                  "0",
                              );
                            }
                          }
                        }
                      }}
                    >
                      <SelectTrigger id="select_loan">
                        <SelectValue placeholder="-- pilih pinjaman --" />
                      </SelectTrigger>
                      <SelectContent>
                        {borrowers.length === 0 ? (
                          <SelectItem value="no-data" disabled>
                            Tidak ada pinjaman aktif
                          </SelectItem>
                        ) : (
                          borrowers.filter((b) => b.borrower_name).map((b) => (
                            <SelectItem key={b.id} value={b.borrower_name}>
                              {b.borrower_name} ({b.borrower_code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600">
                      💡 Data pinjaman akan otomatis terisi dari pinjaman masuk
                    </p>
                  </div>

                  {/* Display Loan Info (Read-only) */}
                  {selectedBorrower && (
                    <div className="space-y-3 bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-sm text-green-900">
                        📋 Detail Pinjaman
                      </h5>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Tipe:</span>
                          <span className="ml-2 font-medium">
                            {loanType || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bunga:</span>
                          <span className="ml-2 font-medium">
                            {interestRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tenor:</span>
                          <span className="ml-2 font-medium">
                            {loanTermMonths} bulan
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Jadwal:</span>
                          <span className="ml-2 font-medium">
                            {paymentSchedule}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Denda/hari:</span>
                          <span className="ml-2 font-medium">
                            {lateFeePercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pajak:</span>
                          <span className="ml-2 font-medium">
                            {taxType || "-"} ({taxPercentage}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nilai Pinjaman:</span>
                          <span className="ml-2 font-medium">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              Number(nominal),
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-green-200">
                          <span className="text-gray-600">Sisa Pinjaman:</span>
                          <span className="ml-2 font-bold text-green-700">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              installmentSchedule
                                .filter(
                                  (inst: any) =>
                                    inst.status === "Belum Bayar" ||
                                    inst.status === "Sebagian",
                                )
                                .reduce((sum: number, inst: any) => {
                                  // For partial payment, calculate remaining amount
                                  if (inst.status === "Sebagian") {
                                    return (
                                      sum +
                                      (inst.totalPayment -
                                        (inst.paidAmount || 0))
                                    );
                                  }
                                  return sum + inst.totalPayment;
                                }, 0),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Installment Schedule */}
                  {selectedBorrower && installmentSchedule.length > 0 && (
                    <div className="space-y-3 bg-white p-3 rounded border border-green-300">
                      <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-sm text-green-900">
                          📅 Jadwal Cicilan
                        </h5>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Refresh loan data
                              const { data: loans } = await supabase
                                .from("loans")
                                .select("*")
                                .eq("lender_name", selectedBorrower)
                                .eq("status", "Aktif")
                                .order("loan_date", { ascending: false })
                                .limit(1);

                              if (loans && loans.length > 0) {
                                const loan = loans[0];

                                // Reload installment schedule
                                const { data: installments } = await supabase
                                  .from("loan_installments")
                                  .select("*")
                                  .eq("loan_id", loan.id)
                                  .order("installment_number", {
                                    ascending: true,
                                  });

                                if (installments && installments.length > 0) {
                                  const schedule = installments.map((inst) => ({
                                    installment: inst.installment_number,
                                    dueDate: inst.due_date,
                                    principalAmount: inst.principal_amount,
                                    interestAmount: inst.interest_amount,
                                    totalPayment: inst.total_amount,
                                    remainingBalance: inst.remaining_balance,
                                    status: inst.status,
                                    paidAmount: inst.paid_amount || 0,
                                  }));
                                  setInstallmentSchedule(schedule);

                                  toast({
                                    title: "✅ Data Diperbarui",
                                    description:
                                      "Jadwal cicilan berhasil di-refresh",
                                  });
                                }
                              }
                            }}
                          >
                            🔄 Refresh
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "⚠️ Reset semua data pembayaran cicilan? Data yang sudah dibayar akan dikembalikan ke status 'Belum Bayar'.",
                                )
                              ) {
                                return;
                              }

                              // Get current loan
                              const { data: loans } = await supabase
                                .from("loans")
                                .select("*")
                                .eq("lender_name", selectedBorrower)
                                .eq("status", "Aktif")
                                .order("loan_date", { ascending: false })
                                .limit(1);

                              if (loans && loans.length > 0) {
                                const loan = loans[0];

                                // Reset all installments to unpaid
                                await supabase
                                  .from("loan_installments")
                                  .update({
                                    paid_amount: 0,
                                    status: "Belum Bayar",
                                    actual_payment_date: null,
                                    payment_date: null,
                                    days_late: 0,
                                    late_fee: 0,
                                    tax_amount: 0,
                                  })
                                  .eq("loan_id", loan.id);

                                // Reload installment schedule
                                const { data: installments } = await supabase
                                  .from("loan_installments")
                                  .select("*")
                                  .eq("loan_id", loan.id)
                                  .order("installment_number", {
                                    ascending: true,
                                  });

                                if (installments && installments.length > 0) {
                                  const schedule = installments.map((inst) => ({
                                    installment: inst.installment_number,
                                    dueDate: inst.due_date,
                                    principalAmount: inst.principal_amount,
                                    interestAmount: inst.interest_amount,
                                    totalPayment: inst.total_amount,
                                    remainingBalance: inst.remaining_balance,
                                    status: inst.status,
                                    paidAmount: inst.paid_amount || 0,
                                  }));
                                  setInstallmentSchedule(schedule);

                                  toast({
                                    title: "✅ Data Direset",
                                    description:
                                      "Semua cicilan dikembalikan ke status 'Belum Bayar'",
                                  });
                                }
                              }
                            }}
                          >
                            🔄 Reset Data
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-green-100">
                            <tr>
                              <th className="p-2 text-left">Cicilan</th>
                              <th className="p-2 text-left">Jatuh Tempo</th>
                              <th className="p-2 text-right">Pokok</th>
                              <th className="p-2 text-right">Bunga</th>
                              <th className="p-2 text-right">Total</th>
                              <th className="p-2 text-right">Terbayar</th>
                              <th className="p-2 text-right">Sisa</th>
                              <th className="p-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installmentSchedule.map(
                              (inst: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className={
                                    inst.status === "Lunas"
                                      ? "bg-green-50"
                                      : inst.status === "Sebagian"
                                        ? "bg-blue-50"
                                        : inst.status === "Belum Bayar"
                                          ? "bg-yellow-50"
                                          : "bg-gray-50"
                                  }
                                >
                                  <td className="p-2">{inst.installment}</td>
                                  <td className="p-2">{inst.dueDate}</td>
                                  <td className="p-2 text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                      inst.principalAmount,
                                    )}
                                  </td>
                                  <td className="p-2 text-right">
                                    {new Intl.NumberFormat("id-ID").format(
                                      inst.interestAmount,
                                    )}
                                  </td>
                                  <td className="p-2 text-right font-medium">
                                    {new Intl.NumberFormat("id-ID").format(
                                      inst.totalPayment,
                                    )}
                                  </td>
                                  <td className="p-2 text-right text-blue-700 font-medium">
                                    {new Intl.NumberFormat("id-ID").format(
                                      inst.paidAmount || 0,
                                    )}
                                  </td>
                                  <td className="p-2 text-right text-red-700 font-medium">
                                    {new Intl.NumberFormat("id-ID").format(
                                      inst.totalPayment -
                                        (inst.paidAmount || 0),
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        inst.status === "Lunas"
                                          ? "bg-green-200 text-green-800"
                                          : inst.status === "Sebagian"
                                            ? "bg-blue-200 text-blue-800"
                                            : inst.status === "Terlambat"
                                              ? "bg-red-200 text-red-800"
                                              : "bg-yellow-200 text-yellow-800"
                                      }`}
                                    >
                                      {inst.status}
                                    </span>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">
                        💡 Cicilan dengan status "Belum Bayar" akan otomatis
                        terisi di form pembayaran
                      </p>
                    </div>
                  )}

                  {/* Payment Details */}
                  {selectedBorrower && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-sm text-green-900">
                        💰 Detail Pembayaran
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="principal_amount">Pokok (Rp)</Label>
                          <Input
                            id="principal_amount"
                            type="number"
                            value={principalAmount}
                            onChange={(e) => setPrincipalAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interest_amount">Bunga (Rp)</Label>
                          <Input
                            id="interest_amount"
                            type="number"
                            value={interestAmount}
                            onChange={(e) => setInterestAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Late Fee Calculation Section */}
                      <div className="space-y-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm text-red-900">
                          ⏰ Perhitungan Denda Keterlambatan
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="actual_payment_date">
                              Tanggal Pembayaran Aktual
                            </Label>
                            <Input
                              id="actual_payment_date"
                              type="date"
                              value={actualPaymentDate}
                              onChange={(e) => {
                                setActualPaymentDate(e.target.value);
                                // Auto-calculate days late and late fee
                                if (e.target.value && tanggal) {
                                  const due = new Date(tanggal);
                                  const payment = new Date(e.target.value);
                                  const days = Math.floor(
                                    (payment.getTime() - due.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  );
                                  const daysLateCalc = Math.max(0, days);
                                  setDaysLate(daysLateCalc.toString());

                                  // Calculate late fee
                                  if (daysLateCalc > 0 && principalAmount) {
                                    const installmentAmount =
                                      Number(principalAmount) +
                                      Number(interestAmount);
                                    const fee =
                                      installmentAmount *
                                      (Number(lateFeePercentage) / 100) *
                                      daysLateCalc;
                                    setLateFee(fee.toFixed(2));
                                  } else {
                                    setLateFee("0");
                                  }
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="late_fee_percentage_display">
                              Persentase Denda per Hari (%)
                            </Label>
                            <Input
                              id="late_fee_percentage_display"
                              type="number"
                              step="0.01"
                              value={lateFeePercentage}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="days_late">
                              Hari Keterlambatan
                            </Label>
                            <Input
                              id="days_late"
                              type="number"
                              value={daysLate}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="late_fee">
                              Denda Keterlambatan (Rp)
                            </Label>
                            <Input
                              id="late_fee"
                              type="number"
                              value={lateFee}
                              onChange={(e) => setLateFee(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {Number(daysLate) > 0 && (
                          <div className="bg-red-100 p-3 rounded">
                            <p className="text-xs text-red-800">
                              📊 Perhitungan: (Pokok + Bunga) ×{" "}
                              {lateFeePercentage}% × {daysLate} hari = Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                Number(lateFee),
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tax Section */}
                      <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm text-blue-900">
                          🧾 Pajak
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tax_type_display">
                              Jenis Pajak
                            </Label>
                            <Input
                              id="tax_type_display"
                              type="text"
                              value={taxType}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tax_percentage_display">
                              Persentase Pajak (%)
                            </Label>
                            <Input
                              id="tax_percentage_display"
                              type="number"
                              step="0.01"
                              value={taxPercentage}
                              readOnly
                              className="bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tax_amount">
                              Jumlah Pajak (Rp)
                            </Label>
                            <Input
                              id="tax_amount"
                              type="number"
                              value={taxAmount}
                              onChange={(e) => setTaxAmount(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {Number(taxAmount) > 0 && (
                          <div className="bg-blue-100 p-3 rounded">
                            <p className="text-xs text-blue-800">
                              📊 Perhitungan: (Pokok + Bunga) × {taxPercentage}%
                              = Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                Number(taxAmount),
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-100 p-3 rounded">
                        <p className="text-sm font-semibold text-yellow-900">
                          Total Pembayaran: Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            Number(principalAmount) +
                              Number(interestAmount) +
                              Number(lateFee) +
                              Number(taxAmount),
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COA field removed - automatically filled based on category & service type */}

              {/* Sumber Penerimaan */}
              {shouldShowField("sumberPenerimaan") && (
                <div className="space-y-2">
                  <Label htmlFor="sumber_penerimaan">Sumber Penerimaan *</Label>
                  <Select
                    value={sumberPenerimaan}
                    onValueChange={setSumberPenerimaan}
                  >
                    <SelectTrigger id="sumber_penerimaan">
                      <SelectValue placeholder="-- pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pinjaman Bank">
                        Pinjaman Bank
                      </SelectItem>
                      <SelectItem value="Setoran Modal">
                        Setoran Modal
                      </SelectItem>
                      <SelectItem value="Pelunasan Piutang">
                        Pelunasan Piutang
                      </SelectItem>
                      <SelectItem value="Pendapatan Lain">
                        Pendapatan Lain
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Kategori Pengeluaran */}
              {shouldShowField("kategoriPengeluaran") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategori_pengeluaran">
                      Kategori Pengeluaran (Account Type) *
                    </Label>
                    <Select
                      value={selectedAccountType}
                      onValueChange={handleAccountTypeChange}
                    >
                      <SelectTrigger id="kategori_pengeluaran">
                        <SelectValue placeholder="-- pilih account type --" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaAccounts
                          .filter(
                            (acc, index, self) =>
                              self.findIndex(
                                (a) => a.account_type === acc.account_type,
                              ) === index,
                          )
                          .map((account) => (
                            <SelectItem
                              key={account.id}
                              value={account.account_type}
                            >
                              {account.account_type}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAccountType &&
                  Array.isArray(filteredAccountNames) &&
                  filteredAccountNames.length > 1 ? (
                    <div className="space-y-2">
                      <Label htmlFor="account_name">Account Name *</Label>

                      <Popover
                        open={openAccountNameCombobox}
                        onOpenChange={setOpenAccountNameCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAccountNameCombobox}
                            className="w-full justify-between"
                          >
                            {selectedAccountName || "-- pilih account name --"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-2">
                          <Input
                            placeholder="Cari account name..."
                            value={searchAccountName}
                            onChange={(e) =>
                              setSearchAccountName(e.target.value)
                            }
                            className="mb-2"
                          />
                          <div className="max-h-64 overflow-auto">
                            {filteredAccountNames
                              .filter((name) =>
                                name
                                  .toLowerCase()
                                  .includes(searchAccountName.toLowerCase()),
                              )
                              .map((name) => (
                                <div
                                  key={name}
                                  className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                  onClick={() => {
                                    handleAccountNameChangeAfterType(name);
                                    setOpenAccountNameCombobox(false);
                                    setSearchAccountName("");
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedAccountName === name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {name}
                                </div>
                              ))}
                            {filteredAccountNames.filter((name) =>
                              name
                                .toLowerCase()
                                .includes(searchAccountName.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                Tidak ada account name ditemukan.
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : null}

                  {/* Employee Selection - Show when Beban Gaji & Karyawan is selected */}
                  {selectedAccountName === "Beban Gaji & Karyawan" && (
                    <div className="space-y-2">
                      <Label htmlFor="employee_name">Nama Karyawan *</Label>

                      <Popover
                        open={openEmployeeCombobox}
                        onOpenChange={setOpenEmployeeCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openEmployeeCombobox}
                            className="w-full justify-between"
                          >
                            {selectedEmployee
                              ? employees.find(
                                  (emp) => emp.id === selectedEmployee,
                                )?.full_name
                              : "-- pilih karyawan --"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-2">
                          <Input
                            placeholder="Cari nama karyawan..."
                            value={searchEmployee}
                            onChange={(e) => setSearchEmployee(e.target.value)}
                            className="mb-2"
                          />
                          <div className="max-h-64 overflow-auto">
                            {employees
                              .filter((emp) =>
                                emp.full_name
                                  .toLowerCase()
                                  .includes(searchEmployee.toLowerCase()),
                              )
                              .map((emp) => (
                                <div
                                  key={emp.id}
                                  className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                  onClick={() => {
                                    setSelectedEmployee(emp.id);
                                    setOpenEmployeeCombobox(false);
                                    setSearchEmployee("");
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedEmployee === emp.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {emp.full_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {emp.email}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {employees.filter((emp) =>
                              emp.full_name
                                .toLowerCase()
                                .includes(searchEmployee.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                Tidak ada karyawan ditemukan.
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              )}

              {/* Pengeluaran Kas Additional Fields */}
              {jenisTransaksi === "Pengeluaran Kas" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jenis_pembayaran_pengeluaran">
                      Jenis Pembayaran *
                    </Label>
                    <Select
                      value={jenisPembayaranPengeluaran}
                      onValueChange={setJenisPembayaranPengeluaran}
                    >
                      <SelectTrigger id="jenis_pembayaran_pengeluaran">
                        <SelectValue placeholder="-- pilih --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama_karyawan_pengeluaran">
                      Nama Karyawan *
                    </Label>
                    <Input
                      id="nama_karyawan_pengeluaran"
                      value={namaKaryawanPengeluaran}
                      onChange={(e) =>
                        setNamaKaryawanPengeluaran(e.target.value)
                      }
                      placeholder="Masukkan nama karyawan"
                    />
                  </div>
                </div>
              )}

              {/* Mutasi Kas Fields */}
              {shouldShowField("kasSumber") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kas_sumber">Kas Sumber *</Label>
                    <Select value={kasSumber} onValueChange={setKasSumber}>
                      <SelectTrigger id="kas_sumber">
                        <SelectValue placeholder="-- pilih --" />
                      </SelectTrigger>
                      <SelectContent>
                        {coa
                          .filter((c) => c.account_code.startsWith("1-11"))
                          .map((c) => (
                            <SelectItem
                              key={c.account_code}
                              value={c.account_code}
                            >
                              {c.account_code} — {c.account_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {shouldShowField("kasTujuan") && (
                    <div className="space-y-2">
                      <Label htmlFor="kas_tujuan">Kas Tujuan *</Label>
                      <Select value={kasTujuan} onValueChange={setKasTujuan}>
                        <SelectTrigger id="kas_tujuan">
                          <SelectValue placeholder="-- pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          {coa
                            .filter((c) => c.account_code.startsWith("1-11"))
                            .map((c) => (
                              <SelectItem
                                key={c.account_code}
                                value={c.account_code}
                              >
                                {c.account_code} — {c.account_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* NOMINAL + DATE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nominal">
                    Nominal *
                    {jenisTransaksi === "Penjualan Barang" &&
                      itemName &&
                      description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Otomatis dari Quantity × Harga Jual)
                        </span>
                      )}
                    {jenisTransaksi === "Pembelian Barang" &&
                      itemName &&
                      description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Otomatis dari (Quantity × Harga Beli) + PPN)
                        </span>
                      )}
                  </Label>
                  <Input
                    id="nominal"
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="0"
                    readOnly={
                      (jenisTransaksi === "Penjualan Barang" &&
                        itemName &&
                        description) ||
                      (jenisTransaksi === "Pembelian Barang" &&
                        itemName &&
                        description)
                    }
                    className={
                      (jenisTransaksi === "Penjualan Barang" &&
                        itemName &&
                        description) ||
                      (jenisTransaksi === "Pembelian Barang" &&
                        itemName &&
                        description)
                        ? "bg-gray-100"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                  />
                </div>
              </div>

              {/* DESC */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masukkan deskripsi transaksi"
                  rows={3}
                />
              </div>

              {/* SCAN OCR BUKTI */}
              <div className="space-y-2">
                <Label>Scan OCR Bukti</Label>
                <OCRScanButton
                  onImageUploaded={(url, filePath) => {
                    toast({
                      title: "Gambar berhasil diupload",
                      description: "Sedang memproses OCR...",
                    });
                  }}
                  onTextExtracted={(text) => {
                    console.log("📄 OCR Text extracted:", text);
                    const parsed = parseOCR(text);
                    if (parsed) {
                      setOcrAppliedData(parsed);
                      if (parsed.nominal) setNominal(parsed.nominal.toString());
                      if (parsed.tanggal) setTanggal(parsed.tanggal);
                      if (parsed.description) setDescription(parsed.description);
                      toast({
                        title: "✅ OCR Berhasil",
                        description: "Data telah diisi otomatis",
                      });
                    }
                  }}
                  bucketName="documents"
                  folderPath="transaksi-bukti"
                />
                {buktiFile && (
                  <p className="text-sm text-slate-600">
                    File terpilih: {buktiFile.name}
                  </p>
                )}
              </div>

              {/* OCR BREAKDOWN SECTION */}
              {ocrAppliedData && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      📋 Hasil Scan OCR
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOcrAppliedData(null)}
                      className="text-slate-500 hover:text-red-500"
                    >
                      ✕ Tutup
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    {ocrAppliedData.imagePreview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Gambar Receipt</Label>
                        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                          <img
                            src={ocrAppliedData.imagePreview}
                            alt="Receipt OCR"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Applied Fields */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Data yang Diekstrak</Label>
                      <div className="bg-white rounded-lg p-3 border shadow-sm space-y-2">
                        {ocrAppliedData.appliedFields.map((field, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 border-b last:border-0">
                            <span className="text-sm text-slate-600">{field.field}</span>
                            <span className="text-sm font-medium text-slate-800">{field.value}</span>
                          </div>
                        ))}
                        {ocrAppliedData.appliedFields.length === 0 && (
                          <p className="text-sm text-slate-500 italic">Tidak ada data yang diekstrak</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {ocrAppliedData.items.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Daftar Item</Label>
                      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="text-left p-2 font-medium text-slate-700">Nama Item</th>
                              <th className="text-center p-2 font-medium text-slate-700">Qty</th>
                              <th className="text-right p-2 font-medium text-slate-700">Harga</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ocrAppliedData.items.map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="p-2 text-slate-800">{item.name}</td>
                                <td className="p-2 text-center text-slate-600">{item.qty}</td>
                                <td className="p-2 text-right text-slate-800">
                                  Rp {item.price.toLocaleString("id-ID")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Raw Text Preview (Collapsible) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                      📄 Lihat Teks Mentah OCR
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto text-slate-600">
                      {ocrAppliedData.extractedText || "Tidak ada teks"}
                    </div>
                  </details>
                </div>
              )}

              {/* UPLOAD BUKTI FOTO */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="bukti-foto" className="text-base font-semibold">
                  Bukti Foto Transaksi
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="bukti-foto"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setBuktiFile(file);
                      
                      // Upload to Supabase Storage
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const filePath = `transaksi-bukti/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                          .from('documents')
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                          .from('documents')
                          .getPublicUrl(filePath);

                        setBuktiUrl(publicUrl);
                        
                        toast({
                          title: "✅ Bukti berhasil diupload",
                          description: "File bukti transaksi telah tersimpan",
                        });
                      } catch (error: any) {
                        console.error('Upload error:', error);
                        toast({
                          title: "❌ Upload gagal",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex-1"
                  />
                  {buktiFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBuktiFile(null);
                        setBuktiUrl("");
                        // Reset file input
                        const fileInput = document.getElementById('bukti-foto') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Preview Bukti */}
                {buktiUrl && buktiFile && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {buktiFile.type.startsWith('image/') ? (
                          <img
                            src={buktiUrl}
                            alt="Bukti Transaksi"
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded border flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Bukti berhasil diupload
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {buktiFile.name}
                        </p>
                        <a
                          href={buktiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Lihat file →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-slate-500">
                  Upload foto bukti transaksi (struk, invoice, kwitansi, dll). Format: JPG, PNG, atau PDF
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  Preview Jurnal
                </Button>

                <Button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  🛒 Tambah ke Keranjang
                </Button>

                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Simpan Transaksi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CART VIEW */}
      {showCart && (
        <Card className="container mx-auto px-4 bg-white rounded-xl shadow-lg border border-slate-200 mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              🛒 Keranjang Transaksi ({cart.length} item)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Keranjang kosong</p>
                <p className="text-sm mt-2">
                  Tambahkan transaksi dari form di atas
                </p>
              </div>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Checkbox
                    id="select-all"
                    checked={cart.every((item) => item.selected)}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Pilih Semua ({cart.filter((item) => item.selected).length}{" "}
                    dipilih)
                  </label>
                </div>

                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 flex-1">
                          {/* Checkbox */}
                          <div className="pt-1">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={item.selected || false}
                              onCheckedChange={() =>
                                toggleCartItemSelection(item.id)
                              }
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg">
                                #{index + 1}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {item.jenisTransaksi}
                              </span>
                              {item.paymentType && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                  {item.paymentType === "cash"
                                    ? "Tunai"
                                    : "Kredit"}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {item.itemName && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Item:
                                  </span>
                                  <span className="ml-2">{item.itemName}</span>
                                </div>
                              )}
                              {item.description && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Deskripsi:
                                  </span>
                                  <span className="ml-2">
                                    {item.description}
                                  </span>
                                </div>
                              )}
                              {item.kategori && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Kategori:
                                  </span>
                                  <span className="ml-2">{item.kategori}</span>
                                </div>
                              )}
                              {item.jenisLayanan && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Layanan:
                                  </span>
                                  <span className="ml-2">
                                    {item.jenisLayanan}
                                  </span>
                                </div>
                              )}
                              {item.customer && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Customer:
                                  </span>
                                  <span className="ml-2">{item.customer}</span>
                                </div>
                              )}
                              {item.supplier && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Supplier:
                                  </span>
                                  <span className="ml-2">{item.supplier}</span>
                                </div>
                              )}
                              {item.quantity && item.quantity !== "1" && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Qty:
                                  </span>
                                  <span className="ml-2">{item.quantity}</span>
                                </div>
                              )}
                              {item.hargaJual && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Harga Jual/Unit:
                                  </span>
                                  <span className="ml-2">
                                    Rp{" "}
                                    {new Intl.NumberFormat("id-ID").format(
                                      Number(item.hargaJual),
                                    )}
                                  </span>
                                </div>
                              )}
                              {item.hargaBeli && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Harga Beli/Unit:
                                  </span>
                                  <span className="ml-2">
                                    Rp{" "}
                                    {new Intl.NumberFormat("id-ID").format(
                                      Number(item.hargaBeli),
                                    )}
                                  </span>
                                </div>
                              )}
                              {item.ppnAmount && Number(item.ppnAmount) > 0 && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    PPN ({item.ppnPercentage}%):
                                  </span>
                                  <span className="ml-2">
                                    Rp{" "}
                                    {new Intl.NumberFormat("id-ID").format(
                                      Number(item.ppnAmount),
                                    )}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-600">
                                  Tanggal:
                                </span>
                                <span className="ml-2">{item.tanggal}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">
                                  Total: Rp{" "}
                                  {new Intl.NumberFormat("id-ID").format(
                                    Number(item.nominal),
                                  )}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">
                                    Keterangan:
                                  </span>{" "}
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="ml-4"
                        >
                          🗑️ Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Transaksi: {cart.length} item (
                        {cart.filter((item) => item.selected).length} dipilih)
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Total Nominal: Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          cart
                            .filter((item) => item.selected)
                            .reduce(
                              (sum, item) => sum + Number(item.nominal),
                              0,
                            ),
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCart(false)}
                      >
                        ← Kembali ke Form
                      </Button>
                      <Button
                        onClick={handleCheckoutCart}
                        disabled={
                          isConfirming ||
                          cart.filter((item) => item.selected).length === 0
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isConfirming
                          ? "Memproses..."
                          : `✅ Checkout Semua (${cart.filter((item) => item.selected).length})`}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODALS */}
      <AddItemModal
        open={openItemModal}
        onClose={() => setOpenItemModal(false)}
        onAdded={loadItems}
      />

      <AddBrandModal
        open={openBrandModal}
        onClose={() => setOpenBrandModal(false)}
        onAdded={() => {}}
      />

      <AddStockItemModal
        open={openStockItemModal}
        onClose={() => setOpenStockItemModal(false)}
        onAdded={() => {
          loadItems();
          fetchStockInfo(itemName, description);
        }}
      />

      <BorrowerForm
        open={openBorrowerModal}
        onClose={() => setOpenBorrowerModal(false)}
        onAdded={loadBorrowers}
      />

      <JournalPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        lines={previewLines}
        memo={previewMemo}
        onConfirm={handleConfirmSave}
        isLoading={isConfirming}
      />

      {/* OCR Scanner Modal */}
      <Dialog open={showOCRModal} onOpenChange={setShowOCRModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Scan OCR - Upload Receipt
            </DialogTitle>
            <DialogDescription>
              Upload gambar receipt untuk ekstrak data otomatis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {ocrFilePreview ? (
                <div className="space-y-4">
                  <img
                    src={ocrFilePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => ocrFileInputRef.current?.click()}
                  >
                    Ganti Gambar
                  </Button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => ocrFileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Klik untuk upload gambar receipt
                  </p>
                </div>
              )}
              <input
                ref={ocrFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleOCRFileChange}
              />
            </div>

            {/* Process Button */}
            {ocrFile && !ocrParsedData && (
              <Button
                onClick={handleProcessOCR}
                disabled={ocrLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {ocrLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses OCR...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Proses OCR
                  </>
                )}
              </Button>
            )}

            {/* Extracted Text */}
            {ocrExtractedText && (
              <div className="space-y-2">
                <Label>Teks yang Diekstrak:</Label>
                <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">{ocrExtractedText}</pre>
                </div>
              </div>
            )}

            {/* Parsed Data Preview */}
            {ocrParsedData && (
              <div className="space-y-2">
                <Label>Data yang Terdeteksi:</Label>
                <div className="bg-green-50 p-3 rounded-lg space-y-1">
                  {ocrParsedData.nama && (
                    <p className="text-sm"><strong>Nama/Merchant:</strong> {ocrParsedData.nama}</p>
                  )}
                  {ocrParsedData.alamat && (
                    <p className="text-sm"><strong>Alamat:</strong> {ocrParsedData.alamat}</p>
                  )}
                  {ocrParsedData.npwp && (
                    <p className="text-sm"><strong>NPWP:</strong> {ocrParsedData.npwp}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOCRModal(false);
                  setOcrFile(null);
                  setOcrFilePreview(null);
                  setOcrExtractedText("");
                  setOcrParsedData(null);
                }}
                disabled={ocrLoading}
              >
                Batal
              </Button>
              {ocrParsedData && (
                <Button
                  onClick={handleUseOCRResult}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Gunakan Hasil OCR
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Transaksi Section */}

      <div className="mt-8">
        <ApprovalTransaksi onApprovalComplete={loadTransactions} />
      </div>
    </div>
  );
}
