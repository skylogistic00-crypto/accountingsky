import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { canClick, canDelete, canView, canEdit } from "@/utils/roleAccess";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingTransaction {
  id: string;
  type: "purchase" | "expense" | "income" | "cash_disbursement";
  transaction_date?: string;
  tanggal?: string;
  item_name?: string;
  supplier_name?: string;
  payee_name?: string;
  payment_type?: string;
  service_category?: string;
  service_type?: string;
  category?: string;
  description?: string;
  keterangan?: string;
  total_amount?: number;
  amount?: number;
  nominal?: number;
  payment_method?: string;
  transaction_type?: string;
  journal_ref?: string;
  coa_cash_code?: string;
  coa_expense_code?: string;
  coa_inventory_code?: string;
  coa_payable_code?: string;
  account_number?: string;
  notes?: string;
}

export default function ApprovalTransaksi() {
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PendingTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    fetchPendingTransactions();

    // Subscribe to changes
    const subscription = supabase
      .channel("approval-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_transactions" },
        () => fetchPendingTransactions(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kas_transaksi" },
        () => fetchPendingTransactions(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);

      // Fetch pending purchase transactions
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchase_transactions")
        .select("*")
        .eq("approval_status", "waiting_approval")
        .order("transaction_date", { ascending: false });

      if (purchaseError) throw purchaseError;

      // Fetch pending expense transactions from kas_transaksi
      const { data: expenseData, error: expenseError } = await supabase
        .from("kas_transaksi")
        .select("*")
        .eq("approval_status", "waiting_approval")
        .eq("payment_type", "Pengeluaran Kas")
        .order("tanggal", { ascending: false });

      if (expenseError) throw expenseError;

      // Fetch pending income transactions from cash_and_bank_receipts
      const { data: incomeData, error: incomeError } = await supabase
        .from("cash_and_bank_receipts")
        .select("*")
        .eq("approval_status", "waiting_approval")
        .eq("transaction_type", "Penerimaan")
        .order("transaction_date", { ascending: false });

      if (incomeError) throw incomeError;

      // Fetch pending cash disbursement transactions
      const { data: cashDisbursementData, error: cashDisbursementError } =
        await supabase
          .from("cash_disbursement")
          .select("*")
          .eq("approval_status", "waiting_approval")
          .order("transaction_date", { ascending: false });

      if (cashDisbursementError) throw cashDisbursementError;

      // Combine and format transactions
      const combined: PendingTransaction[] = [
        ...(purchaseData || []).map((t) => ({
          ...t,
          type: "purchase" as const,
        })),
        ...(expenseData || []).map((t) => ({ ...t, type: "expense" as const })),
        ...(incomeData || []).map((t) => ({ ...t, type: "income" as const })),
        ...(cashDisbursementData || []).map((t) => ({
          ...t,
          type: "cash_disbursement" as const,
        })),
      ];

      setPendingTransactions(combined);
    } catch (error: any) {
      console.error("Error fetching pending transactions:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal memuat transaksi pending",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transaction: PendingTransaction) => {
    setProcessingId(transaction.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      if (transaction.type === "purchase") {
        // Approve purchase transaction
        await approvePurchaseTransaction(transaction, user.id);
      } else if (transaction.type === "cash_disbursement") {
        // Approve cash disbursement transaction
        await approveCashDisbursementTransaction(transaction, user.id);
      } else if (transaction.type === "income") {
        // Approve income transaction
        await approveIncomeTransaction(transaction, user.id);
      } else {
        // Approve expense transaction
        await approveExpenseTransaction(transaction, user.id);
      }

      toast({
        title: "✅ Berhasil",
        description: "Transaksi berhasil disetujui",
      });

      fetchPendingTransactions();
    } catch (error: any) {
      console.error("Error approving transaction:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menyetujui transaksi",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const approvePurchaseTransaction = async (
    transaction: PendingTransaction,
    userId: string,
  ) => {
    // Create journal entries
    const journalRef =
      transaction.journal_ref ||
      `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Debit: Expense/Inventory account
    // Credit: Cash/Payable account
    const debitAccount =
      transaction.coa_expense_code || transaction.coa_inventory_code;
    const creditAccount =
      transaction.payment_method === "Tunai"
        ? transaction.coa_cash_code
        : transaction.coa_payable_code;

    if (debitAccount && creditAccount) {
      const { error: journalError } = await supabase
        .from("journal_entries")
        .insert({
          journal_ref: journalRef,
          debit_account: debitAccount,
          credit_account: creditAccount,
          debit: transaction.total_amount,
          credit: transaction.total_amount,
          description: `${transaction.transaction_type === "Barang" ? "Pembelian Barang" : "Pembelian Jasa"} - ${transaction.item_name}`,
          tanggal: transaction.transaction_date,
          kategori: transaction.transaction_type,
          jenis_transaksi:
            transaction.transaction_type === "Barang"
              ? "Pembelian Barang"
              : "Pembelian Jasa",
        });

      if (journalError) throw journalError;
    }

    // Update purchase transaction status
    const { error: updateError } = await supabase
      .from("purchase_transactions")
      .update({
        approval_status: "approved",
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) throw updateError;
  };

  const approveExpenseTransaction = async (
    transaction: PendingTransaction,
    userId: string,
  ) => {
    // Create journal entry for expense
    const journalRef = `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For expense: Debit expense account, Credit cash account
    const { error: journalError } = await supabase
      .from("journal_entries")
      .insert({
        journal_ref: journalRef,
        debit_account: "6-1100", // Default expense account
        credit_account: transaction.account_number || "1-1100",
        debit: transaction.nominal,
        credit: transaction.nominal,
        description: transaction.keterangan || "Pengeluaran Kas",
        tanggal: transaction.tanggal,
        kategori: transaction.service_category,
        jenis_transaksi: "Pengeluaran Kas",
      });

    if (journalError) throw journalError;

    // Update kas_transaksi status
    const { error: updateError } = await supabase
      .from("kas_transaksi")
      .update({
        approval_status: "approved",
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) throw updateError;
  };

  const approveIncomeTransaction = async (
    transaction: PendingTransaction,
    userId: string,
  ) => {
    // Create journal entry for income
    const journalRef = `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For income: Debit cash account, Credit revenue account
    const { error: journalError } = await supabase
      .from("journal_entries")
      .insert({
        journal_ref: journalRef,
        debit_account: transaction.coa_cash_code || "1-1100",
        credit_account: transaction.coa_contra_code || "4-1000",
        debit: transaction.amount,
        credit: transaction.amount,
        description: transaction.description || "Penerimaan Kas",
        tanggal: transaction.transaction_date,
        kategori: transaction.category,
        jenis_transaksi: "Penerimaan Kas",
      });

    if (journalError) throw journalError;

    // Update cash_and_bank_receipts status
    const { error: updateError } = await supabase
      .from("cash_and_bank_receipts")
      .update({
        approval_status: "approved",
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) throw updateError;
  };

  const approveCashDisbursementTransaction = async (
    transaction: PendingTransaction,
    userId: string,
  ) => {
    // Create journal entry for cash disbursement
    const journalRef =
      transaction.journal_ref ||
      `JRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For cash disbursement: Debit expense account, Credit cash account
    const debitAccount = transaction.coa_expense_code || "6-1100";
    const creditAccount = transaction.coa_cash_code || "1-1100";

    const { error: journalError } = await supabase
      .from("journal_entries")
      .insert({
        journal_ref: journalRef,
        debit_account: debitAccount,
        credit_account: creditAccount,
        debit: transaction.amount,
        credit: transaction.amount,
        description: transaction.description || "Pengeluaran Kas",
        tanggal: transaction.transaction_date,
        kategori: transaction.category,
        jenis_transaksi: "Pengeluaran Kas",
      });

    if (journalError) throw journalError;

    // Update cash_disbursement status
    const { error: updateError } = await supabase
      .from("cash_disbursement")
      .update({
        approval_status: "approved",
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) throw updateError;
  };

  const handleReject = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!selectedTransaction) return;

    setProcessingId(selectedTransaction.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const table =
        selectedTransaction.type === "purchase"
          ? "purchase_transactions"
          : selectedTransaction.type === "cash_disbursement"
            ? "cash_disbursement"
            : "kas_transaksi";

      const { error } = await supabase
        .from(table)
        .update({
          approval_status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedTransaction.id);

      if (error) throw error;

      toast({
        title: "✅ Berhasil",
        description: "Transaksi berhasil ditolak",
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedTransaction(null);
      fetchPendingTransactions();
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menolak transaksi",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/*   <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        */}
        {canEdit(userRole) && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-6 w-6" />
                Approval Transaksi
              </CardTitle>
              <p className="text-blue-100 text-sm">
                Kelola persetujuan untuk Pembelian Barang, Penerimaan Kas,
                Pengeluaran Kas, dan Cash Disbursement
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Memuat transaksi...</p>
                </div>
              ) : pendingTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700">
                    Tidak ada transaksi pending
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Semua transaksi sudah disetujui atau ditolak
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Supplier/Kategori</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {formatDate(
                              transaction.transaction_date ||
                                transaction.tanggal ||
                                "",
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "purchase"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {transaction.type === "purchase"
                                ? "Pembelian"
                                : transaction.type === "cash_disbursement"
                                  ? "Pengeluaran Kas"
                                  : "Pengeluaran"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.type === "purchase"
                              ? transaction.item_name
                              : transaction.type === "cash_disbursement"
                                ? transaction.description
                                : transaction.keterangan}
                          </TableCell>
                          <TableCell>
                            {transaction.type === "purchase"
                              ? transaction.supplier_name
                              : transaction.type === "cash_disbursement"
                                ? transaction.payee_name || transaction.category
                                : transaction.service_category}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(
                              transaction.total_amount ||
                                transaction.amount ||
                                transaction.nominal ||
                                0,
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.payment_method ||
                                transaction.payment_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(transaction)}
                                disabled={processingId === transaction.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(transaction)}
                                disabled={processingId === transaction.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Transaksi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan transaksi ini
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              Tolak Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
