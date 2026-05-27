/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { State, City } from "country-state-city";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

// Import your custom TanStack Query hooks
import { 
  useFacilityCompanyById, 
  useUpdateFacilityCompany 
} from "@/features/facilityCompany/facilityCompany.queries";

export default function EditFacilityCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const facilityCompanyId = params.id;

  // --- TANSTACK QUERIES & MUTATIONS ---
  const { 
    data: facilityCompany, 
    isLoading, 
    isError, 
    error 
  } = useFacilityCompanyById(facilityCompanyId);
  
  const updateMutation = useUpdateFacilityCompany();

  // --- DROPDOWN STATES ---
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // --- FORM DATA ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    registration_number: "",
    pan_number: "",
    license_number: "",
    license_expiry_date: "",
    contract_start_date: "",
    contract_end_date: "",
    description: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  // --- INITIAL LOAD (States) ---
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  // --- POPULATE FORM DATA ONCE FETCHED ---
  useEffect(() => {
    if (facilityCompany) {
      setFormData({
        ...facilityCompany,
        license_expiry_date: facilityCompany.license_expiry_date
          ? new Date(facilityCompany.license_expiry_date).toISOString().split("T")[0]
          : "",
        contract_start_date: facilityCompany.contract_start_date
          ? new Date(facilityCompany.contract_start_date).toISOString().split("T")[0]
          : "",
        contract_end_date: facilityCompany.contract_end_date
          ? new Date(facilityCompany.contract_end_date).toISOString().split("T")[0]
          : "",
      });

      setStateSearch(facilityCompany.state || "");
      setCitySearch(facilityCompany.city || "");

      if (facilityCompany.state) {
        const indiaStates = State.getStatesOfCountry("IN");
        const selectedState = indiaStates.find((s) => s.name === facilityCompany.state);
        if (selectedState) {
          const cities = City.getCitiesOfState("IN", selectedState.isoCode);
          setAvailableCities(cities.map((c) => c.name));
        }
      }
    }
  }, [facilityCompany]);

  // --- HANDLE FETCH ERRORS ---
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to load details");
      router.push(`/facility-company?companyId=${companyId}`);
    }
  }, [isError, error, router, companyId]);

  // --- CLICK OUTSIDE FOR DROPDOWNS ---
  useEffect(() => {
    const listener = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target))
        setShowStateDropdown(false);
      if (cityRef.current && !cityRef.current.contains(e.target))
        setShowCityDropdown(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStateSelect = (state) => {
    setFormData((prev) => ({ ...prev, state: state, city: "" }));
    setStateSearch(state);
    setCitySearch("");
    setShowStateDropdown(false);

    const indiaStates = State.getStatesOfCountry("IN");
    const selectedState = indiaStates.find((s) => s.name === state);
    if (selectedState) {
      const cities = City.getCitiesOfState("IN", selectedState.isoCode);
      setAvailableCities(cities.map((c) => c.name));
    } else {
      setAvailableCities([]);
    }
    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city: city }));
    setCitySearch(city);
    setShowCityDropdown(false);
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  // --- FILTERS ---
  const filteredStates = availableStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase()),
  );
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // --- VALIDATE ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Required";
    if (!formData.phone?.trim()) newErrors.phone = "Required";
    else if (!/^\d{10}$/.test(formData.phone.trim()))
      newErrors.phone = "Must be 10 digits";
    if (!formData.contact_person_name?.trim())
      newErrors.contact_person_name = "Required";
    if (!formData.state?.trim()) newErrors.state = "Required";
    if (!formData.city?.trim()) newErrors.city = "Required";
    if (!formData.pincode?.trim()) newErrors.pincode = "Required";
    else if (!/^\d{6}$/.test(formData.pincode.trim()))
      newErrors.pincode = "Must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fix errors");

    const submitData = {
      ...formData,
      registration_number: formData.registration_number?.trim() || null,
      license_expiry_date: formData.license_expiry_date || null,
      contract_start_date: formData.contract_start_date || null,
      contract_end_date: formData.contract_end_date || null,
    };

    updateMutation.mutate(
      { id: facilityCompanyId, data: submitData },
      {
        onSuccess: () => {
          toast.success("Updated successfully!");
          setTimeout(
            () => router.push(`/facility-company?companyId=${companyId}`),
            1000,
          );
        },
        onError: (error) => {
          toast.error(error.message || "Update failed");
        },
      }
    );
  };

  // Standardized input classes for perfect dark mode rendering
  const baseInputClasses =
    "w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed";

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader size="large" color="#3b82f6" />
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex justify-center pb-20">
        <div className="w-full max-w-5xl space-y-6">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-500 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Edit Facility Company
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Basic Information
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Company Identity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${baseInputClasses} focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 ${
                      errors.name
                        ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                        : "border-slate-200 dark:border-slate-700/80"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${baseInputClasses} pl-10 border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="phone"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${baseInputClasses} pl-10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 ${
                        errors.phone
                          ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                          : "border-slate-200 dark:border-slate-700/80"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 w-fit">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Active Status
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. CONTACT PERSON */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Contact Person
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Representative Details
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleChange}
                    className={`${baseInputClasses} focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 dark:focus:border-purple-400 ${
                      errors.contact_person_name
                        ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                        : "border-slate-200 dark:border-slate-700/80"
                    }`}
                  />
                  {errors.contact_person_name && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {errors.contact_person_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_phone"
                      value={formData.contact_person_phone}
                      onChange={handleChange}
                      className={`${baseInputClasses} pl-10 border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 dark:focus:border-purple-400`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_email"
                      value={formData.contact_person_email}
                      onChange={handleChange}
                      className={`${baseInputClasses} pl-10 border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 dark:focus:border-purple-400`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ADDRESS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400">
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Location
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Headquarters Address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`${baseInputClasses} !h-auto p-4 border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:focus:border-orange-400 resize-none`}
                  />
                </div>

                <div className="space-y-2" ref={stateRef}>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={stateSearch || formData.state}
                      onChange={(e) => {
                        setStateSearch(e.target.value);
                        setShowStateDropdown(true);
                        if (!e.target.value)
                          setFormData((p) => ({ ...p, state: "", city: "" }));
                      }}
                      onFocus={() => setShowStateDropdown(true)}
                      className={`${baseInputClasses} focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:focus:border-orange-400 ${
                        errors.state
                          ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                          : "border-slate-200 dark:border-slate-700/80"
                      }`}
                      placeholder="Search State"
                    />
                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredStates.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStateSelect(s)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2" ref={cityRef}>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={citySearch || formData.city}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() =>
                        formData.state && setShowCityDropdown(true)
                      }
                      disabled={!formData.state}
                      className={`${baseInputClasses} focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:focus:border-orange-400 ${
                        errors.city
                          ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                          : "border-slate-200 dark:border-slate-700/80"
                      }`}
                      placeholder={
                        formData.state ? "Search City" : "Select State First"
                      }
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleCitySelect(c)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="pincode"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`${baseInputClasses} focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:focus:border-orange-400 ${
                      errors.pincode
                        ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                        : "border-slate-200 dark:border-slate-700/80"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 4. BUSINESS & LEGAL */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center border border-teal-100 dark:border-teal-500/20 text-teal-600 dark:text-teal-400">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Legal Details
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Registration & Contract
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    GST / Reg Number
                  </label>
                  <input
                    name="registration_number"
                    value={formData.registration_number || ""}
                    onChange={handleChange}
                    className={`${baseInputClasses} border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    PAN Number
                  </label>
                  <input
                    name="pan_number"
                    value={formData.pan_number || ""}
                    onChange={handleChange}
                    maxLength="10"
                    className={`${baseInputClasses} focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400 ${
                      errors.pan_number
                        ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10"
                        : "border-slate-200 dark:border-slate-700/80"
                    }`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    name="license_expiry_date"
                    value={formData.license_expiry_date || ""}
                    onChange={handleChange}
                    className={`${baseInputClasses} border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Contract Start
                  </label>
                  <input
                    type="date"
                    name="contract_start_date"
                    value={formData.contract_start_date || ""}
                    onChange={handleChange}
                    className={`${baseInputClasses} border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Contract End
                  </label>
                  <input
                    type="date"
                    name="contract_end_date"
                    value={formData.contract_end_date || ""}
                    onChange={handleChange}
                    className={`${baseInputClasses} border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400`}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={2}
                    className={`${baseInputClasses} !h-auto p-4 border-slate-200 dark:border-slate-700/80 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-400 resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={updateMutation.isPending}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updateMutation.isPending ? "Updating..." : "Update Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}