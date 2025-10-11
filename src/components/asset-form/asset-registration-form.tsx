"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { YesNoToggle } from "@/components/ui/yes-no-toggle";
import { FileUpload } from "@/components/ui/file-upload";
import { LocationPicker } from "@/components/ui/location-picker";
import { StepIndicator } from "./step-indicator";
import { OptionSelector } from "./option-selector";
import { FormSection } from "./form-section";
import { AssetFormHeader } from "./header";
import { AssetFormFooter } from "./footer";
import { useTranslations } from "../../hooks/useTranslations";
import { toast } from "sonner";

// Form schemas for each section
const basicDataSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  landParcelId: z.string().min(1, "Land parcel ID is required"),
  county: z.string().min(1, "County is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  landType: z.string().min(1, "Land type is required"),
  leaseContractId: z.string().min(1, "Lease contract ID is required"),
  duration: z.string().min(1, "Duration is required"),
  owner: z.string().min(1, "Owner is required"),
});

const financialDataSchema = z.object({
  unitInvestmentCost: z.string().min(1, "Unit investment cost is required"),
  annualCashFlowBreakdown: z.string().min(1, "Annual cash flow breakdown is required"),
  otherSubsidiesFile: z.instanceof(File).optional(),
  annualizedIRR: z.string().min(1, "Annualized IRR is required"),
});

const operationsComplianceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  businessLicense: z.string().min(1, "Business license is required"),
  epcContractorName: z.string().min(1, "EPC contractor name is required"),
  governmentFiling: z.string().min(1, "Government filing is required"),
  operatingEntity: z.string().min(1, "Operating entity is required"),
  tier: z.string().min(1, "Tier is required"),
});

const orchardDataSchema = z.object({
  plantingArea: z.string().min(1, "Planting area is required"),
  numberOfTrees: z.string().min(1, "Number of trees is required"),
  age: z.string().min(1, "Age is required"),
  variety: z.string().min(1, "Variety is required"),
  rowSpacing: z.string().min(1, "Row spacing is required"),
  treeDensity: z.string().min(1, "Tree density is required"),
  annualYield: z.string().min(1, "Annual yield is required"),
  lastThreeYearsYield: z.string().min(1, "Last 3 years yield is required"),
  monitoringSystem: z.boolean(),
  deviceId: z.string().optional(),
  orchardProductSalesRevenueFile: z.instanceof(File).optional(),
});

