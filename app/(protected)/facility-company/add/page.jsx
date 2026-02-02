"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Save,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { State, City } from "country-state-city";

import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

export default function AddFacilityCompanyPage() {
  useRequirePermission(MODULES.FACILITY_COMPANIES);

  const { canAdd } = usePermissions();
  const canAddFacility = canAdd(MODULES.FACILITY_COMPANIES);

  const router = useRouter();
  const { companyId } = useCompanyId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DROPDOWN STATE ---
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

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

  // --- INITIAL LOAD ---
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((state) => state.name));
  }, []);

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost.",
      )
    ) {
      router.push(`/facility-company?companyId=${companyId}`);
    }
  };
  // --- CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target))
        setShowStateDropdown(false);
      if (cityRef.current && !cityRef.current.contains(e.target))
        setShowCityDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setAvailableCities(cities.map((city) => city.name));
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
  const filteredStates = availableStates.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase()),
  );
  const filteredCities = availableCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Company name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone.trim()))
      newErrors.phone = "Must be 10 digits";

    if (!formData.contact_person_name?.trim())
      newErrors.contact_person_name = "Name is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";

    if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode.trim()))
      newErrors.pincode = "Must be 6 digits";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (
      formData.contact_person_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_person_email)
    )
      newErrors.contact_person_email = "Invalid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddFacility) return toast.error("Permission denied");
    if (!validateForm()) return toast.error("Please fix errors");
    if (!companyId) return toast.error("Company ID missing");

    setIsSubmitting(true);
    const submitData = {
      ...formData,
      company_id: companyId,
      license_expiry_date: formData.license_expiry_date || null,
      contract_start_date: formData.contract_start_date || null,
      contract_end_date: formData.contract_end_date || null,
    };

    const result = await FacilityCompanyApi.create(submitData);
    if (result.success) {
      toast.success("Facility company added!");
      setTimeout(
        () => router.push(`/facility-company?companyId=${companyId}`),
        1000,
      );
    } else {
      toast.error(result.error || "Failed to add");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex justify-center pb-20">
        <div className="w-full max-w-5xl space-y-6">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              New Facility Company
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Company Details
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    General Information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${errors.name ? "border-rose-300 bg-rose-50/50" : "border-slate-200"}`}
                    placeholder="Enter company legal name"
                  />
                  {errors.name && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                      placeholder="company@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="phone"
                      type="tel"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${errors.phone ? "border-rose-300" : "border-slate-200"}`}
                      placeholder="10-digit number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CONTACT PERSON CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Primary Contact
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Representative Details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none ${errors.contact_person_name ? "border-rose-300" : "border-slate-200"}`}
                    placeholder="Enter representative name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_phone"
                      type="tel"
                      maxLength="10"
                      value={formData.contact_person_phone}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                      placeholder="Personal number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_email"
                      type="email"
                      value={formData.contact_person_email}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                      placeholder="Personal email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ADDRESS CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-600">
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Location
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Registered Address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STATE DROPDOWN */}
                <div className="space-y-2" ref={stateRef}>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
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
                      className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.state ? "border-rose-300" : "border-slate-200"}`}
                      placeholder="Search State"
                    />
                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredStates.map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => handleStateSelect(state)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors"
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* CITY DROPDOWN */}
                <div className="space-y-2" ref={cityRef}>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
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
                      className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.city ? "border-rose-300" : "border-slate-200"} ${!formData.state ? "cursor-not-allowed opacity-60" : ""}`}
                      placeholder={
                        formData.state ? "Search City" : "Select State First"
                      }
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none resize-none"
                    placeholder="Street, Building, Area..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="pincode"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.pincode ? "border-rose-300" : "border-slate-200"}`}
                    placeholder="000000"
                  />
                </div>
              </div>
            </div>

            {/* 4. BUSINESS & CONTRACT CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Legal & Contract
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Business Registration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    GST / Reg Number
                  </label>
                  <input
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                    placeholder="GSTIN12345"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    PAN Number
                  </label>
                  <input
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength="10"
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none ${errors.pan_number ? "border-rose-300" : "border-slate-200"}`}
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    License Expiry
                  </label>
                  <input
                    name="license_expiry_date"
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contract Start
                  </label>
                  <input
                    name="contract_start_date"
                    type="date"
                    value={formData.contract_start_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contract End
                  </label>
                  <input
                    name="contract_end_date"
                    type="date"
                    value={formData.contract_end_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Notes / Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none resize-none"
                    placeholder="Additional notes about the contract or company..."
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !canAddFacility}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSubmitting ? "Saving..." : "Save Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
