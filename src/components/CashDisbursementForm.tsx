import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Upload, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CashDisbursementFormProps {
  onSuccess?: () => void;
}

export default function CashDisbursementForm({
  onSuccess,
}: CashDisbursementFormProps = {}) {
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [payeeName, setPayeeName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [bankAccount, setBankAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [coaExpenseCode, setCoaExpenseCode] = useState("");
  const [coaCashCode, setCoaCashCode] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coaAccounts, setCoaAccounts] = useState<any[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchCOAAccounts();
  }, []);

  const fetchCOAAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("account_code");

      if (error) throw error;

      setCoaAccounts(data || []);

      // Filter expense accounts (6-xxxx)
      const expenses = (data || []).filter((acc: any) =>
        acc.account_code.startsWith("6-"),
      );
      setExpenseAccounts(expenses);

      // Filter cash accounts (1-11xx)
      const cash = (data || []).filter((acc: any) =>
        acc.account_code.startsWith("1-11"),
      );
      setCashAccounts(cash);

      // Set default accounts
      if (expenses.length > 0) setCoaExpenseCode(expenses[0].account_code);
      if (cash.length > 0) setCoaCashCode(cash[0].account_code);
    } catch (error: any) {
      console.error("Error fetching COA:", error);
      toast({
        title: "❌ Error",
        description: "Gagal memuat Chart of Accounts",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentFile(file);
  };

  const uploadAttachment = async (): Promise<string | null> => {
    if (!attachmentFile) return null;

    try {
      setUploading(true);
      const fileExt = attachmentFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cash-disbursements/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, attachmentFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "❌ Error",
        description: "Gagal upload file: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payeeName || !description || !amount) {
      toast({
        title: "⚠️ Peringatan",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Upload attachment if exists
      let attachmentUrl = null;
      if (attachmentFile) {
        attachmentUrl = await uploadAttachment();
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const disbursementData = {
        transaction_date: format(transactionDate, "yyyy-MM-dd"),
        payee_name: payeeName,
        description: description,
        category: category || null,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        bank_account: bankAccount || null,
        coa_expense_code: coaExpenseCode,
        coa_cash_code: coaCashCode,
        attachment_url: attachmentUrl,
        notes: notes || null,
        created_by: user?.id,
        approval_status: "waiting_approval",
      };

      const { error } = await supabase
        .from("cash_disbursement")
        .insert(disbursementData);

      if (error) throw error;

      toast({
        title: "✅ Berhasil",
        description: "Pengeluaran kas berhasil disimpan dan menunggu approval",
      });

      // Reset form
      setPayeeName("");
      setDescription("");
      setCategory("");
      setAmount("");
      setPaymentMethod("Tunai");
      setBankAccount("");
      setNotes("");
      setAttachmentFile(null);
      setTransactionDate(new Date());

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving cash disbursement:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Gagal menyimpan pengeluaran kas",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600">
        <CardTitle className="text-white text-2xl">
          Form Pengeluaran Kas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Tanggal Transaksi *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !transactionDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionDate ? (
                      format(transactionDate, "PPP")
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={transactionDate}
                    onSelect={(date) => date && setTransactionDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Metode Pembayaran *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tunai">Tunai</SelectItem>
                  <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                  <SelectItem value="Cek">Cek</SelectItem>
                  <SelectItem value="Giro">Giro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payee Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payee-name">Nama Penerima *</Label>
              <Input
                id="payee-name"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Masukkan nama penerima"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Operasional, Utilitas, dll"
              />
            </div>
          </div>

          {/* Amount and Bank Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {paymentMethod !== "Tunai" && (
              <div className="space-y-2">
                <Label htmlFor="bank-account">Rekening Bank</Label>
                <Input
                  id="bank-account"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Nomor rekening atau nama bank"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan pengeluaran"
              rows={3}
              required
            />
          </div>

          {/* COA Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coa-expense">Akun Beban</Label>
              <Select value={coaExpenseCode} onValueChange={setCoaExpenseCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseAccounts.map((acc) => (
                    <SelectItem key={acc.account_code} value={acc.account_code}>
                      {acc.account_code} - {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coa-cash">Akun Kas</Label>
              <Select value={coaCashCode} onValueChange={setCoaCashCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cashAccounts.map((acc) => (
                    <SelectItem key={acc.account_code} value={acc.account_code}>
                      {acc.account_code} - {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan internal (opsional)"
              rows={2}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Lampiran Bukti</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="flex-1"
              />
              {attachmentFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {attachmentFile && (
              <p className="text-sm text-gray-600">
                File: {attachmentFile.name} (
                {(attachmentFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving || uploading}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengeluaran
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>ℹ️ Informasi:</strong> Pengeluaran kas akan disimpan
              dengan status "Menunggu Approval" dan tidak akan mempengaruhi
              jurnal atau kas sampai disetujui oleh admin/manager.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