const solarDataSchema = z.object({
  installedCapacity: z.string().min(1, "Installed capacity is required"),
  pvModuleModel: z.string().min(1, "PV module model is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  installationDate: z.string().min(1, "Installation date is required"),
  gridConnectionPermitId: z.string().min(1, "Grid connection permit ID is required"),
  gridCompany: z.string().min(1, "Grid company is required"),
  averageAnnualPowerGeneration: z.string().min(1, "Average annual power generation is required"),
  tariffPpaContractId: z.string().min(1, "Tariff/PPA contract ID is required"),
  solarElectricitySalesRevenueFile: z.instanceof(File).optional(),
});

type FormData = {
  basicData: z.infer<typeof basicDataSchema>;
  financialData: z.infer<typeof financialDataSchema>;
  operationsCompliance: z.infer<typeof operationsComplianceSchema>;
  tierData: z.infer<typeof orchardDataSchema> | z.infer<typeof solarDataSchema>;
};

export function AssetRegistrationForm() {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [otherSubsidiesFile, setOtherSubsidiesFile] = useState<File | undefined>(undefined);
  const [orchardProductSalesRevenueFile, setOrchardProductSalesRevenueFile] = useState<File | undefined>(undefined);
  const [solarElectricitySalesRevenueFile, setSolarElectricitySalesRevenueFile] = useState<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    t("form.steps.basicData"),
    t("form.steps.financialRevenue"),
    t("form.steps.operationsCompliance"),
    t("form.steps.tierData")
  ];

  const basicForm = useForm<z.infer<typeof basicDataSchema>>({
    resolver: zodResolver(basicDataSchema),
    defaultValues: formData.basicData || {},
  });

  const financialForm = useForm<z.infer<typeof financialDataSchema>>({
    resolver: zodResolver(financialDataSchema),
    defaultValues: formData.financialData || {},
  });

  const operationsForm = useForm<z.infer<typeof operationsComplianceSchema>>({
    resolver: zodResolver(operationsComplianceSchema),
    defaultValues: formData.operationsCompliance || {},
  });

  const orchardForm = useForm<z.infer<typeof orchardDataSchema>>({
    resolver: zodResolver(orchardDataSchema),
    defaultValues: formData.tierData as z.infer<typeof orchardDataSchema> || {},
  });

  const solarForm = useForm<z.infer<typeof solarDataSchema>>({
    resolver: zodResolver(solarDataSchema),
    defaultValues: formData.tierData as z.infer<typeof solarDataSchema> || {},
  });

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await basicForm.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, basicData: basicForm.getValues() }));
      } else {
        toast.error(t("form.validation.fillAllRequired").replace("{section}", t("form.steps.basicData")));
        return;
      }
    } else if (currentStep === 2) {
      isValid = await financialForm.trigger();
      if (isValid) {
        setFormData(prev => ({ 
          ...prev, 
          financialData: { 
            ...financialForm.getValues(), 
            otherSubsidiesFile 
          } 
        }));
      } else {
        toast.error(t("form.validation.fillAllRequired").replace("{section}", t("form.steps.financialRevenue")));
        return;
      }
    } else if (currentStep === 3) {
      isValid = await operationsForm.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, operationsCompliance: operationsForm.getValues() }));
      } else {
        toast.error(t("form.validation.fillAllRequired").replace("{section}", t("form.steps.operationsCompliance")));
        return;
      }
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReview = async () => {
    const tier = operationsForm.getValues().tier;
    let isValid = false;

    if (tier === "Orchard Data") {
      isValid = await orchardForm.trigger();
      if (isValid) {
        setFormData(prev => ({ 
          ...prev, 
          tierData: { 
            ...orchardForm.getValues(), 
            orchardProductSalesRevenueFile 
          } 
        }));
      } else {
        toast.error(t("form.validation.fillAllRequired").replace("{section}", t("form.orchardData.title")));
        return;
      }
    } else if (tier === "Solar Data") {
      isValid = await solarForm.trigger();
      if (isValid) {
        setFormData(prev => ({ 
          ...prev, 
          tierData: { 
            ...solarForm.getValues(), 
            solarElectricitySalesRevenueFile 
          } 
        }));
      } else {
        toast.error(t("form.validation.fillAllRequired").replace("{section}", t("form.solarData.title")));
        return;
      }
    } else {
      // No tier selected, show error
      toast.error(t("form.validation.selectTier"));
      return;
    }

    if (isValid) {
      setIsReviewMode(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create FormData object
      const submitFormData = new FormData();
      
      // Add form data as JSON strings
      submitFormData.append('basicData', JSON.stringify(formData.basicData));
      submitFormData.append('financialData', JSON.stringify(formData.financialData));
      submitFormData.append('operationsCompliance', JSON.stringify(formData.operationsCompliance));
      submitFormData.append('tierData', JSON.stringify(formData.tierData));
      
      // Add files if they exist
      if (otherSubsidiesFile) {
        submitFormData.append('otherSubsidiesFile', otherSubsidiesFile);
      }
      if (orchardProductSalesRevenueFile) {
        submitFormData.append('orchardProductSalesRevenueFile', orchardProductSalesRevenueFile);
      }
      if (solarElectricitySalesRevenueFile) {
        submitFormData.append('solarElectricitySalesRevenueFile', solarElectricitySalesRevenueFile);
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        body: submitFormData, // Don't set Content-Type header, let browser set it with boundary
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(t("form.success.submitted"));
        console.log('Uploaded files:', result.uploadedFiles);
        // Reset form or redirect
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t("form.success.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (isReviewMode) {
      return (
        <div className="bg-white rounded-lg p-4 sm:p-8 shadow-lg">
          <h2 className="!text-xl font-bold text-gray-900 mb-6">{t("form.review.title")}</h2>
          <div className="space-y-6">
            {/* Basic Data Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">{t("form.review.basicData")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong>Project Name:</strong> {formData.basicData?.projectName}</div>
                <div><strong>Land Parcel ID:</strong> {formData.basicData?.landParcelId}</div>
                <div className="sm:col-span-2"><strong>Location:</strong> {formData.basicData?.county}, {formData.basicData?.city}, {formData.basicData?.province}</div>
                <div className="sm:col-span-2"><strong>GPS:</strong> {formData.basicData?.latitude}, {formData.basicData?.longitude}</div>
                <div><strong>Land Type:</strong> {formData.basicData?.landType}</div>
                <div><strong>Owner:</strong> {formData.basicData?.owner}</div>
              </div>
            </div>

            {/* Financial Data Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">{t("form.review.financialData")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong>Unit Investment Cost:</strong> {formData.financialData?.unitInvestmentCost}</div>
                <div><strong>Annual Cash Flow:</strong> {formData.financialData?.annualCashFlowBreakdown}</div>
                <div className="sm:col-span-2"><strong>Other Subsidies:</strong> {formData.financialData?.otherSubsidiesFile ? formData.financialData.otherSubsidiesFile.name : "No file uploaded"}</div>
                <div><strong>Annualized IRR:</strong> {formData.financialData?.annualizedIRR}</div>
              </div>
            </div>

            {/* Operations & Compliance Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">{t("form.review.operationsCompliance")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong>Company Name:</strong> {formData.operationsCompliance?.companyName}</div>
                <div><strong>Business License:</strong> {formData.operationsCompliance?.businessLicense}</div>
                <div><strong>EPC Contractor:</strong> {formData.operationsCompliance?.epcContractorName}</div>
                <div><strong>Government Filing:</strong> {formData.operationsCompliance?.governmentFiling}</div>
                <div><strong>Operating Entity:</strong> {formData.operationsCompliance?.operatingEntity}</div>
                <div><strong>Tier:</strong> {formData.operationsCompliance?.tier}</div>
              </div>
            </div>

            {/* Tier Data Review */}
            {formData.operationsCompliance?.tier === "Orchard Data" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("form.review.orchardData")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><strong>Planting Area:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.plantingArea}</div>
                  <div><strong>Number of Trees:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.numberOfTrees}</div>
                  <div><strong>Age:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.age}</div>
                  <div><strong>Variety:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.variety}</div>
                  <div><strong>Row Spacing:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.rowSpacing}</div>
                  <div><strong>Tree Density:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.treeDensity}</div>
                  <div><strong>Annual Yield:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.annualYield}</div>
                  <div><strong>Last 3 Years Yield:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.lastThreeYearsYield}</div>
                  <div><strong>Monitoring System:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.monitoringSystem ? "Yes" : "No"}</div>
                  {(formData.tierData as z.infer<typeof orchardDataSchema>)?.monitoringSystem && (
                    <div><strong>Device ID:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.deviceId}</div>
                  )}
                  <div className="sm:col-span-2"><strong>Orchard Product Sales Revenue:</strong> {(formData.tierData as z.infer<typeof orchardDataSchema>)?.orchardProductSalesRevenueFile ? (formData.tierData as z.infer<typeof orchardDataSchema>)?.orchardProductSalesRevenueFile?.name : "No file uploaded"}</div>
                </div>
              </div>
            )}

            {formData.operationsCompliance?.tier === "Solar Data" && (
              <div>
                <h3 className="!text-lg font-semibold text-gray-900 mb-3">{t("form.review.solarData")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><strong>Installed Capacity:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.installedCapacity}</div>
                  <div><strong>PV Module Model:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.pvModuleModel}</div>
                  <div><strong>Manufacturer:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.manufacturer}</div>
                  <div><strong>Installation Date:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.installationDate}</div>
                  <div><strong>Grid Connection Permit ID:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.gridConnectionPermitId}</div>
                  <div><strong>Grid Company:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.gridCompany}</div>
                  <div><strong>Average Annual Power Generation:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.averageAnnualPowerGeneration}</div>
                  <div><strong>Tariff/PPA Contract ID:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.tariffPpaContractId}</div>
                  <div className="sm:col-span-2"><strong>Solar Electricity Sales Revenue:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.solarElectricitySalesRevenueFile ? (formData.tierData as z.infer<typeof solarDataSchema>)?.solarElectricitySalesRevenueFile?.name : "No file uploaded"}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewMode(false)}
              className="w-full text-black"
            >
{t("form.review.backToEdit")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("common.submitting")}
                </div>
              ) : (
                t("form.review.submitRegistration")
              )}
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <FormSection title={t("form.basicData.title")}>
            <form className="space-y-6">
              {/* Project Name and Land Parcel ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  label={t("form.basicData.projectName")}
                  {...basicForm.register("projectName")}
                />
                <FloatingInput
                  label={t("form.basicData.landParcelId")}
                  {...basicForm.register("landParcelId")}
                />
              </div>
              {/* Location Selection */}
              <LocationPicker
                onLocationSelect={(location) => {
                  basicForm.setValue("latitude", location.latitude);
                  basicForm.setValue("longitude", location.longitude);
                  basicForm.setValue("county", location.county);
                  basicForm.setValue("city", location.city);
                  basicForm.setValue("province", location.province);
                }}
                initialLocation={{
                  latitude: basicForm.watch("latitude"),
                  longitude: basicForm.watch("longitude"),
                  county: basicForm.watch("county"),
                  city: basicForm.watch("city"),
                  province: basicForm.watch("province"),
                }}
              />
              

              {/* Land Type */}
              <OptionSelector
                label={t("form.basicData.landType")}
                options={[
                  t("form.basicData.landTypeOptions.orchard"),
                  t("form.basicData.landTypeOptions.farmland"),
                  t("form.basicData.landTypeOptions.facilityAgriculture")
                ]}
                selected={basicForm.watch("landType")}
                onSelect={(value) => basicForm.setValue("landType", value)}
                columns={3}
              />

              {/* Land Ownership Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FloatingInput
                  label={t("form.basicData.leaseContractId")}
                  {...basicForm.register("leaseContractId")}
                />
                <FloatingInput
                  label={t("form.basicData.duration")}
                  {...basicForm.register("duration")}
                />
                <FloatingInput
                  label={t("form.basicData.owner")}
                  {...basicForm.register("owner")}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
{t("common.next")}
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 2:
        return (
          <FormSection title={t("form.financialData.title")}>
            <form className="space-y-6">
              <FloatingInput
                label={t("form.financialData.unitInvestmentCost")}
                {...financialForm.register("unitInvestmentCost")}
              />
              <FloatingInput
                label={t("form.financialData.annualCashFlowBreakdown")}
                {...financialForm.register("annualCashFlowBreakdown")}
              />
              <FileUpload
                label=""
                onFileSelect={(file) => setOtherSubsidiesFile(file || undefined)}
                selectedFile={otherSubsidiesFile || null}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                placeholder={t("form.financialData.otherSubsidies")}
              />
              <FloatingInput
                label={t("form.financialData.annualizedIRR")}
                {...financialForm.register("annualizedIRR")}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
{t("common.next")}
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 3:
        return (
          <FormSection title={t("form.operationsCompliance.title")}>
            <form className="space-y-6">
              {/* Company Name and Business License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  label={t("form.operationsCompliance.companyName")}
                  {...operationsForm.register("companyName")}
                />
                <FloatingInput
                  label={t("form.operationsCompliance.businessLicense")}
                  {...operationsForm.register("businessLicense")}
                />
              </div>

              <FloatingInput
                label={t("form.operationsCompliance.epcContractorName")}
                {...operationsForm.register("epcContractorName")}
              />

              {/* Government Filing */}
              <OptionSelector
                label={t("form.operationsCompliance.governmentFiling")}
                options={[
                  t("form.operationsCompliance.governmentFilingOptions.ndrc"),
                  t("form.operationsCompliance.governmentFilingOptions.energyBureau"),
                  t("form.operationsCompliance.governmentFilingOptions.agricultureBureau")
                ]}
                selected={operationsForm.watch("governmentFiling")}
                onSelect={(value) => operationsForm.setValue("governmentFiling", value)}
                columns={3}
              />

              {/* Operating Entity */}
              <OptionSelector
                label={t("form.operationsCompliance.operatingEntity")}
                options={[
                  t("form.operationsCompliance.operatingEntityOptions.agricultureInsurance"),
                  t("form.operationsCompliance.operatingEntityOptions.solarPlantInsurance")
                ]}
                selected={operationsForm.watch("operatingEntity")}
                onSelect={(value) => operationsForm.setValue("operatingEntity", value)}
                columns={2}
              />

              {/* Tier Selection */}
              <OptionSelector
                label={t("form.operationsCompliance.tier")}
                options={[
                  t("form.operationsCompliance.tierOptions.orchardData"),
                  t("form.operationsCompliance.tierOptions.solarData")
                ]}
                selected={operationsForm.watch("tier")}
                onSelect={(value) => operationsForm.setValue("tier", value)}
                columns={2}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
{t("common.next")}
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 4:
        const tier = operationsForm.watch("tier");
        
        if (tier === "Orchard Data") {
          return (
            <FormSection title={t("form.orchardData.title")}>
              <form className="space-y-6">
                <FloatingInput
                  label={t("form.orchardData.plantingArea")}
                  {...orchardForm.register("plantingArea")}
                />

                {/* Number of Trees, Age, Variety */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FloatingInput
                    label={t("form.orchardData.numberOfTrees")}
                    {...orchardForm.register("numberOfTrees")}
                  />
                  <FloatingInput
                    label={t("form.orchardData.age")}
                    {...orchardForm.register("age")}
                  />
                  <FloatingInput
                    label={t("form.orchardData.variety")}
                    {...orchardForm.register("variety")}
                  />
                </div>

                {/* Planting Density */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">{t("form.orchardData.plantingDensity")}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      label={t("form.orchardData.rowSpacing")}
                      {...orchardForm.register("rowSpacing")}
                    />
                    <FloatingInput
                      label={t("form.orchardData.treeDensity")}
                      {...orchardForm.register("treeDensity")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      label={t("form.orchardData.annualYield")}
                      {...orchardForm.register("annualYield")}
                    />
                    <FloatingInput
                      label={t("form.orchardData.lastThreeYearsYield")}
                      {...orchardForm.register("lastThreeYearsYield")}
                    />
                  </div>
                </div>

                {/* Monitoring System */}
                <div className="space-y-3">
                  <YesNoToggle
                    label={t("form.orchardData.monitoringSystem")}
                    value={orchardForm.watch("monitoringSystem")}
                    onChange={(value) => orchardForm.setValue("monitoringSystem", value)}
                  />
                  {orchardForm.watch("monitoringSystem") && (
                    <FloatingInput
                      label={t("form.orchardData.deviceId")}
                      {...orchardForm.register("deviceId")}
                    />
                  )}
                </div>

                <FileUpload
                  label=""
                  onFileSelect={(file) => setOrchardProductSalesRevenueFile(file || undefined)}
                  selectedFile={orchardProductSalesRevenueFile || null}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  placeholder={t("form.orchardData.orchardProductSalesRevenue")}
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("common.back")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleReview}
                    className="btn-primary flex-1"
                  >
{t("common.review")}
                  </Button>
                </div>
              </form>
            </FormSection>
          );
        } else if (tier === "Solar Data") {
          return (
            <FormSection title={t("form.solarData.title")}>
              <form className="space-y-6">
                <FloatingInput
                  label={t("form.solarData.installedCapacity")}
                  {...solarForm.register("installedCapacity")}
                />

                {/* PV Module Model, Manufacturer, Installation Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FloatingInput
                    label={t("form.solarData.pvModuleModel")}
                    {...solarForm.register("pvModuleModel")}
                  />
                  <FloatingInput
                    label={t("form.solarData.manufacturer")}
                    {...solarForm.register("manufacturer")}
                  />
                  <FloatingInput
                    label={t("form.solarData.installationDate")}
                    {...solarForm.register("installationDate")}
                  />
                </div>

                {/* Grid Connection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label={t("form.solarData.gridConnectionPermitId")}
                    {...solarForm.register("gridConnectionPermitId")}
                  />
                  <FloatingInput
                    label={t("form.solarData.gridCompany")}
                    {...solarForm.register("gridCompany")}
                  />
                </div>

                <FloatingInput
                  label={t("form.solarData.averageAnnualPowerGeneration")}
                  {...solarForm.register("averageAnnualPowerGeneration")}
                />

                <FloatingInput
                  label={t("form.solarData.tariffPpaContractId")}
                  {...solarForm.register("tariffPpaContractId")}
                />

                <FileUpload
                  label=""
                  onFileSelect={(file) => setSolarElectricitySalesRevenueFile(file || undefined)}
                  selectedFile={solarElectricitySalesRevenueFile || null}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  placeholder={t("form.solarData.solarElectricitySalesRevenue")}
                />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("common.back")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleReview}
                    className="btn-primary flex-1"
                  >
{t("common.review")}
                  </Button>
                </div>
              </form>
            </FormSection>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.png')" }}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <AssetFormHeader />
        
        <div className="max-w-4xl mx-auto">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={steps.length}
            steps={steps}
          />
          
          <div className="glass rounded-lg p-4 sm:p-8 shadow-lg">
            <h1 className="!text-xl sm:!text-2xl font-bold text-white mb-6 sm:mb-8 text-center">
              {t("form.title")}
            </h1>
            {renderStep()}
          </div>
        </div>
      </div>
      
      <AssetFormFooter />
    </div>
  );
}
