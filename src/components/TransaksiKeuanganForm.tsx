import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AddItemModal from "./AddItemModal";
import AddBrandModal from "./AddBrandModal";
import AddStockItemModal from "./AddStockItemModal";
import BorrowerForm from "./BorrowerForm";
import JournalPreviewModal from "./JournalPreviewModal";
import ApprovalTransaksi from "./ApprovalTransaksi";
import { generateJournal } from "./journalRules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Plus, Search, Receipt, TrendingUp, TrendingDown, DollarSign, Filter, CalendarIcon, ArrowLeft } from "lucide-react";
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
              <th className="border border-slate-300 px-4 py-2 text-left">Tanggal</th>
              <th className="border border-slate-300 px-4 py-2 text-left">Journal Ref</th>
              <th className="border border-slate-300 px-4 py-2 text-left">Jenis Transaksi</th>
              <th className="border border-slate-300 px-4 py-2 text-left">Debit Account</th>
              <th className="border border-slate-300 px-4 py-2 text-left">Credit Account</th>
              <th className="border border-slate-300 px-4 py-2 text-right">Debit</th>
              <th className="border border-slate-300 px-4 py-2 text-right">Credit</th>
              <th className="border border-slate-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50">
                <td className="border border-slate-300 px-4 py-2">{txn.tanggal}</td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">{txn.journal_ref}</td>
                <td className="border border-slate-300 px-4 py-2">{txn.jenis_transaksi}</td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">{txn.debit_account}</td>
                <td className="border border-slate-300 px-4 py-2 font-mono text-sm">{txn.credit_account}</td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  {txn.debit ? new Intl.NumberFormat("id-ID").format(txn.debit) : "-"}
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  {txn.credit ? new Intl.NumberFormat("id-ID").format(txn.credit) : "-"}
                </td>
                <td className="border border-slate-300 px-4 py-2">{txn.description}</td>
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

  const [items, setItems] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [coa, setCoa] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [consignees, setConsignees] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [kasAccounts, setKasAccounts] = useState<any[]>([]);

  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
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

  const [nominal, setNominal] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [hargaJual, setHargaJual] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [ppnPercentage, setPpnPercentage] = useState("11");
  const [ppnAmount, setPpnAmount] = useState("0");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
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
  const [previewTanggal, setPreviewTanggal] = useState("");
  const [previewIsCashRelated, setPreviewIsCashRelated] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Conditional fields state
  const [sumberPenerimaan, setSumberPenerimaan] = useState("");
  const [kasSumber, setKasSumber] = useState("");
  const [kasTujuan, setKasTujuan] = useState("");
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState("");

  const { toast } = useToast();

  /** Conditional Logic - Determine field visibility and state */
  const shouldShowField = (fieldName: string): boolean => {
    switch (fieldName) {
      case "kategoriLayanan":
      case "jenisLayanan":
        return jenisTransaksi === "Penjualan Jasa";
      
      case "itemBarang":
      case "brand":
        return ["Penjualan Barang", "Pembelian Barang"].includes(jenisTransaksi);
      
      case "akunCoa":
        return !["Penerimaan Kas", "Pengeluaran Kas", "Mutasi Kas", "Pelunasan Piutang", "Pembayaran Hutang", "Pinjaman Masuk", "Pelunasan Pinjaman"].includes(jenisTransaksi);
      
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
      return ["Penerimaan Kas", "Pelunasan Piutang", "Pembayaran Hutang"].includes(jenisTransaksi);
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
      if (["Penerimaan Kas", "Pelunasan Piutang", "Pembayaran Hutang"].includes(jenisTransaksi)) {
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
          "Unit Disewakan"
        ];
      } else if (transactionType === "Penjualan Barang") {
        // Barang/Persediaan categories
        allowedCategories = ["Persediaan", "Barang"];
      } else if (transactionType === "Pembelian Barang" || transactionType === "Pembelian Jasa") {
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
          "Barang"
        ];
      } else if (transactionType === "Pengeluaran Kas") {
        // Expense categories
        allowedCategories = ["Beban"];
      } else if (transactionType === "Pinjaman Masuk" || transactionType === "Pembayaran Pinjaman") {
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
        new Set(data?.map((item) => item.service_category).filter(Boolean))
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
        loadBrands(),
        loadSuppliers(),
        loadCustomers(),
        loadConsignees(),
        loadBanks(),
        loadKasAccounts(),
        loadBorrowers(),
        loadTransactions()
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
      suppliers: suppliers.length
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
              const nextUnpaid = installments.find(inst => inst.status === "Belum Bayar");
              if (nextUnpaid) {
                setPrincipalAmount(nextUnpaid.principal_amount?.toString() || "0");
                setInterestAmount(nextUnpaid.interest_amount?.toString() || "0");
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

  // Filter brands based on selected item
  useEffect(() => {
    const filterBrandsByItem = async () => {
      if (!itemName) {
        setFilteredBrands(brands);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("product_reference")
          .select("brand")
          .eq("item_name", itemName);

        if (error) throw error;

        if (data && data.length > 0) {
          const brandNames = data.map(item => item.brand).filter(Boolean);
          const filtered = brands.filter(b => brandNames.includes(b.brand_name));
          setFilteredBrands(filtered);
        } else {
          setFilteredBrands(brands);
        }
      } catch (error) {
        console.error("Error filtering brands:", error);
        setFilteredBrands(brands);
      }
    };

    filterBrandsByItem();
  }, [itemName, brands]);

  const loadItems = async () => {
    const { data } = await supabase.from("item_master").select("*");
    setItems(data || []);
  };

  const loadBrands = async () => {
    const { data } = await supabase.from("brands").select("*");
    setBrands(data || []);
    setFilteredBrands(data || []); // Initialize filtered brands
  };

  // Fetch stock information when item and brand are selected
  const fetchStockInfo = async (itemName: string, brand: string) => {
    if (!itemName || !brand) {
      setStockInfo(null);
      return;
    }

    setLoadingStock(true);
    try {
      const { data, error } = await supabase
        .from("stock")
        .select(`
          *,
          warehouses!warehouse_id(name, code, address)
        `)
        .eq("item_name", itemName)
        .eq("brand", brand)
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

  // Update stock info when item or brand changes
  useEffect(() => {
    fetchStockInfo(itemName, brand);
  }, [itemName, brand]);

  const loadSuppliers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("suppliers").select("*");
      if (error) throw error;
      console.log("✅ Suppliers loaded:", data);
      setSuppliers(data || []);
    } catch (err) {
      console.error("❌ Error loading suppliers:", err);
      setSuppliers([]);
    }
  };

  const loadCustomers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      console.log("✅ Customers loaded:", data);
      console.log("Total customers:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Sample customer:", data[0]);
      }
      setCustomers(data || []);
    } catch (err) {
      console.error("❌ Error loading customers:", err);
      setCustomers([]);
    }
  };

  const loadConsignees = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("consignees").select("*");
      if (error) throw error;
      console.log("✅ Consignees loaded:", data);
      setConsignees(data || []);
    } catch (err) {
      console.error("❌ Error loading consignees:", err);
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
      console.log("✅ Banks loaded:", data);
      setBanks(data || []);
    } catch (err) {
      console.error("❌ Error loading banks:", err);
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
      console.log("✅ Kas accounts loaded:", data);
      setKasAccounts(data || []);
    } catch (err) {
      console.error("❌ Error loading kas accounts:", err);
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
  const loadTransactions = async (): Promise<void> => {
    try {
      setLoadingTransactions(true);
      console.log("🔄 Loading transactions from all tables...");
      
      // Load from kas_transaksi (only approved transactions)
      const { data: kasData, error: kasError } = await supabase
        .from("kas_transaksi")
        .select("*")
        .or("approval_status.eq.approved,approval_status.is.null")
        .order("tanggal", { ascending: false });
      
      if (kasError) {
        console.error("❌ Error loading kas_transaksi:", kasError);
      }
      
      // Load from cash_disbursement (only approved transactions)
      const { data: cashDisbursementData, error: cashDisbursementError } = await supabase
        .from("cash_disbursement")
        .select("*")
        .eq("approval_status", "approved")
        .order("transaction_date", { ascending: false });
      
      if (cashDisbursementError) {
        console.error("❌ Error loading cash_disbursement:", cashDisbursementError);
      }
      
      // Load from purchase_transactions (only approved transactions)
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchase_transactions")
        .select("*")
        .or("approval_status.eq.approved,approval_status.is.null")
        .order("transaction_date", { ascending: false });
      
      if (purchaseError) {
        console.error("❌ Error loading purchase_transactions:", purchaseError);
      }
      
      // Load from sales_transactions
      const { data: salesData, error: salesError } = await supabase
        .from("sales_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      
      if (salesError) {
        console.error("❌ Error loading sales_transactions:", salesError);
      }
      
      // Load from internal_usage
      const { data: internalData, error: internalError } = await supabase
        .from("internal_usage")
        .select("*")
        .order("usage_date", { ascending: false });
      
      if (internalError) {
        console.error("❌ Error loading internal_usage:", internalError);
      }
      
      // Note: expenses and loans tables are not used in this view
      
      console.log("📊 Query results:", {
        kas: kasData?.length || 0,
        cashDisbursement: cashDisbursementData?.length || 0,
        purchase: purchaseData?.length || 0,
        sales: salesData?.length || 0,
        internal: internalData?.length || 0
      });
      
      // Combine all transactions with source identifier
      const allTransactions = [
        ...(kasData || []).map(t => ({ ...t, source: 'kas_transaksi', tanggal: t.tanggal })),
        ...(cashDisbursementData || []).map(t => ({ 
          ...t, 
          source: 'cash_disbursement', 
          tanggal: t.transaction_date,
          nominal: t.amount,
          keterangan: t.description,
          payment_type: 'Pengeluaran Kas',
          document_number: t.document_number
        })),
        ...(purchaseData || []).map(t => ({ ...t, source: 'purchase_transactions', tanggal: t.transaction_date, jenis: 'Pembelian', nominal: t.total_amount })),
        ...(salesData || []).map(t => ({ ...t, source: 'sales_transactions', tanggal: t.transaction_date, jenis: 'Penjualan', nominal: t.total_amount })),
        ...(internalData || []).map(t => ({ ...t, source: 'internal_usage', tanggal: t.usage_date, jenis: 'Pemakaian Internal', nominal: t.total_value }))
      ];
      
      // Sort by date descending
      allTransactions.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      
      setTransactions(allTransactions);
      console.log("✅ Total transactions loaded:", allTransactions.length);
      
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
      console.error("❌ Exception:", err);
      setTransactions([]);
      toast({
        title: "❌ Error",
        description: err.message || "Gagal memuat transaksi",
        variant: "destructive"
      });
    } finally {
      setLoadingTransactions(false);
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
      const monthlyPayment = monthlyRate === 0 
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
          dueDate: dueDate.toISOString().split('T')[0],
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
        dueDate: typeof dueDate === 'string' ? dueDate : dueDate.toISOString().split('T')[0],
        principalAmount: principal,
        interestAmount: totalInterest,
        totalPayment: principal + totalInterest,
        remainingBalance: 0,
      });
    }

    setInstallmentSchedule(schedule);
  };

  // Calculate late fee
  const calculateLateFee = (dueDate: string, paymentDate: string, amount: number) => {
    const due = new Date(dueDate);
    const payment = new Date(paymentDate);
    const daysLate = Math.floor((payment.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLate <= 0) return 0;
    
    // 0.1% per day late (configurable)
    const dailyPenaltyRate = 0.001;
    return amount * dailyPenaltyRate * daysLate;
  };

  // Recalculate schedule when loan parameters change
  useEffect(() => {
    if (jenisTransaksi === "Pinjaman Masuk" || jenisTransaksi === "Pembayaran Pinjaman") {
      calculateInstallmentSchedule();
    }
  }, [nominal, loanTermMonths, interestRate, paymentSchedule, tanggal, maturityDate]);

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
        console.log("✅ Kas accounts loaded:", kasAccounts);
      } else {
        // Normal flow for other categories
        const { data, error } = await supabase
          .from("coa_category_mapping")
          .select("service_type")
          .eq("service_category", category)
          .eq("is_active", true);

        if (error) throw error;

        const uniqueTypes = Array.from(
          new Set(data?.map((item) => item.service_type).filter(Boolean))
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
      if (paymentType === "Penerimaan Kas" || paymentType === "Pengeluaran Kas") {
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
      else if (jenisTransaksi === "Penjualan Jasa" || jenisTransaksi === "Penjualan Barang") {
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
      else if (jenisTransaksi === "Pembelian" || jenisTransaksi === "Beban Operasional") {
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
            accountCode = mapping.asset_account_code || mapping.cogs_account_code;
          } else {
            // For expenses: use COGS/expense account
            accountCode = mapping.cogs_account_code;
          }
        }
      }
      
      // Loan Engine - Loan transactions
      else if (jenisTransaksi === "Pinjaman Masuk" || jenisTransaksi === "Pembayaran Pinjaman") {
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
        ["Pendapatan", "Aset", "Ekuitas"].includes(c.account_type)
      );
    }

    if (paymentType === "Pengeluaran Kas") {
      filtered = filtered.filter((c) =>
        ["Beban", "HPP", "Kewajiban"].includes(c.account_type)
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
        kasSumber: ""
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
        normalizedInput.nominal * 0.7
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
    let extras = { needs_hpp: false, hppFilter: null as any, is_cash_related: false };

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
        else if (sumber === "Setoran Modal") creditFilter = { trans_type: "equity" };
        else if (sumber === "Pelunasan Piutang") creditFilter = { usage_role: "piutang" };
        else creditFilter = { usage_role: "other" };
        extras.is_cash_related = true;
        break;

      case "Pengeluaran Kas":
        debitFilter = kategori === "Beban Kendaraan" 
          ? { usage_role: "beban_kendaraan" } 
          : { usage_role: "beban_operasional" };
        creditFilter = { flow_type: "cash" };
        extras.is_cash_related = true;
        break;

      case "Pembelian Barang":
        debitFilter = { usage_role: "inventory" };
        creditFilter = payment === "cash" 
          ? { flow_type: "cash" } 
          : { usage_role: "hutang" };
        extras.is_cash_related = payment === "cash";
        break;

      case "Pembelian Jasa":
        debitFilter = { usage_role: "beban_operasional" };
        creditFilter = payment === "cash" 
          ? { flow_type: "cash" } 
          : { usage_role: "hutang" };
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
          is_cash_related: true 
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
    mappingRule: any
  ) => {
    const toUpsert: any[] = [];
    let resultDebit = debitAccount;
    let resultCredit = creditAccount;

    if (!debitAccount) {
      // Create placeholder debit account
      const code = mappingRule.special === "mutasi" 
        ? mappingRule.debit_account_code 
        : "1-1199"; // Placeholder cash account
      
      const placeholder = {
        account_code: code,
        account_name: "AUTO-PLACEHOLDER-DEBIT",
        account_type: "Aset",
        trans_type: "asset",
        flow_type: "cash",
        usage_role: "kas",
        is_active: true
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
        is_active: true
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
          creditAccount: resultCredit 
        };
      } catch (error) {
        console.error("Error in fallbackAndUpsertCOA:", error);
      }
    }

    return { 
      upserted: false, 
      debitAccount: resultDebit, 
      creditAccount: resultCredit 
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
    hppAmount: number = 0
  ) => {
    const lines: any[] = [
      { 
        account_code: debitAccount.account_code, 
        account_name: debitAccount.account_name, 
        dc: "D", 
        amount: nominal 
      },
      { 
        account_code: creditAccount.account_code, 
        account_name: creditAccount.account_name, 
        dc: "C", 
        amount: nominal 
      }
    ];

    // Add HPP lines if needed (for Penjualan Barang)
    if (hppEntry) {
      lines.push({ 
        account_code: hppEntry.debit, 
        account_name: hppEntry.debitName || "HPP", 
        dc: "D", 
        amount: hppAmount 
      });
      lines.push({ 
        account_code: hppEntry.credit, 
        account_name: hppEntry.creditName || "Persediaan", 
        dc: "C", 
        amount: hppAmount 
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
    Object.keys(filter).forEach(key => {
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
          hpp_entry: null
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
        mappingRule
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
        const hppDebitAccount = await loadCOAByFilter(mappingRule.extras.hppFilter);
        const hppCreditAccount = await loadCOAByFilter({ usage_role: "inventory" });
        
        if (hppDebitAccount && hppCreditAccount) {
          hppEntry = {
            debit: hppDebitAccount.account_code,
            credit: hppCreditAccount.account_code,
            debitName: hppDebitAccount.account_name,
            creditName: hppCreditAccount.account_name
          };
        }
      }

      return {
        debit: debitAccount?.account_code || "",
        credit: creditAccount?.account_code || "",
        debitName: debitAccount?.account_name || "",
        creditName: creditAccount?.account_name || "",
        is_cash_related: mappingRule.extras.is_cash_related,
        hpp_entry: hppEntry
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
    if (!form.nominal || Number(form.nominal) <= 0) errors.push("nominal harus > 0");
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
      kasSumber: form.kasSumber || ""
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
        kasSumber: kasSumber
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
        normalizedInput.nominal * 0.7 // HPP amount (70% of sales as example)
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

  /** Confirm and Save Journal Entries */
  const handleConfirmSave = async () => {
    try {
      setIsConfirming(true);

      // Generate journal reference
      const journalRef = `JRN-${Date.now()}`;

      // Step 6: Create Journal Entries
      const mainDebitLine = previewLines.find(l => l.dc === "D");
      const mainCreditLine = previewLines.find(l => l.dc === "C");

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
          console.error("❌ Journal Entry Error:", error);
          throw new Error(`Journal Entry: ${error.message}`);
        }
        console.log("✅ Journal Entry saved:", data);
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
          console.error("❌ HPP Entry Error:", error);
          throw new Error(`HPP Entry: ${error.message}`);
        }
        console.log("✅ HPP Entry saved:", data);
      }

      // Step 8: Create Cash Book if needed (Penerimaan/Pengeluaran Kas)
      if (jenisTransaksi === "Penerimaan Kas" || jenisTransaksi === "Pengeluaran Kas") {
        const cashLine = previewLines.find(
          l => l.account_code.startsWith("1-11") // Cash/Bank accounts
        );

        if (cashLine) {
          // Upload bukti file if exists
          let uploadedBuktiUrl = "";
          if (buktiFile) {
            const fileExt = buktiFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `bukti-transaksi/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, buktiFile);

            if (uploadError) {
              console.error("❌ File Upload Error:", uploadError);
              throw new Error(`File Upload: ${uploadError.message}`);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filePath);
            
            uploadedBuktiUrl = urlData.publicUrl;
            console.log("✅ File uploaded:", uploadedBuktiUrl);
          }

          // Generate document number
          const docNumber = `${jenisTransaksi === "Penerimaan Kas" ? "PKM" : "PKK"}-${Date.now()}`;
          
          const { data, error } = await supabase.from("kas_transaksi").insert({
            tanggal: previewTanggal,
            document_number: docNumber,
            payment_type: jenisTransaksi, // "Penerimaan Kas" or "Pengeluaran Kas"
            account_number: cashLine.account_code,
            account_name: cashLine.account_name,
            nominal: cashLine.amount,
            keterangan: previewMemo,
            bukti: uploadedBuktiUrl || null,
          });

          if (error) {
            console.error("❌ Cash Book Error:", error);
            throw new Error(`Cash Book: ${error.message}`);
          }
          console.log("✅ Cash Book saved:", data);
        }
      }

      // Step 9: Create Sales Transaction if Penjualan Barang or Penjualan Jasa
      if (jenisTransaksi === "Penjualan Barang" || jenisTransaksi === "Penjualan Jasa") {
        const mainDebitLine = previewLines.find(l => l.dc === "D");
        const mainCreditLine = previewLines.find(l => l.dc === "C");
        
        const unitPrice = Number(nominal) || 0;
        const quantity = 1; // Default quantity, can be made dynamic
        const subtotal = unitPrice * quantity;
        const taxPercentage = 11;
        const taxAmount = subtotal * (taxPercentage / 100);
        const totalAmount = subtotal + taxAmount;

        if (jenisTransaksi === "Penjualan Barang") {
          // Get stock info for cost calculation
          const { data: stockData } = await supabase
            .from("stock")
            .select("quantity, cost_per_unit")
            .eq("item_name", itemName)
            .eq("brand", brand)
            .maybeSingle();

          const { data: salesData, error: salesError } = await supabase
            .from("sales_transactions")
            .insert({
              transaction_date: previewTanggal,
              transaction_type: "Barang",
              item_name: itemName,
              brand: brand,
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
              notes: description,
              journal_ref: journalRef,
            });

          if (salesError) {
            throw new Error(`Sales Transaction: ${salesError.message}`);
          }
        } 
        else if (jenisTransaksi === "Penjualan Jasa") {
          // For service sales, no stock tracking needed
          const { data: salesData, error: salesError } = await supabase
            .from("sales_transactions")
            .insert({
              transaction_date: previewTanggal,
              transaction_type: "Jasa",
              item_name: `${kategori} - ${jenisLayanan}`,
              brand: null,
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
              notes: description,
              journal_ref: journalRef,
            });

          if (salesError) {
            throw new Error(`Sales Transaction: ${salesError.message}`);
          }
        }
      }

      toast({
        title: "✅ Berhasil",
        description: `Transaksi berhasil disimpan. Ref: ${journalRef}`,
      });

      // Reset form and close modal
      resetForm();
      setPreviewOpen(false);
      
      // Refresh transactions list if in report view
      if (showReport) {
        await loadTransactions();
      }
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
    setBrand("");
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

    // Create cart item
    const cartItem = {
      id: Date.now().toString(),
      jenisTransaksi,
      paymentType,
      kategori,
      jenisLayanan,
      itemName,
      brand,
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
    setCart(cart.filter(item => item.id !== id));
    toast({
      title: "✅ Berhasil",
      description: "Transaksi dihapus dari keranjang",
    });
  };

  // Checkout all items in cart
  const handleCheckoutCart = async () => {
    if (cart.length === 0) {
      toast({
        title: "⚠️ Peringatan",
        description: "Keranjang kosong",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      for (const item of cart) {
        // Check if this transaction needs approval
        const needsApproval = item.jenisTransaksi === "Pembelian Barang" || item.jenisTransaksi === "Pengeluaran Kas";
        
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
          kasSumber: item.kasSumber
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
          normalizedInput.nominal * 0.7 // HPP amount (70% of sales as example)
        );

        const journalRef = `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Step 4: Create Journal Entries (skip if needs approval)
        const mainDebitLine = journalData.lines.find(l => l.dc === "D");
        const mainCreditLine = journalData.lines.find(l => l.dc === "C");

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
          const cashLine = journalData.lines.find(
            l => l.account_code.startsWith("1-11")
          );

          if (cashLine) {
            await supabase.from("kas_transaksi").insert({
              payment_type: item.paymentType,
              service_category: item.kategori,
              service_type: item.jenisLayanan,
              account_number: cashLine.account_code,
              nominal: cashLine.amount,
              tanggal: journalData.tanggal,
              keterangan: journalData.memo,
            });
          }
        }
        
        // Step 6b: If Pengeluaran Kas, save to cash_disbursement table
        if (item.jenisTransaksi === "Pengeluaran Kas") {
          const { data: { user } } = await supabase.auth.getUser();
          
          const expenseLine = journalData.lines.find(l => l.dc === "D");
          const cashLine = journalData.lines.find(l => l.dc === "C");

          const { error: cashDisbursementError } = await supabase.from("cash_disbursement").insert({
            transaction_date: journalData.tanggal,
            payee_name: item.supplier || item.customer || "Pengeluaran Kas",
            description: journalData.memo,
            category: item.kategori,
            amount: normalizedInput.nominal,
            payment_method: item.paymentType === "cash" ? "Tunai" : "Transfer Bank",
            coa_expense_code: expenseLine?.account_code || "6-1100",
            coa_cash_code: cashLine?.account_code || "1-1100",
            notes: item.description,
            created_by: user?.id,
            approval_status: 'approved',
          });
          
          if (cashDisbursementError) {
            console.error("❌ Error saving to cash_disbursement:", cashDisbursementError);
            throw new Error(`Cash Disbursement: ${cashDisbursementError.message}`);
          } else {
            console.log("✅ Cash disbursement saved successfully");
          }
        }

        // Step 7: Create Sales Transaction if applicable
        if (item.jenisTransaksi === "Penjualan Barang" || item.jenisTransaksi === "Penjualan Jasa") {
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
              .eq("brand", item.brand)
              .maybeSingle();

            await supabase.from("sales_transactions").insert({
              transaction_date: item.tanggal,
              transaction_type: "Barang",
              item_name: item.itemName,
              brand: item.brand,
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
            });
          } else if (item.jenisTransaksi === "Penjualan Jasa") {
            await supabase.from("sales_transactions").insert({
              transaction_date: item.tanggal,
              transaction_type: "Jasa",
              item_name: `${item.kategori} - ${item.jenisLayanan}`,
              brand: null,
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
              console.error("❌ Error fetching borrower:", borrowerError);
            } else {
              borrowerId = borrowerData?.id;
              console.log("✅ Borrower ID found:", borrowerId);
            }
          }

          const loanData = {
            loan_date: item.tanggal,
            borrower_id: borrowerId,
            lender_name: item.borrowerName || item.supplier || item.customer || "Unknown",
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
            console.error("❌ Error creating loan:", loanError);
            throw new Error(`Failed to create loan: ${loanError.message}`);
          } else {
            console.log("✅ Loan created successfully:", loanResult);
            
            // Create installment schedule if available
            if (item.installmentSchedule && item.installmentSchedule.length > 0 && loanResult[0]) {
              const installments = item.installmentSchedule.map((inst: any) => ({
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
              }));

              const { error: installmentError } = await supabase
                .from("loan_installments")
                .insert(installments);

              if (installmentError) {
                console.error("❌ Error creating installments:", installmentError);
              } else {
                console.log("✅ Installments created successfully");
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
                l => l.lender_name === item.borrowerName
              );
              if (matchedLoan) targetLoan = matchedLoan;
            }

            // Call the add_loan_payment function
            const principalPmt = Number(item.principalAmount) || 0;
            const interestPmt = Number(item.interestAmount) || 0;
            const lateFeePmt = Number(item.lateFee) || 0;
            const daysLateNum = Number(item.daysLate) || 0;
            const lateFeePerc = Number(item.lateFeePercentage) || 0.1;

            const { error: paymentError } = await supabase.rpc("add_loan_payment", {
              p_loan_id: targetLoan.id,
              p_payment_date: item.actualPaymentDate || item.tanggal,
              p_principal_amount: principalPmt,
              p_interest_amount: interestPmt + lateFeePmt, // Include late fee in interest
              p_payment_method: item.paymentType === "cash" ? "Tunai" : "Bank",
              p_bank_name: item.selectedBank || null,
              p_reference_number: journalRef,
              p_notes: item.description || null,
            });

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
                let totalPaymentAmount = Number(item.nominal) || (principalPmt + interestPmt + lateFeePmt + Number(item.taxAmount));
                let remainingPayment = totalPaymentAmount;
                
                console.log("💰 Processing payment:", {
                  totalPaymentAmount,
                  unpaidInstallmentsCount: unpaidInstallments.length,
                  firstInstallment: unpaidInstallments[0]
                });
                
                // Process each unpaid installment
                for (const installment of unpaidInstallments) {
                  if (remainingPayment <= 0) break;
                  
                  const installmentTotal = installment.total_amount;
                  const currentPaidAmount = installment.paid_amount || 0;
                  const remainingInstallmentAmount = installmentTotal - currentPaidAmount;
                  
                  console.log(`📋 Cicilan ${installment.installment_number}:`, {
                    total: installmentTotal,
                    alreadyPaid: currentPaidAmount,
                    remaining: remainingInstallmentAmount,
                    paymentAvailable: remainingPayment
                  });
                  
                  if (remainingPayment >= remainingInstallmentAmount) {
                    // Full payment for this installment
                    const newPaidAmount = currentPaidAmount + remainingInstallmentAmount;
                    
                    await supabase
                      .from("loan_installments")
                      .update({
                        actual_payment_date: item.actualPaymentDate || item.tanggal,
                        days_late: daysLateNum,
                        late_fee: installment.installment_number === unpaidInstallments[0].installment_number ? lateFeePmt : 0,
                        late_fee_percentage: lateFeePerc,
                        tax_type: item.taxType || null,
                        tax_percentage: Number(item.taxPercentage) || 0,
                        tax_amount: installment.installment_number === unpaidInstallments[0].installment_number ? Number(item.taxAmount) : 0,
                        paid_amount: newPaidAmount,
                        payment_date: item.actualPaymentDate || item.tanggal,
                        status: "Lunas",
                      })
                      .eq("id", installment.id);
                    
                    console.log(`✅ Cicilan ${installment.installment_number} LUNAS - Terbayar: ${newPaidAmount}`);
                    remainingPayment -= remainingInstallmentAmount;
                  } else {
                    // Partial payment for this installment
                    const newPaidAmount = currentPaidAmount + remainingPayment;
                    
                    await supabase
                      .from("loan_installments")
                      .update({
                        actual_payment_date: item.actualPaymentDate || item.tanggal,
                        days_late: daysLateNum,
                        late_fee: installment.installment_number === unpaidInstallments[0].installment_number ? lateFeePmt : 0,
                        late_fee_percentage: lateFeePerc,
                        tax_type: item.taxType || null,
                        tax_percentage: Number(item.taxPercentage) || 0,
                        tax_amount: installment.installment_number === unpaidInstallments[0].installment_number ? Number(item.taxAmount) : 0,
                        paid_amount: newPaidAmount,
                        payment_date: item.actualPaymentDate || item.tanggal,
                        status: "Sebagian",
                      })
                      .eq("id", installment.id);
                    
                    console.log(`🔵 Cicilan ${installment.installment_number} SEBAGIAN - Terbayar: ${newPaidAmount}`);
                    remainingPayment = 0;
                  }
                }
                
                console.log("✅ Payment processing complete. Remaining:", remainingPayment);
              }
              
              // Check if all installments are paid, then update loan status
              const { data: allInstallments } = await supabase
                .from("loan_installments")
                .select("*")
                .eq("loan_id", targetLoan.id);
              
              if (allInstallments) {
                const allPaid = allInstallments.every(inst => inst.status === "Lunas");
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
        if (item.jenisTransaksi === "Pembelian Barang" || item.jenisTransaksi === "Pembelian Jasa") {
          const unitPrice = Number(item.hargaBeli || item.nominal) || 0;
          const quantity = Number(item.quantity) || 1;
          const subtotal = unitPrice * quantity;
          const ppnPercentage = Number(item.ppnPercentage) || 0;
          const ppnAmount = Number(item.ppnAmount) || 0;
          const totalAmount = subtotal + ppnAmount;

          const purchaseData: any = {
            transaction_date: item.tanggal,
            transaction_type: item.jenisTransaksi === "Pembelian Barang" ? "Barang" : "Jasa",
            item_name: item.itemName || `${item.kategori} - ${item.jenisLayanan}`,
            brand: item.brand || null,
            supplier_name: item.supplier || "",
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: subtotal,
            ppn_percentage: ppnPercentage,
            ppn_amount: ppnAmount,
            total_amount: totalAmount,
            payment_method: item.paymentType === "cash" ? "Tunai" : "Hutang",
            coa_cash_code: item.paymentType === "cash" && mainCreditLine?.account_code ? mainCreditLine.account_code : null,
            coa_expense_code: mainDebitLine?.account_code || null,
            coa_inventory_code: item.coaSelected || null,
            coa_payable_code: item.paymentType !== "cash" ? mainCreditLine?.account_code : null,
            notes: item.description || null,
            journal_ref: journalRef,
            approval_status: needsApproval ? 'waiting_approval' : 'approved',
          };

          console.log("📦 Purchase Transaction Data:", purchaseData);

          const { data: purchaseData_result, error: purchaseError } = await supabase
            .from("purchase_transactions")
            .insert(purchaseData);

          if (purchaseError) {
            console.error("❌ Purchase Transaction Error:", purchaseError);
            throw new Error(`Purchase Transaction: ${purchaseError.message}`);
          }
          console.log("✅ Purchase Transaction saved:", purchaseData_result);
        }
      }

      toast({
        title: "✅ Berhasil",
        description: `${cart.length} transaksi berhasil disimpan`,
      });

      // Refresh loan data if payment was made
      const hasLoanPayment = cart.some(item => item.jenisTransaksi === "Pembayaran Pinjaman");
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

      // Clear cart and close
      setCart([]);
      setShowCart(false);
    } catch (error: any) {
      console.error("❌ Checkout Error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Calculate summary data from all transaction sources
  const summaryData = {
    totalTransactions: transactions.length,
    totalPenerimaan: transactions
      .filter((t) => {
        // Income from kas_transaksi
        if (t.source === 'kas_transaksi' && t.payment_type === "Penerimaan Kas") return true;
        // Income from sales
        if (t.source === 'sales_transactions') return true;
        // Income from loans (pinjaman diterima)
        if (t.source === 'loans') return true;
        return false;
      })
      .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0),
    totalPengeluaran: transactions
      .filter((t) => {
        // Expenses from kas_transaksi
        if (t.source === 'kas_transaksi' && t.payment_type === "Pengeluaran Kas") return true;
        // Expenses from purchases
        if (t.source === 'purchase_transactions') return true;
        // Expenses from internal usage
        if (t.source === 'internal_usage') return true;
        // Expenses from expenses table
        if (t.source === 'expenses') return true;
        return false;
      })
      .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0),
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
              <h1 className="text-2xl font-bold text-white">Transaksi Keuangan</h1>
              <p className="text-sm text-blue-100">
                Pencatatan Penerimaan dan Pengeluaran Kas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {showForm && (
              <>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-lg bg-blue-400/90 text-white hover:shadow-xl transition-shadow">
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

              <Card className="border-none shadow-lg bg-emerald-400/90 text-white hover:shadow-xl transition-shadow">
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

              <Card className="border-none shadow-lg bg-pink-400/90 text-white hover:shadow-xl transition-shadow">
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
                className={`border-none shadow-lg text-white hover:shadow-xl transition-shadow ${
                  netAmount >= 0 ? "bg-purple-400/90" : "bg-red-400/90"
                }`}
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
                      <Label htmlFor="filterDateFrom" className="text-sm font-medium text-slate-700">
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
                      <Label htmlFor="filterDateTo" className="text-sm font-medium text-slate-700">
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
                  
                  {/* Clear Filters Button */}
                  {(filterDateFrom || filterDateTo || searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterDateFrom("");
                        setFilterDateTo("");
                        setSearchQuery("");
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
                      <TableHead className="font-semibold">No. Dokumen</TableHead>
                      <TableHead className="font-semibold">Jenis</TableHead>
                      <TableHead className="font-semibold">Source</TableHead>
                      <TableHead className="font-semibold">Akun</TableHead>
                      <TableHead className="font-semibold">Keterangan</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                          Belum ada transaksi. Klik "Tambah Transaksi" untuk memulai.
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
                          let displayJenis = transaction.jenis || transaction.payment_type || transaction.transaction_type || transaction.expense_type || "-";
                          
                          // Add service category/type for Pengeluaran Kas if available
                          if (transaction.payment_type === "Pengeluaran Kas" && transaction.service_category) {
                            displayJenis = `${transaction.payment_type} - ${transaction.service_category}`;
                            if (transaction.service_type) {
                              displayJenis += ` (${transaction.service_type})`;
                            }
                          }
                          
                          const displayKeterangan = transaction.keterangan || transaction.description || transaction.notes || transaction.item_name || "-";
                          const displayNominal = transaction.nominal || transaction.total_amount || transaction.amount || transaction.total_value || 0;
                          const displayDocNumber = transaction.document_number || transaction.loan_number || transaction.journal_ref || transaction.id?.substring(0, 8) || "-";
                          const displayAccount = transaction.account_name || transaction.coa_expense_code || transaction.coa_revenue_code || transaction.coa_loan_code || "-";
                          const displayAccountNumber = transaction.account_number || "";
                          
                          // Determine if it's income or expense
                          const isIncome = transaction.payment_type === "Penerimaan Kas" || 
                                          transaction.source === "sales_transactions" ||
                                          transaction.source === "loans" ||
                                          displayJenis === "Penjualan";
                          
                          return (
                            <TableRow key={transaction.id} className="hover:bg-slate-50">
                              <TableCell className="text-center font-medium text-gray-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                {new Date(transaction.tanggal).toLocaleDateString("id-ID")}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {displayDocNumber}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  isIncome
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {displayJenis}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {transaction.source?.replace(/_/g, " ").toUpperCase() || "KAS"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {displayAccountNumber && (
                                    <div className="font-mono text-xs text-gray-500">{displayAccountNumber}</div>
                                  )}
                                  <div>{displayAccount}</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {displayKeterangan}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  transaction.approval_status === "approved" 
                                    ? "bg-green-100 text-green-800" 
                                    : transaction.approval_status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : transaction.approval_status === "waiting_approval"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {transaction.approval_status === "approved" 
                                    ? "✓ Approved" 
                                    : transaction.approval_status === "rejected"
                                    ? "✗ Rejected"
                                    : transaction.approval_status === "waiting_approval"
                                    ? "⏳ Waiting"
                                    : "-"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span className={isIncome ? "text-green-600" : "text-red-600"}>
                                  {isIncome ? "+" : "-"}
                                  Rp {new Intl.NumberFormat("id-ID").format(displayNominal)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
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
              <Select value={jenisTransaksi} onValueChange={setJenisTransaksi}>
                <SelectTrigger id="jenis_transaksi">
                  <SelectValue placeholder="-- pilih --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Penjualan Barang">
                    Penjualan Barang
                  </SelectItem>
                  <SelectItem value="Penjualan Jasa">Penjualan Jasa</SelectItem>
                  <SelectItem value="Pembelian Barang">Pembelian Barang</SelectItem>
                  <SelectItem value="Pembelian Jasa">Pembelian Jasa</SelectItem>
                  <SelectItem value="Penerimaan Kas">Penerimaan Kas & Bank</SelectItem>
                  <SelectItem value="Pengeluaran Kas">
                    Pengeluaran Kas
                  </SelectItem>
                  <SelectItem value="Pinjaman Masuk">Pinjaman Masuk</SelectItem>
                  <SelectItem value="Pembayaran Pinjaman">
                    Pembayaran Pinjaman
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {jenisTransaksi === "Penerimaan Kas" && (
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type *</Label>
                <Select 
                  value={paymentType} 
                  onValueChange={setPaymentType}
                >
                  <SelectTrigger id="payment_type">
                    <SelectValue placeholder="-- pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Transfer Bank">Bank Transfer</SelectItem>
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
                    <SelectItem key={bank.account_code} value={bank.account_code}>
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
                    <SelectItem key={kas.account_code} value={kas.account_code}>
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
                    <SelectValue placeholder={jenisTransaksi ? "-- pilih --" : "Pilih jenis transaksi terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
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
                    <SelectValue placeholder={kategori ? "-- pilih --" : "Pilih kategori terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
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

          {/* ITEM & BRAND */}
          {shouldShowField("itemBarang") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item_barang">Item Barang</Label>
                <div className="flex gap-2">
                  <Select 
                    value={itemName} 
                    onValueChange={(value) => {
                      setItemName(value);
                      setBrand(""); // Reset brand when item changes
                    }}
                  >
                    <SelectTrigger id="item_barang" className="flex-1">
                      <SelectValue placeholder="-- pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((i) => (
                        <SelectItem key={i.id} value={i.item_name}>
                          {i.item_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {shouldShowField("brand") && (
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={brand} 
                      onValueChange={setBrand}
                      disabled={!itemName}
                    >
                      <SelectTrigger id="brand" className="flex-1">
                        <SelectValue placeholder={itemName ? "-- pilih --" : "Pilih item terlebih dahulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredBrands.map((b) => (
                          <SelectItem key={b.id} value={b.brand_name}>
                            {b.brand_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => setOpenBrandModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STOCK INFORMATION */}
          {shouldShowField("itemBarang") && itemName && brand && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                📦 Informasi Stock
              </h4>
              {loadingStock ? (
                <p className="text-sm text-gray-600">Memuat data stock...</p>
              ) : stockInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Sisa Stock:</span>
                    <span className="ml-2 text-gray-900">{stockInfo.quantity || 0} {stockInfo.unit || 'pcs'}</span>
                  </div>
                  {stockInfo.warehouses && (
                    <div>
                      <span className="font-medium text-gray-700">Gudang:</span>
                      <span className="ml-2 text-gray-900">{stockInfo.warehouses.name} ({stockInfo.warehouses.code})</span>
                    </div>
                  )}
                  {stockInfo.location && (
                    <div>
                      <span className="font-medium text-gray-700">Lokasi:</span>
                      <span className="ml-2 text-gray-900">{stockInfo.location}</span>
                    </div>
                  )}
                  {stockInfo.harga_jual && (
                    <div>
                      <span className="font-medium text-gray-700">Harga Jual (Gudang):</span>
                      <span className="ml-2 text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stockInfo.harga_jual)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-amber-600">⚠️ Stock tidak ditemukan untuk item dan brand ini</p>
              )}
            </div>
          )}

          {/* QUANTITY & HARGA JUAL - Only for Penjualan Barang */}
          {jenisTransaksi === "Penjualan Barang" && itemName && brand && (
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
                      const total = Number(e.target.value) * Number(hargaJual);
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
                      const total = Number(quantity) * Number(e.target.value);
                      setNominal(total.toString());
                    }
                  }}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Total: Rp {new Intl.NumberFormat('id-ID').format(Number(quantity || 0) * Number(hargaJual || 0))}
                </p>
              </div>
            </div>
          )}

          {/* QUANTITY, HARGA BELI & PPN - Only for Pembelian Barang */}
          {jenisTransaksi === "Pembelian Barang" && itemName && brand && (
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
                        const subtotal = Number(e.target.value) * Number(hargaBeli);
                        const ppn = subtotal * (Number(ppnPercentage) / 100);
                        setPpnAmount(ppn.toString());
                        setNominal((subtotal + ppn).toString());
                      }
                    }}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harga_beli">Harga Beli per Unit *</Label>
                  <Input
                    id="harga_beli"
                    type="number"
                    value={hargaBeli}
                    onChange={(e) => {
                      setHargaBeli(e.target.value);
                      // Auto-calculate nominal with PPN
                      if (quantity) {
                        const subtotal = Number(quantity) * Number(e.target.value);
                        const ppn = subtotal * (Number(ppnPercentage) / 100);
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
                        const subtotal = Number(quantity) * Number(hargaBeli);
                        const ppn = subtotal * (Number(e.target.value) / 100);
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
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="ml-2 text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(quantity || 0) * Number(hargaBeli || 0))}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">PPN ({ppnPercentage}%):</span>
                    <span className="ml-2 text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(ppnAmount || 0))}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-blue-300">
                    <span className="font-bold text-gray-900 text-lg">Total:</span>
                    <span className="ml-2 text-blue-700 font-bold text-lg">
                      Rp {new Intl.NumberFormat('id-ID').format(
                        (Number(quantity || 0) * Number(hargaBeli || 0)) + Number(ppnAmount || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER / SUPPLIER */}
          {(jenisTransaksi === "Penjualan Barang" || jenisTransaksi === "Penjualan Jasa") && (
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
                      customers.map((c) => (
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
                      consignees.map((c) => (
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

          {(jenisTransaksi === "Pembelian Barang" || jenisTransaksi === "Pembelian Jasa") && (
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="-- pilih supplier --" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
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
                  <Select value={selectedBorrower} onValueChange={setSelectedBorrower}>
                    <SelectTrigger id="borrower" className="flex-1">
                      <SelectValue placeholder="-- pilih peminjam --" />
                    </SelectTrigger>
                    <SelectContent>
                      {borrowers.length === 0 ? (
                        <SelectItem value="no-data" disabled>
                          Tidak ada data peminjam
                        </SelectItem>
                      ) : (
                        borrowers.map((b) => (
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
                        date.setMonth(date.getMonth() + parseInt(e.target.value));
                        setMaturityDate(date.toISOString().split('T')[0]);
                      }
                    }}
                    placeholder="12"
                  />
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-2">
                <Label htmlFor="payment_schedule">Jadwal Pembayaran *</Label>
                <Select value={paymentSchedule} onValueChange={setPaymentSchedule}>
                  <SelectTrigger id="payment_schedule">
                    <SelectValue placeholder="-- pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bulanan">Bulanan (Cicilan)</SelectItem>
                    <SelectItem value="Jatuh Tempo">Jatuh Tempo (Lump Sum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maturity Date */}
              <div className="space-y-2">
                <Label htmlFor="maturity_date">Jatuh Tempo / Maturity Date</Label>
                <Input
                  id="maturity_date"
                  type="date"
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                  className="bg-gray-100"
                />
                {maturityDate && (
                  <p className="text-xs text-purple-600">
                    📅 Jatuh tempo: {new Date(maturityDate).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
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
                          <th className="px-2 py-1 text-left">Jatuh Tempo</th>
                          <th className="px-2 py-1 text-right">Pokok</th>
                          <th className="px-2 py-1 text-right">Bunga</th>
                          <th className="px-2 py-1 text-right">Total</th>
                          <th className="px-2 py-1 text-right">Sisa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installmentSchedule.map((inst, idx) => (
                          <tr key={idx} className="border-t border-purple-100">
                            <td className="px-2 py-1">{inst.installment}</td>
                            <td className="px-2 py-1">
                              {new Date(inst.dueDate).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-2 py-1 text-right">
                              {new Intl.NumberFormat('id-ID').format(inst.principalAmount)}
                            </td>
                            <td className="px-2 py-1 text-right">
                              {new Intl.NumberFormat('id-ID').format(inst.interestAmount)}
                            </td>
                            <td className="px-2 py-1 text-right font-semibold">
                              {new Intl.NumberFormat('id-ID').format(inst.totalPayment)}
                            </td>
                            <td className="px-2 py-1 text-right text-gray-600">
                              {new Intl.NumberFormat('id-ID').format(inst.remainingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-purple-50 font-semibold">
                        <tr>
                          <td colSpan={2} className="px-2 py-1">Total</td>
                          <td className="px-2 py-1 text-right">
                            {new Intl.NumberFormat('id-ID').format(
                              installmentSchedule.reduce((sum, inst) => sum + inst.principalAmount, 0)
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {new Intl.NumberFormat('id-ID').format(
                              installmentSchedule.reduce((sum, inst) => sum + inst.interestAmount, 0)
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {new Intl.NumberFormat('id-ID').format(
                              installmentSchedule.reduce((sum, inst) => sum + inst.totalPayment, 0)
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
                      <Label htmlFor="principal_payment">Pembayaran Pokok (Rp)</Label>
                      <Input
                        id="principal_payment"
                        type="number"
                        value={principalAmount}
                        onChange={(e) => setPrincipalAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest_payment">Pembayaran Bunga (Rp)</Label>
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
                        <Label htmlFor="actual_payment_date">Tanggal Pembayaran Aktual</Label>
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
                              const days = Math.floor((payment.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                              const daysLateCalc = Math.max(0, days);
                              setDaysLate(daysLateCalc.toString());
                              
                              // Calculate late fee
                              if (daysLateCalc > 0 && principalAmount) {
                                const installmentAmount = Number(principalAmount) + Number(interestAmount);
                                const fee = installmentAmount * (Number(lateFeePercentage) / 100) * daysLateCalc;
                                setLateFee(fee.toFixed(2));
                              } else {
                                setLateFee("0");
                              }
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="late_fee_percentage">Persentase Denda per Hari (%)</Label>
                        <Input
                          id="late_fee_percentage"
                          type="number"
                          step="0.01"
                          value={lateFeePercentage}
                          onChange={(e) => {
                            setLateFeePercentage(e.target.value);
                            // Recalculate late fee
                            if (Number(daysLate) > 0 && principalAmount) {
                              const installmentAmount = Number(principalAmount) + Number(interestAmount);
                              const fee = installmentAmount * (Number(e.target.value) / 100) * Number(daysLate);
                              setLateFee(fee.toFixed(2));
                            }
                          }}
                          placeholder="0.1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="days_late">Hari Keterlambatan</Label>
                        <Input
                          id="days_late"
                          type="number"
                          value={daysLate}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="late_fee">Denda Keterlambatan (Rp)</Label>
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
                          📊 Perhitungan: (Pokok + Bunga) × {lateFeePercentage}% × {daysLate} hari = Rp {new Intl.NumberFormat('id-ID').format(Number(lateFee))}
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
                            <SelectItem value="PPh21">PPh 21 (Gaji)</SelectItem>
                            <SelectItem value="PPh23">PPh 23 (Jasa)</SelectItem>
                            <SelectItem value="PPh4(2)">PPh 4(2) (Final)</SelectItem>
                            <SelectItem value="PPN">PPN</SelectItem>
                            <SelectItem value="PPnBM">PPnBM</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax_percentage">Persentase Pajak (%)</Label>
                        <Input
                          id="tax_percentage"
                          type="number"
                          step="0.01"
                          value={taxPercentage}
                          onChange={(e) => {
                            setTaxPercentage(e.target.value);
                            // Auto-calculate tax amount
                            const baseAmount = Number(principalAmount) + Number(interestAmount);
                            const tax = baseAmount * (Number(e.target.value) / 100);
                            setTaxAmount(tax.toFixed(2));
                          }}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax_amount">Jumlah Pajak (Rp)</Label>
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
                          📊 Perhitungan: (Pokok + Bunga) × {taxPercentage}% = Rp {new Intl.NumberFormat('id-ID').format(Number(taxAmount))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="text-sm font-semibold text-yellow-900">
                      Total Pembayaran: Rp {new Intl.NumberFormat('id-ID').format(
                        Number(principalAmount) + Number(interestAmount) + Number(lateFee) + Number(taxAmount)
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
                      setInterestRate(loan.interest_rate?.toString() || "0");
                      setLoanTermMonths(loan.loan_term_months?.toString() || "12");
                      setMaturityDate(loan.maturity_date || "");
                      setPaymentSchedule(loan.payment_schedule || "Bulanan");
                      setLateFeePercentage(loan.late_fee_percentage?.toString() || "0.1");
                      setTaxType(loan.tax_type || "");
                      setTaxPercentage(loan.tax_percentage?.toString() || "0");
                      
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
                        const nextUnpaid = installments.find(inst => inst.status === "Belum Bayar");
                        if (nextUnpaid) {
                          setPrincipalAmount(nextUnpaid.principal_amount?.toString() || "0");
                          setInterestAmount(nextUnpaid.interest_amount?.toString() || "0");
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
                          setLateFeePercentage(borrower.default_late_fee_percentage?.toString() || "0.1");
                        }
                        if (!loan.tax_type) {
                          setTaxType(borrower.default_tax_type || "");
                          setTaxPercentage(borrower.default_tax_percentage?.toString() || "0");
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
                      borrowers.map((b) => (
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
                  <h5 className="font-semibold text-sm text-green-900">📋 Detail Pinjaman</h5>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Tipe:</span>
                      <span className="ml-2 font-medium">{loanType || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bunga:</span>
                      <span className="ml-2 font-medium">{interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tenor:</span>
                      <span className="ml-2 font-medium">{loanTermMonths} bulan</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Jadwal:</span>
                      <span className="ml-2 font-medium">{paymentSchedule}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Denda/hari:</span>
                      <span className="ml-2 font-medium">{lateFeePercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pajak:</span>
                      <span className="ml-2 font-medium">{taxType || "-"} ({taxPercentage}%)</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nilai Pinjaman:</span>
                      <span className="ml-2 font-medium">Rp {new Intl.NumberFormat('id-ID').format(Number(nominal))}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-green-200">
                      <span className="text-gray-600">Sisa Pinjaman:</span>
                      <span className="ml-2 font-bold text-green-700">
                        Rp {new Intl.NumberFormat('id-ID').format(
                          installmentSchedule
                            .filter((inst: any) => inst.status === "Belum Bayar" || inst.status === "Sebagian")
                            .reduce((sum: number, inst: any) => {
                              // For partial payment, calculate remaining amount
                              if (inst.status === "Sebagian") {
                                return sum + (inst.totalPayment - (inst.paidAmount || 0));
                              }
                              return sum + inst.totalPayment;
                            }, 0)
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
                    <h5 className="font-semibold text-sm text-green-900">📅 Jadwal Cicilan</h5>
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
                              
                              toast({
                                title: "✅ Data Diperbarui",
                                description: "Jadwal cicilan berhasil di-refresh",
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
                          if (!confirm("⚠️ Reset semua data pembayaran cicilan? Data yang sudah dibayar akan dikembalikan ke status 'Belum Bayar'.")) {
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
                                tax_amount: 0
                              })
                              .eq("loan_id", loan.id);
                            
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
                              
                              toast({
                                title: "✅ Data Direset",
                                description: "Semua cicilan dikembalikan ke status 'Belum Bayar'",
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
                        {installmentSchedule.map((inst: any, idx: number) => (
                          <tr key={idx} className={
                            inst.status === "Lunas" ? "bg-green-50" :
                            inst.status === "Sebagian" ? "bg-blue-50" :
                            inst.status === "Belum Bayar" ? "bg-yellow-50" : "bg-gray-50"
                          }>
                            <td className="p-2">{inst.installment}</td>
                            <td className="p-2">{inst.dueDate}</td>
                            <td className="p-2 text-right">
                              {new Intl.NumberFormat('id-ID').format(inst.principalAmount)}
                            </td>
                            <td className="p-2 text-right">
                              {new Intl.NumberFormat('id-ID').format(inst.interestAmount)}
                            </td>
                            <td className="p-2 text-right font-medium">
                              {new Intl.NumberFormat('id-ID').format(inst.totalPayment)}
                            </td>
                            <td className="p-2 text-right text-blue-700 font-medium">
                              {new Intl.NumberFormat('id-ID').format(inst.paidAmount || 0)}
                            </td>
                            <td className="p-2 text-right text-red-700 font-medium">
                              {new Intl.NumberFormat('id-ID').format(inst.totalPayment - (inst.paidAmount || 0))}
                            </td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                inst.status === "Lunas" ? "bg-green-200 text-green-800" : 
                                inst.status === "Sebagian" ? "bg-blue-200 text-blue-800" :
                                inst.status === "Terlambat" ? "bg-red-200 text-red-800" :
                                "bg-yellow-200 text-yellow-800"
                              }`}>
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Cicilan dengan status "Belum Bayar" akan otomatis terisi di form pembayaran
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
                        <Label htmlFor="actual_payment_date">Tanggal Pembayaran Aktual</Label>
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
                              const days = Math.floor((payment.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                              const daysLateCalc = Math.max(0, days);
                              setDaysLate(daysLateCalc.toString());
                              
                              // Calculate late fee
                              if (daysLateCalc > 0 && principalAmount) {
                                const installmentAmount = Number(principalAmount) + Number(interestAmount);
                                const fee = installmentAmount * (Number(lateFeePercentage) / 100) * daysLateCalc;
                                setLateFee(fee.toFixed(2));
                              } else {
                                setLateFee("0");
                              }
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="late_fee_percentage_display">Persentase Denda per Hari (%)</Label>
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
                        <Label htmlFor="days_late">Hari Keterlambatan</Label>
                        <Input
                          id="days_late"
                          type="number"
                          value={daysLate}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="late_fee">Denda Keterlambatan (Rp)</Label>
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
                          📊 Perhitungan: (Pokok + Bunga) × {lateFeePercentage}% × {daysLate} hari = Rp {new Intl.NumberFormat('id-ID').format(Number(lateFee))}
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
                        <Label htmlFor="tax_type_display">Jenis Pajak</Label>
                        <Input
                          id="tax_type_display"
                          type="text"
                          value={taxType}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax_percentage_display">Persentase Pajak (%)</Label>
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
                        <Label htmlFor="tax_amount">Jumlah Pajak (Rp)</Label>
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
                          📊 Perhitungan: (Pokok + Bunga) × {taxPercentage}% = Rp {new Intl.NumberFormat('id-ID').format(Number(taxAmount))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="text-sm font-semibold text-yellow-900">
                      Total Pembayaran: Rp {new Intl.NumberFormat('id-ID').format(
                        Number(principalAmount) + Number(interestAmount) + Number(lateFee) + Number(taxAmount)
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
              <Select value={sumberPenerimaan} onValueChange={setSumberPenerimaan}>
                <SelectTrigger id="sumber_penerimaan">
                  <SelectValue placeholder="-- pilih --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pinjaman Bank">Pinjaman Bank</SelectItem>
                  <SelectItem value="Setoran Modal">Setoran Modal</SelectItem>
                  <SelectItem value="Pelunasan Piutang">Pelunasan Piutang</SelectItem>
                  <SelectItem value="Pendapatan Lain">Pendapatan Lain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Kategori Pengeluaran */}
          {shouldShowField("kategoriPengeluaran") && (
            <div className="space-y-2">
              <Label htmlFor="kategori_pengeluaran">Kategori Pengeluaran *</Label>
              <Select value={kategoriPengeluaran} onValueChange={setKategoriPengeluaran}>
                <SelectTrigger id="kategori_pengeluaran">
                  <SelectValue placeholder="-- pilih --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beban Operasional">Beban Operasional</SelectItem>
                  <SelectItem value="Beban Kendaraan">Beban Kendaraan</SelectItem>
                  <SelectItem value="Beban Lain">Beban Lain</SelectItem>
                </SelectContent>
              </Select>
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
                    {coa.filter(c => c.account_code.startsWith("1-11")).map((c) => (
                      <SelectItem key={c.account_code} value={c.account_code}>
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
                      {coa.filter(c => c.account_code.startsWith("1-11")).map((c) => (
                        <SelectItem key={c.account_code} value={c.account_code}>
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
                {jenisTransaksi === "Penjualan Barang" && itemName && brand && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Otomatis dari Quantity × Harga Jual)
                  </span>
                )}
                {jenisTransaksi === "Pembelian Barang" && itemName && brand && (
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
                  (jenisTransaksi === "Penjualan Barang" && itemName && brand) ||
                  (jenisTransaksi === "Pembelian Barang" && itemName && brand)
                }
                className={
                  (jenisTransaksi === "Penjualan Barang" && itemName && brand) ||
                  (jenisTransaksi === "Pembelian Barang" && itemName && brand)
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

          {/* UPLOAD BUKTI */}
          <div className="space-y-2">
            <Label htmlFor="bukti">Upload Bukti</Label>
            <Input
              id="bukti"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBuktiFile(file);
                }
              }}
              className="cursor-pointer"
            />
            {buktiFile && (
              <p className="text-sm text-slate-600">
                File terpilih: {buktiFile.name}
              </p>
            )}
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
                <p className="text-sm mt-2">Tambahkan transaksi dari form di atas</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">#{index + 1}</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {item.jenisTransaksi}
                            </span>
                            {item.paymentType && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {item.paymentType === "cash" ? "Tunai" : "Kredit"}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            {item.itemName && (
                              <div>
                                <span className="font-medium text-gray-600">Item:</span>
                                <span className="ml-2">{item.itemName}</span>
                              </div>
                            )}
                            {item.brand && (
                              <div>
                                <span className="font-medium text-gray-600">Brand:</span>
                                <span className="ml-2">{item.brand}</span>
                              </div>
                            )}
                            {item.kategori && (
                              <div>
                                <span className="font-medium text-gray-600">Kategori:</span>
                                <span className="ml-2">{item.kategori}</span>
                              </div>
                            )}
                            {item.jenisLayanan && (
                              <div>
                                <span className="font-medium text-gray-600">Layanan:</span>
                                <span className="ml-2">{item.jenisLayanan}</span>
                              </div>
                            )}
                            {item.customer && (
                              <div>
                                <span className="font-medium text-gray-600">Customer:</span>
                                <span className="ml-2">{item.customer}</span>
                              </div>
                            )}
                            {item.supplier && (
                              <div>
                                <span className="font-medium text-gray-600">Supplier:</span>
                                <span className="ml-2">{item.supplier}</span>
                              </div>
                            )}
                            {item.quantity && item.quantity !== "1" && (
                              <div>
                                <span className="font-medium text-gray-600">Qty:</span>
                                <span className="ml-2">{item.quantity}</span>
                              </div>
                            )}
                            {item.hargaJual && (
                              <div>
                                <span className="font-medium text-gray-600">Harga Jual/Unit:</span>
                                <span className="ml-2">Rp {new Intl.NumberFormat('id-ID').format(Number(item.hargaJual))}</span>
                              </div>
                            )}
                            {item.hargaBeli && (
                              <div>
                                <span className="font-medium text-gray-600">Harga Beli/Unit:</span>
                                <span className="ml-2">Rp {new Intl.NumberFormat('id-ID').format(Number(item.hargaBeli))}</span>
                              </div>
                            )}
                            {item.ppnAmount && Number(item.ppnAmount) > 0 && (
                              <div>
                                <span className="font-medium text-gray-600">PPN ({item.ppnPercentage}%):</span>
                                <span className="ml-2">Rp {new Intl.NumberFormat('id-ID').format(Number(item.ppnAmount))}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-600">Tanggal:</span>
                              <span className="ml-2">{item.tanggal}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-lg text-gray-900">
                                Total: Rp {new Intl.NumberFormat('id-ID').format(Number(item.nominal))}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Keterangan:</span> {item.description}
                              </p>
                            )}
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
                      <p className="text-sm text-gray-600">Total Transaksi: {cart.length} item</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Total Nominal: Rp {new Intl.NumberFormat('id-ID').format(
                          cart.reduce((sum, item) => sum + Number(item.nominal), 0)
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
                        disabled={isConfirming}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isConfirming ? "Memproses..." : "✅ Checkout Semua"}
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
        onAdded={loadBrands}
      />

      <AddStockItemModal
        open={openStockItemModal}
        onClose={() => setOpenStockItemModal(false)}
        onAdded={() => {
          loadItems();
          loadBrands();
          fetchStockInfo(itemName, brand);
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

      {/* Approval Transaksi Section */}
      <div className="mt-8">
        <ApprovalTransaksi />
      </div>
    </div>
  );
}
