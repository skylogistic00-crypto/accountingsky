import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowLeft,
  UserCheck,
  CheckCircle,
  XCircle,
  Filter,
  Phone,
  Mail,
  User,
  MapPin,
  Package,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { canClick } from "@/utils/roleAccess";

interface ConsigneeFormData {
  consignee_code: string;
  consignee_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  city: string;
  country: string;
  is_pkp: string;
  tax_id: string;
  bank_name: string;
  bank_account_holder: string;
  payment_terms: string;
  category: string;
  currency: string;
  status: string;
  address: string;
}

interface Consignee {
  consignee_code: string;
  consignee_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  is_pkp: string;
  category: string;
  status: string;
}

export default function ConsigneeForm() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [consignees, setConsignees] = useState<Consignee[]>([]);
  const [filteredConsignees, setFilteredConsignees] = useState<Consignee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pkpFilter, setPkpFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ConsigneeFormData>({
    consignee_code: "",
    consignee_name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    city: "",
    country: "",
    is_pkp: "",
    tax_id: "",
    bank_name: "",
    bank_account_holder: "",
    payment_terms: "",
    category: "",
    currency: "IDR",
    status: "ACTIVE",
    address: "",
  });

  useEffect(() => {
    fetchConsignees();

    const channel = supabase
      .channel("consignees-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consignees" },
        () => {
          fetchConsignees();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = consignees;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((cons) => cons.status === statusFilter);
    }

    if (pkpFilter !== "ALL") {
      filtered = filtered.filter((cons) => cons.is_pkp === pkpFilter);
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((cons) => cons.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (cons) =>
          cons.consignee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cons.consignee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cons.contact_person.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredConsignees(filtered);
  }, [searchTerm, statusFilter, pkpFilter, categoryFilter, consignees]);

  const fetchConsignees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("consignees")
        .select(
          "consignee_code, consignee_name, contact_person, phone_number, email, is_pkp, category, status",
        )
        .order("consignee_code", { ascending: false });

      if (error) throw error;
      setConsignees(data || []);
      setFilteredConsignees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
    }
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("consignees")
        .insert({
          consignee_name: formData.consignee_name,
          contact_person: formData.contact_person,
          phone_number: formData.phone_number,
          email: formData.email,
          city: formData.city,
          country: formData.country,
          is_pkp: formData.is_pkp,
          tax_id: formData.tax_id,
          bank_name: formData.bank_name,
          bank_account_holder: formData.bank_account_holder,
          payment_terms: formData.payment_terms,
          category: formData.category,
          currency: formData.currency,
          status: formData.status,
          address: formData.address,
        })
        .select();

      if (error) throw error;

      const generatedCode = data && data[0] ? data[0].consignee_code : "";

      toast({
        title: "Success",
        description: `Consignee berhasil ditambahkan dengan kode ${generatedCode}`,
      });

      setFormData({
        consignee_code: "",
        consignee_name: "",
        contact_person: "",
        phone_number: "",
        email: "",
        city: "",
        country: "",
        is_pkp: "",
        tax_id: "",
        bank_name: "",
        bank_account_holder: "",
        payment_terms: "",
        category: "",
        currency: "IDR",
        status: "ACTIVE",
        address: "",
      });

      setIsDialogOpen(false);
      fetchConsignees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "h-4 w-4";
    return <Package className={iconClass} />;
  };

  const getCategoryBadge = (category: string) => {
    if (!category) return <span className="text-sm text-slate-400">-</span>;

    const colors: Record<string, string> = {
      "Import": "bg-blue-100 text-blue-700 border-blue-300",
      "Export": "bg-green-100 text-green-700 border-green-300",
      "Domestic": "bg-purple-100 text-purple-700 border-purple-300",
      "International": "bg-orange-100 text-orange-700 border-orange-300",
    };

    const colorClass =
      colors[category] || "bg-slate-100 text-slate-700 border-slate-300";

    return (
      <Badge className={`flex items-center gap-1 ${colorClass}`}>
        {getCategoryIcon(category)}
        <span className="text-xs">{category}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <Badge className="flex items-center gap-1 w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-1 w-fit bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const getPkpBadge = (isPkp: string) => {
    if (isPkp === "YES") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
          PKP
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300">
        Non-PKP
      </Badge>
    );
  };

  const summaryData = {
    total: consignees.length,
    active: consignees.filter((c) => c.status === "ACTIVE").length,
    inactive: consignees.filter((c) => c.status === "INACTIVE").length,
    pkp: consignees.filter((c) => c.is_pkp === "YES").length,
  };

  const uniqueCategories = Array.from(
    new Set(consignees.map((c) => c.category).filter(Boolean)),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Consignees Management
                </h1>
                <p className="text-sm text-blue-100">
                  Kelola informasi consignee Anda
                </p>
              </div>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              {canClick(userRole) && (
                <Button className="bg-white text-indigo-600 hover:bg-blue-50 shadow-md">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Consignee
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambahkan Consignee Baru</DialogTitle>
                <DialogDescription>Isi detail consignee baru</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Dasar</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consignee_name">Nama Consignee *</Label>
                      <Input
                        id="consignee_name"
                        value={formData.consignee_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consignee_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person *</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_person: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Nomor Telepon *</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone_number: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Kota</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Negara</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Informasi Pajak & Keuangan
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="is_pkp">Status PKP</Label>
                      <Select
                        value={formData.is_pkp}
                        onValueChange={(value) =>
                          setFormData({ ...formData, is_pkp: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status PKP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">PKP</SelectItem>
                          <SelectItem value="NO">Non-PKP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_id">NPWP</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) =>
                          setFormData({ ...formData, tax_id: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Nama Bank</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bank_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_account_holder">
                        Nama Pemilik Rekening
                      </Label>
                      <Input
                        id="bank_account_holder"
                        value={formData.bank_account_holder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bank_account_holder: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_terms">Termin Pembayaran</Label>
                      <Input
                        id="payment_terms"
                        value={formData.payment_terms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_terms: e.target.value,
                          })
                        }
                        placeholder="e.g., NET 30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Mata Uang</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          setFormData({ ...formData, currency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDR">IDR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="SGD">SGD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Kategori & Status</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Import">Import</SelectItem>
                          <SelectItem value="Export">Export</SelectItem>
                          <SelectItem value="Domestic">Domestic</SelectItem>
                          <SelectItem value="International">
                            International
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Consignees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summaryData.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summaryData.active}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summaryData.inactive}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                PKP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summaryData.pkp}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Cari Consignee</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Nama, kode, atau contact person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PKP</Label>
                <Select value={pkpFilter} onValueChange={setPkpFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    <SelectItem value="YES">PKP</SelectItem>
                    <SelectItem value="NO">Non-PKP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kategori</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daftar Consignees</CardTitle>
            <CardDescription>
              Menampilkan {filteredConsignees.length} dari {consignees.length}{" "}
              consignees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Kode</TableHead>
                    <TableHead className="font-semibold">Nama Consignee</TableHead>
                    <TableHead className="font-semibold">
                      Contact Person
                    </TableHead>
                    <TableHead className="font-semibold">Kontak</TableHead>
                    <TableHead className="font-semibold">Kategori</TableHead>
                    <TableHead className="font-semibold">PKP</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="text-slate-500">
                            Memuat data...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredConsignees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <UserCheck className="h-12 w-12 text-slate-300" />
                          <p className="text-slate-500">
                            Tidak ada consignee ditemukan
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsignees.map((consignee) => (
                      <TableRow key={consignee.consignee_code}>
                        <TableCell className="font-medium">
                          {consignee.consignee_code}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">
                              {consignee.consignee_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            {consignee.contact_person}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {consignee.phone_number}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {consignee.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(consignee.category)}</TableCell>
                        <TableCell>{getPkpBadge(consignee.is_pkp)}</TableCell>
                        <TableCell>{getStatusBadge(consignee.status)}</TableCell>
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
