import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import SupplierForm from "@/components/SupplierForm";
import ConsigneeForm from "@/components/ConsigneeForm";
import ShipperForm from "@/components/ShipperForm";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormContentProps {
  onSuccess?: () => void;
  isDialog?: boolean;
}

// Exported component for use in Header dialog
export function AuthFormContent({
  onSuccess,
  isDialog = false,
}: AuthFormContentProps) {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    roleName: "",
    roleEntity: "", // Track the entity of the selected role
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    password: "",
    ktpAddress: "",
    ktpNumber: "",
    religion: "",
    ethnicity: "",
    education: "",
    phoneNumber: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    // Vehicle fields for Driver Mitra
    vehicleBrand: "",
    vehicleModel: "",
    plateNumber: "",
    vehicleYear: "",
    vehicleColor: "",
    selfiePhoto: null as File | null,
    familyCard: null as File | null,
    ktpDocument: null as File | null,
    simDocument: null as File | null,
    skckDocument: null as File | null,
    stnkDocument: null as File | null,
    vehiclePhoto: null as File | null,
  });
  const [showEntityForm, setShowEntityForm] = useState<
    "supplier" | "consignee" | "shipper" | null
  >(null);

  // Supplier/Consignee/Shipper form data
  const [entityFormData, setEntityFormData] = useState({
    entity_name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    city: "",
    country: "",
    address: "",
    is_pkp: "",
    tax_id: "",
    bank_name: "",
    bank_account_holder: "",
    payment_terms: "",
    category: "",
    currency: "IDR",
    status: "ACTIVE",
  });

  // Load roles from database
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("roles")
      .select("id, role_name, entity")
      .order("role_name", { ascending: true });

    if (error) {
      console.error("Error loading roles:", error);
    } else {
      setRoles(data || []);
    }
  };

  // Helper function to humanize role names
  const humanizeRole = (roleName: string) => {
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(signInData.email, signInData.password);
      toast({ title: "Success", description: "Signed in successfully" });
      onSuccess?.();
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare details object based on entity type
      const details: Record<string, any> = {};
      const fileUrls: Record<string, string> = {};

      const entityType = signUpData.roleName; // roleName is actually entity_type

      if (
        entityType === "supplier" ||
        entityType === "consignee" ||
        entityType === "shipper" ||
        entityType === "customer"
      ) {
        // Entity-specific details
        Object.assign(details, {
          entity_name: entityFormData.entity_name,
          contact_person: entityFormData.contact_person,
          city: entityFormData.city,
          country: entityFormData.country,
          address: entityFormData.address,
          is_pkp: entityFormData.is_pkp,
          tax_id: entityFormData.tax_id,
          bank_name: entityFormData.bank_name,
          bank_account_holder: entityFormData.bank_account_holder,
          payment_terms: entityFormData.payment_terms,
          category: entityFormData.category,
          currency: entityFormData.currency,
          status: entityFormData.status,
        });
      }

      if (
        entityType === "karyawan" ||
        entityType === "driver_perusahaan" ||
        entityType === "driver_mitra"
      ) {
        // Employee/Driver details
        Object.assign(details, {
          ktp_address: signUpData.ktpAddress,
          ijasah: signUpData.ijasah,
          ktp_number: signUpData.ktpNumber,
          religion: signUpData.religion,
          ethnicity: signUpData.ethnicity,
          education: signUpData.education,
          license_number: signUpData.licenseNumber,
          license_expiry_date: signUpData.licenseExpiryDate,
        });

        // Additional vehicle details for Driver Mitra
        if (entityType === "driver_mitra") {
          Object.assign(details, {
            vehicle_brand: signUpData.vehicleBrand,
            vehicle_model: signUpData.vehicleModel,
            plate_number: signUpData.plateNumber,
            vehicle_year: signUpData.vehicleYear,
            vehicle_color: signUpData.vehicleColor,
          });
        }

        // File URLs for karyawan entity - map to correct database columns
        if (signUpData.ktpDocument) {
          fileUrls.upload_ktp_url = `LOCAL:${signUpData.ktpDocument.name}`;
        }
        if (signUpData.ijasahDocument) {
          fileUrls.upload_ijasah_url = `LOCAL:${signUpData.ijasahDocument.name}`;
        }
        if (signUpData.selfiePhoto) {
          fileUrls.foto_selfie_url = `LOCAL:${signUpData.selfiePhoto.name}`;
        }
        if (signUpData.familyCard) {
          fileUrls.upload_kk_url = `LOCAL:${signUpData.familyCard.name}`;
        }
        if (signUpData.simDocument) {
          fileUrls.upload_sim_url = `LOCAL:${signUpData.simDocument.name}`;
        }
        if (signUpData.skckDocument) {
          fileUrls.upload_skck_url = `LOCAL:${signUpData.skckDocument.name}`;
        }

        // Additional file URLs for Driver Mitra
        if (entityType === "driver_mitra") {
          if (signUpData.stnkDocument) {
            fileUrls.upload_stnk_url = `LOCAL:${signUpData.stnkDocument.name}`;
          }
          if (signUpData.vehiclePhoto) {
            fileUrls.upload_vehicle_photo_url = `LOCAL:${signUpData.vehiclePhoto.name}`;
          }
        }
      }

      await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.fullName,
        entityType,
        signUpData.phoneNumber || entityFormData.phone_number,
        details,
        fileUrls,
      );

      toast({
        title: "Success",
        description:
          "Account created! Please check your email for verification.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If used in dialog mode, render without Card wrapper
  if (isDialog) {
    return (
      <Tabs defaultValue="signin" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mt-4">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="px-6 pb-6 mt-4 shrink-0">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showSignInPassword ? "text" : "password"}
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-gray-700 transition-colors"
                >
                  {showSignInPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent
          value="signup"
          className="flex-1 min-h-0 flex flex-col px-6 pb-6 mt-4"
        >
          <form
            onSubmit={handleSignUp}
            className="flex-1 overflow-y-auto pr-2 space-y-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f1f5f9",
            }}
          >
            {/* Role */}
            <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <Label
                htmlFor="signup-role"
                className="text-sm font-medium text-slate-700"
              >
                Role *
              </Label>
              <Select
                value={signUpData.roleName}
                onValueChange={(value) => {
                  const selectedRole = roles.find((r) => r.role_name === value);
                  setSignUpData({
                    ...signUpData,
                    roleName: value,
                    roleEntity: selectedRole?.entity || "",
                  });
                  const lowerRole = value.toLowerCase();
                  if (lowerRole.includes("supplier")) {
                    setShowEntityForm("supplier");
                  } else if (lowerRole.includes("consignee")) {
                    setShowEntityForm("consignee");
                  } else if (lowerRole.includes("shipper")) {
                    setShowEntityForm("shipper");
                  } else {
                    setShowEntityForm(null);
                  }
                }}
              >
                <SelectTrigger
                  id="signup-role"
                  className="bg-white border-blue-200"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.role_name}>
                      {humanizeRole(role.role_name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show entity-specific form if supplier, consignee, or shipper is selected */}
            {showEntityForm && (
              <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                  {showEntityForm === "supplier" && "Supplier Information"}
                  {showEntityForm === "consignee" && "Consignee Information"}
                  {showEntityForm === "shipper" && "Shipper Information"}
                </h3>
                {showEntityForm === "supplier" && <SupplierForm />}
                {showEntityForm === "consignee" && <ConsigneeForm />}
                {showEntityForm === "shipper" && <ShipperForm />}
              </div>
            )}

            {/* Personal Information - Only show if NOT supplier/consignee/shipper */}
            {!showEntityForm && (
              <>
                <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className="text-sm">
                        First Name *
                      </Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname" className="text-sm">
                        Last Name *
                      </Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            lastName: e.target.value,
                          })
                        }
                        required
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="text-sm">
                      Full Name *
                    </Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          fullName: e.target.value,
                        })
                      }
                      required
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                    Account Credentials
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm">
                      Email *
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            password: e.target.value,
                          })
                        }
                        required
                        className="bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignUpPassword(!showSignUpPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-gray-700 transition-colors"
                      >
                        {showSignUpPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Identity Information */}
                <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                    Identity Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="signup-ktp-address" className="text-sm">
                      KTP Address
                    </Label>
                    <Input
                      id="signup-ktp-address"
                      type="text"
                      placeholder="Jl. Example No. 123"
                      value={signUpData.ktpAddress}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          ktpAddress: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-ktp-number" className="text-sm">
                      KTP Number
                    </Label>
                    <Input
                      id="signup-ktp-number"
                      type="text"
                      placeholder="1234567890123456"
                      value={signUpData.ktpNumber}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          ktpNumber: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-religion" className="text-sm">
                        Religion
                      </Label>
                      <Input
                        id="signup-religion"
                        type="text"
                        placeholder="Islam"
                        value={signUpData.religion}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            religion: e.target.value,
                          })
                        }
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-ethnicity" className="text-sm">
                        Ethnicity
                      </Label>
                      <Input
                        id="signup-ethnicity"
                        type="text"
                        placeholder="Jawa"
                        value={signUpData.ethnicity}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            ethnicity: e.target.value,
                          })
                        }
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-education" className="text-sm">
                      Education
                    </Label>
                    <Input
                      id="signup-education"
                      type="text"
                      placeholder="S1"
                      value={signUpData.education}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          education: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={signUpData.phoneNumber}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-license-number" className="text-sm">
                      License Number
                    </Label>
                    <Input
                      id="signup-license-number"
                      type="text"
                      placeholder="1234567890"
                      value={signUpData.licenseNumber}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-license-expiry" className="text-sm">
                      SIM/License Expiry Date
                    </Label>
                    <Input
                      id="signup-license-expiry"
                      type="date"
                      value={signUpData.licenseExpiryDate}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          licenseExpiryDate: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>

                  {/* Vehicle Information - Only for Driver Mitra */}
                  {signUpData.roleEntity === "driver_mitra" && (
                    <>
                      <div className="col-span-2">
                        <h4 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-4">
                          Informasi Kendaraan
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-vehicle-brand"
                          className="text-sm"
                        >
                          Merk Kendaraan *
                        </Label>
                        <Input
                          id="signup-vehicle-brand"
                          type="text"
                          placeholder="Misal: Toyota"
                          value={signUpData.vehicleBrand}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              vehicleBrand: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-vehicle-model"
                          className="text-sm"
                        >
                          Model Kendaraan *
                        </Label>
                        <Input
                          id="signup-vehicle-model"
                          type="text"
                          placeholder="Misal: Avanza"
                          value={signUpData.vehicleModel}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              vehicleModel: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-plate-number"
                          className="text-sm"
                        >
                          Plate Number *
                        </Label>
                        <Input
                          id="signup-plate-number"
                          type="text"
                          placeholder="B 1234 XYZ"
                          value={signUpData.plateNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              plateNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-vehicle-year"
                          className="text-sm"
                        >
                          Tahun Kendaraan *
                        </Label>
                        <Input
                          id="signup-vehicle-year"
                          type="text"
                          placeholder="2020"
                          value={signUpData.vehicleYear}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              vehicleYear: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-vehicle-color"
                          className="text-sm"
                        >
                          Warna Kendaraan *
                        </Label>
                        <Input
                          id="signup-vehicle-color"
                          type="text"
                          placeholder="Hitam"
                          value={signUpData.vehicleColor}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              vehicleColor: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Upload Documents - For Karyawan, Driver Perusahaan, Driver Mitra entities */}
                {(signUpData.roleEntity === "karyawan" ||
                  signUpData.roleEntity === "driver_perusahaan" ||
                  signUpData.roleEntity === "driver_mitra") && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200 pb-2">
                      Upload Dokumen Karyawan
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="upload-ktp" className="text-sm">
                          KTP *
                        </Label>
                        <Input
                          id="upload-ktp"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upload-selfie" className="text-sm">
                          Foto Selfie *
                        </Label>
                        <Input
                          id="upload-selfie"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              selfiePhoto: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upload-ijasah" className="text-sm">
                          Ijasah *
                        </Label>
                        <Input
                          id="upload-ijasah"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ijasahDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upload-family-card" className="text-sm">
                          Kartu Keluarga *
                        </Label>
                        <Input
                          id="upload-family-card"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              familyCard: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upload-sim" className="text-sm">
                          SIM
                        </Label>
                        <Input
                          id="upload-sim"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              simDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upload-skck" className="text-sm">
                          SKCK
                        </Label>
                        <Input
                          id="upload-skck"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              skckDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      {/* STNK and Vehicle Photo - Only for Driver Mitra */}
                      {signUpData.roleEntity === "driver_mitra" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="upload-stnk" className="text-sm">
                              Foto STNK *
                            </Label>
                            <Input
                              id="upload-stnk"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  stnkDocument: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="upload-vehicle-photo"
                              className="text-sm"
                            >
                              Foto Kendaraan *
                            </Label>
                            <Input
                              id="upload-vehicle-photo"
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  vehiclePhoto: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 sticky bottom-0 bg-white border-t">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </TabsContent>
      </Tabs>
    );
  }

  // Original full-page render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>User Roles Management</CardTitle>
          <CardDescription>
            Sign in to manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInData.email}
                    onChange={(e) =>
                      setSignInData({ ...signInData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) =>
                      setSignInData({ ...signInData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={handleSignUp}
                className="space-y-5 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
              >
                {/* Role */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <Label
                    htmlFor="signup-role"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Role *
                  </Label>
                  <Select
                    value={signUpData.roleName}
                    onValueChange={(value) => {
                      const selectedRole = roles.find(
                        (r) => r.role_name === value,
                      );
                      setSignUpData({
                        ...signUpData,
                        roleName: value,
                        roleEntity: selectedRole?.entity || "",
                      });
                      // Check if role is supplier, consignee, or shipper
                      const lowerRole = value.toLowerCase();
                      if (lowerRole.includes("supplier")) {
                        setShowEntityForm("supplier");
                      } else if (lowerRole.includes("consignee")) {
                        setShowEntityForm("consignee");
                      } else if (lowerRole.includes("shipper")) {
                        setShowEntityForm("shipper");
                      } else {
                        setShowEntityForm(null);
                      }
                    }}
                  >
                    <SelectTrigger id="signup-role" className="bg-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.role_name}>
                          {humanizeRole(role.role_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show entity-specific form if supplier, consignee, or shipper is selected */}
                {showEntityForm && (
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                      {showEntityForm === "supplier" && "Supplier Information"}
                      {showEntityForm === "consignee" &&
                        "Consignee Information"}
                      {showEntityForm === "shipper" && "Shipper Information"}
                    </h3>
                    {showEntityForm === "supplier" && <SupplierForm />}
                    {showEntityForm === "consignee" && <ConsigneeForm />}
                    {showEntityForm === "shipper" && <ShipperForm />}
                  </div>
                )}

                {/* Upload Documents - For Karyawan, Driver Perusahaan, Driver Mitra entities */}
                {(signUpData.roleEntity === "karyawan" ||
                  signUpData.roleEntity === "driver_perusahaan" ||
                  signUpData.roleEntity === "driver_mitra") && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200 pb-2">
                      Upload Dokumen Karyawan
                    </h3>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="upload-ktp" className="text-sm">
                          KTP *
                        </Label>
                        <Input
                          id="upload-ktp"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="upload-selfie" className="text-sm">
                          Foto Selfie *
                        </Label>
                        <Input
                          id="upload-selfie"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              selfiePhoto: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="Ijasah" className="text-sm">
                          Ijasah *
                        </Label>
                        <Input
                          id="ijasah"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ijasahDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="upload-family-card" className="text-sm">
                          Kartu Keluarga *
                        </Label>
                        <Input
                          id="upload-family-card"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              familyCard: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="upload-sim" className="text-sm">
                          SIM
                        </Label>
                        <Input
                          id="upload-sim"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              simDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="upload-skck" className="text-sm">
                          SKCK
                        </Label>
                        <Input
                          id="upload-skck"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              skckDocument: e.target.files?.[0] || null,
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      {/* STNK and Vehicle Photo - Only for Driver Mitra */}
                      {signUpData.roleEntity === "driver_mitra" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="upload-stnk" className="text-sm">
                              Foto STNK *
                            </Label>
                            <Input
                              id="upload-stnk"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  stnkDocument: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="upload-vehicle-photo"
                              className="text-sm"
                            >
                              Foto Kendaraan *
                            </Label>
                            <Input
                              id="upload-vehicle-photo"
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  vehiclePhoto: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditional Forms Based on Role - Only show if NOT supplier/consignee/shipper */}
                {!showEntityForm && signUpData.roleName === "supplier" ? (
                  // Supplier Form
                  <>
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Supplier Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="entity-name" className="text-sm">
                          Supplier Name *
                        </Label>
                        <Input
                          id="entity-name"
                          type="text"
                          placeholder="PT. Supplier Indonesia"
                          value={entityFormData.entity_name}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              entity_name: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="contact-person" className="text-sm">
                            Contact Person *
                          </Label>
                          <Input
                            id="contact-person"
                            type="text"
                            placeholder="John Doe"
                            value={entityFormData.contact_person}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                contact_person: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm">
                            Phone *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={entityFormData.phone_number}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                phone_number: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entity-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="entity-email"
                          type="email"
                          placeholder="supplier@example.com"
                          value={entityFormData.email}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm">
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="Jakarta"
                            value={entityFormData.city}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                city: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm">
                            Country
                          </Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="Indonesia"
                            value={entityFormData.country}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                country: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Jl. Contoh No. 123"
                          value={entityFormData.address}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              address: e.target.value,
                            })
                          }
                          rows={3}
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="is-pkp" className="text-sm">
                            PKP
                          </Label>
                          <Select
                            value={entityFormData.is_pkp}
                            onValueChange={(value) =>
                              setEntityFormData({
                                ...entityFormData,
                                is_pkp: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-50">
                              <SelectValue placeholder="Pilih status PKP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKP">PKP</SelectItem>
                              <SelectItem value="Non PKP">Non PKP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-id" className="text-sm">
                            Tax ID / No. PKP
                          </Label>
                          <Input
                            id="tax-id"
                            type="text"
                            placeholder="01.234.567.8-901.000"
                            value={entityFormData.tax_id}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                tax_id: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="bank-name" className="text-sm">
                            Bank Name
                          </Label>
                          <Input
                            id="bank-name"
                            type="text"
                            placeholder="Bank BCA"
                            value={entityFormData.bank_name}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_name: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-holder" className="text-sm">
                            Account Holder
                          </Label>
                          <Input
                            id="bank-holder"
                            type="text"
                            placeholder="PT. Supplier Indonesia"
                            value={entityFormData.bank_account_holder}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_account_holder: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm">
                            Category
                          </Label>
                          <Input
                            id="category"
                            type="text"
                            placeholder="GOODS"
                            value={entityFormData.category}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                category: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-terms" className="text-sm">
                            Payment Terms
                          </Label>
                          <Input
                            id="payment-terms"
                            type="text"
                            placeholder="NET 30"
                            value={entityFormData.payment_terms}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                payment_terms: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : signUpData.roleName === "consignee" ? (
                  // Consignee Form
                  <>
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Consignee Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="entity-name" className="text-sm">
                          Consignee Name *
                        </Label>
                        <Input
                          id="entity-name"
                          type="text"
                          placeholder="PT. Consignee Indonesia"
                          value={entityFormData.entity_name}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              entity_name: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="contact-person" className="text-sm">
                            Contact Person *
                          </Label>
                          <Input
                            id="contact-person"
                            type="text"
                            placeholder="John Doe"
                            value={entityFormData.contact_person}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                contact_person: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm">
                            Phone *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={entityFormData.phone_number}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                phone_number: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entity-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="entity-email"
                          type="email"
                          placeholder="consignee@example.com"
                          value={entityFormData.email}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm">
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="Jakarta"
                            value={entityFormData.city}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                city: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm">
                            Country
                          </Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="Indonesia"
                            value={entityFormData.country}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                country: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Jl. Contoh No. 123"
                          value={entityFormData.address}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              address: e.target.value,
                            })
                          }
                          rows={3}
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="is-pkp" className="text-sm">
                            PKP
                          </Label>
                          <Select
                            value={entityFormData.is_pkp}
                            onValueChange={(value) =>
                              setEntityFormData({
                                ...entityFormData,
                                is_pkp: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-50">
                              <SelectValue placeholder="Pilih status PKP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKP">PKP</SelectItem>
                              <SelectItem value="Non PKP">Non PKP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-id" className="text-sm">
                            Tax ID / No. PKP
                          </Label>
                          <Input
                            id="tax-id"
                            type="text"
                            placeholder="01.234.567.8-901.000"
                            value={entityFormData.tax_id}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                tax_id: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="bank-name" className="text-sm">
                            Bank Name
                          </Label>
                          <Input
                            id="bank-name"
                            type="text"
                            placeholder="Bank BCA"
                            value={entityFormData.bank_name}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_name: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-holder" className="text-sm">
                            Account Holder
                          </Label>
                          <Input
                            id="bank-holder"
                            type="text"
                            placeholder="PT. Consignee Indonesia"
                            value={entityFormData.bank_account_holder}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_account_holder: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm">
                            Category
                          </Label>
                          <Input
                            id="category"
                            type="text"
                            placeholder="GOODS"
                            value={entityFormData.category}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                category: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-terms" className="text-sm">
                            Payment Terms
                          </Label>
                          <Input
                            id="payment-terms"
                            type="text"
                            placeholder="NET 30"
                            value={entityFormData.payment_terms}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                payment_terms: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : signUpData.roleName === "shipper" ? (
                  // Shipper Form
                  <>
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Shipper Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="entity-name" className="text-sm">
                          Shipper Name *
                        </Label>
                        <Input
                          id="entity-name"
                          type="text"
                          placeholder="PT. Shipper Indonesia"
                          value={entityFormData.entity_name}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              entity_name: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="contact-person" className="text-sm">
                            Contact Person *
                          </Label>
                          <Input
                            id="contact-person"
                            type="text"
                            placeholder="John Doe"
                            value={entityFormData.contact_person}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                contact_person: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm">
                            Phone *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={entityFormData.phone_number}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                phone_number: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entity-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="entity-email"
                          type="email"
                          placeholder="shipper@example.com"
                          value={entityFormData.email}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm">
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="Jakarta"
                            value={entityFormData.city}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                city: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm">
                            Country
                          </Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="Indonesia"
                            value={entityFormData.country}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                country: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Jl. Contoh No. 123"
                          value={entityFormData.address}
                          onChange={(e) =>
                            setEntityFormData({
                              ...entityFormData,
                              address: e.target.value,
                            })
                          }
                          rows={3}
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="is-pkp" className="text-sm">
                            PKP
                          </Label>
                          <Select
                            value={entityFormData.is_pkp}
                            onValueChange={(value) =>
                              setEntityFormData({
                                ...entityFormData,
                                is_pkp: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-50">
                              <SelectValue placeholder="Pilih status PKP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKP">PKP</SelectItem>
                              <SelectItem value="Non PKP">Non PKP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-id" className="text-sm">
                            Tax ID / No. PKP
                          </Label>
                          <Input
                            id="tax-id"
                            type="text"
                            placeholder="01.234.567.8-901.000"
                            value={entityFormData.tax_id}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                tax_id: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="bank-name" className="text-sm">
                            Bank Name
                          </Label>
                          <Input
                            id="bank-name"
                            type="text"
                            placeholder="Bank BCA"
                            value={entityFormData.bank_name}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_name: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-holder" className="text-sm">
                            Account Holder
                          </Label>
                          <Input
                            id="bank-holder"
                            type="text"
                            placeholder="PT. Shipper Indonesia"
                            value={entityFormData.bank_account_holder}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                bank_account_holder: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm">
                            Category
                          </Label>
                          <Input
                            id="category"
                            type="text"
                            placeholder="GOODS"
                            value={entityFormData.category}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                category: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-terms" className="text-sm">
                            Payment Terms
                          </Label>
                          <Input
                            id="payment-terms"
                            type="text"
                            placeholder="NET 30"
                            value={entityFormData.payment_terms}
                            onChange={(e) =>
                              setEntityFormData({
                                ...entityFormData,
                                payment_terms: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Default Form for other roles
                  <>
                    {/* Personal Information Section */}
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Personal Information
                      </h3>

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-firstname" className="text-sm">
                            First Name *
                          </Label>
                          <Input
                            id="signup-firstname"
                            type="text"
                            placeholder="John"
                            value={signUpData.firstName}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                firstName: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-lastname" className="text-sm">
                            Last Name *
                          </Label>
                          <Input
                            id="signup-lastname"
                            type="text"
                            placeholder="Doe"
                            value={signUpData.lastName}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                lastName: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-fullname" className="text-sm">
                          Full Name *
                        </Label>
                        <Input
                          id="signup-fullname"
                          type="text"
                          placeholder="John Doe"
                          value={signUpData.fullName}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              fullName: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Account Credentials Section */}
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Account Credentials
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signUpData.email}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm">
                          Password *
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpData.password}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              password: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* KTP & Personal Details Section */}
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Identity Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-ktp-address" className="text-sm">
                          KTP Address
                        </Label>
                        <Input
                          id="signup-ktp-address"
                          type="text"
                          placeholder="Jl. Example No. 123"
                          value={signUpData.ktpAddress}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpAddress: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-ktp-number" className="text-sm">
                          KTP Number
                        </Label>
                        <Input
                          id="signup-ktp-number"
                          type="text"
                          placeholder="1234567890123456"
                          value={signUpData.ktpNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-religion" className="text-sm">
                            Religion
                          </Label>
                          <Input
                            id="signup-religion"
                            type="text"
                            placeholder="Islam"
                            value={signUpData.religion}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                religion: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-ethnicity" className="text-sm">
                            Ethnicity
                          </Label>
                          <Input
                            id="signup-ethnicity"
                            type="text"
                            placeholder="Jawa"
                            value={signUpData.ethnicity}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                ethnicity: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-education" className="text-sm">
                          Education
                        </Label>
                        <Input
                          id="signup-education"
                          type="text"
                          placeholder="S1"
                          value={signUpData.education}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              education: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                        Contact Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          value={signUpData.phoneNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-license-number"
                          className="text-sm"
                        >
                          License Number
                        </Label>
                        <Input
                          id="signup-license-number"
                          type="text"
                          placeholder="1234567890"
                          value={signUpData.licenseNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              licenseNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-license-expiry"
                          className="text-sm"
                        >
                          SIM/License Expiry Date
                        </Label>
                        <Input
                          id="signup-license-expiry"
                          type="date"
                          value={signUpData.licenseExpiryDate}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              licenseExpiryDate: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for standalone page usage
export default function AuthForm() {
  return <AuthFormContent isDialog={false} />;
}
