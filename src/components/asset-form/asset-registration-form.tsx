"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YesNoToggle } from "@/components/ui/yes-no-toggle";
import { StepIndicator } from "./step-indicator";
import { OptionSelector } from "./option-selector";
import { FormSection } from "./form-section";
import { AssetFormHeader } from "./header";
import { AssetFormFooter } from "./footer";
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
  orchardProductSalesRevenue: z.string().min(1, "Orchard product sales revenue is required"),
  solarElectricitySalesRevenue: z.string().min(1, "Solar electricity sales revenue is required"),
  otherSubsidies: z.string().min(1, "Other subsidies is required"),
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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const computeDataSchema = z.object({
  type: z.literal("Compute Data"),
});

type FormData = {
  basicData: z.infer<typeof basicDataSchema>;
  financialData: z.infer<typeof financialDataSchema>;
  operationsCompliance: z.infer<typeof operationsComplianceSchema>;
  tierData: z.infer<typeof orchardDataSchema> | z.infer<typeof solarDataSchema> | z.infer<typeof computeDataSchema>;
};

const steps = ["Basic Data", "Financial & Revenue", "Operations & Compliance", "Tier Data"];

export function AssetRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});

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
      }
    } else if (currentStep === 2) {
      isValid = await financialForm.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, financialData: financialForm.getValues() }));
      }
    } else if (currentStep === 3) {
      isValid = await operationsForm.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, operationsCompliance: operationsForm.getValues() }));
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
        setFormData(prev => ({ ...prev, tierData: orchardForm.getValues() }));
      }
    } else if (tier === "Solar Data") {
      isValid = await solarForm.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, tierData: solarForm.getValues() }));
      }
    } else if (tier === "Compute Data") {
      // For Compute Data, we don't have a specific form yet, so just proceed
      isValid = true;
      setFormData(prev => ({ ...prev, tierData: { type: "Compute Data" } }));
    } else {
      // No tier selected, show error
      toast.error("Please select a tier before proceeding to review.");
      return;
    }

    if (isValid) {
      setIsReviewMode(true);
    } else {
      toast.error("Please fill in all required fields before proceeding to review.");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();
        toast.success('Asset registration submitted successfully!');
        // Reset form or redirect
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit asset registration. Please try again.');
    }
  };

  const renderStep = () => {
    if (isReviewMode) {
      return (
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="!text-xl font-bold text-gray-900 mb-6">Review Your Submission</h2>
          <div className="space-y-6">
            {/* Basic Data Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">Basic Data</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Project Name:</strong> {formData.basicData?.projectName}</div>
                <div><strong>Land Parcel ID:</strong> {formData.basicData?.landParcelId}</div>
                <div><strong>Location:</strong> {formData.basicData?.county}, {formData.basicData?.city}, {formData.basicData?.province}</div>
                <div><strong>GPS:</strong> {formData.basicData?.latitude}, {formData.basicData?.longitude}</div>
                <div><strong>Land Type:</strong> {formData.basicData?.landType}</div>
                <div><strong>Owner:</strong> {formData.basicData?.owner}</div>
              </div>
            </div>

            {/* Financial Data Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">Financial & Revenue Data</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Unit Investment Cost:</strong> {formData.financialData?.unitInvestmentCost}</div>
                <div><strong>Annual Cash Flow:</strong> {formData.financialData?.annualCashFlowBreakdown}</div>
                <div><strong>Orchard Revenue:</strong> {formData.financialData?.orchardProductSalesRevenue}</div>
                <div><strong>Solar Revenue:</strong> {formData.financialData?.solarElectricitySalesRevenue}</div>
                <div><strong>Other Subsidies:</strong> {formData.financialData?.otherSubsidies}</div>
                <div><strong>Annualized IRR:</strong> {formData.financialData?.annualizedIRR}</div>
              </div>
            </div>

            {/* Operations & Compliance Review */}
            <div>
              <h3 className="!text-lg font-semibold text-gray-900 mb-3">Operations & Compliance</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Orchard Data</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                </div>
              </div>
            )}

            {formData.operationsCompliance?.tier === "Solar Data" && (
              <div>
                <h3 className="!text-lg font-semibold text-gray-900 mb-3">Solar Data</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Installed Capacity:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.installedCapacity}</div>
                  <div><strong>PV Module Model:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.pvModuleModel}</div>
                  <div><strong>Manufacturer:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.manufacturer}</div>
                  <div><strong>Installation Date:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.installationDate}</div>
                  <div><strong>Grid Connection Permit ID:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.gridConnectionPermitId}</div>
                  <div><strong>Grid Company:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.gridCompany}</div>
                  <div><strong>Average Annual Power Generation:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.averageAnnualPowerGeneration}</div>
                  <div><strong>Tariff/PPA Contract ID:</strong> {(formData.tierData as z.infer<typeof solarDataSchema>)?.tariffPpaContractId}</div>
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
              Back to Edit
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="btn-primary w-full"
            >
              Submit Registration
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <FormSection title="BASIC DATA">
            <form className="space-y-6">
              {/* Project Name and Land Parcel ID */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Project Name"
                  {...basicForm.register("projectName")}
                />
                <Input
                  placeholder="Land Parcel ID"
                  {...basicForm.register("landParcelId")}
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="County"
                  {...basicForm.register("county")}
                />
                <Input
                  placeholder="City"
                  {...basicForm.register("city")}
                />
                <Input
                  placeholder="Province"
                  {...basicForm.register("province")}
                />
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Latitude"
                  {...basicForm.register("latitude")}
                />
                <Input
                  placeholder="Longitude"
                  {...basicForm.register("longitude")}
                />
              </div>

              {/* Land Type */}
              <OptionSelector
                label="Land Type"
                options={["Orchard", "Farmland", "Facility Agriculture"]}
                selected={basicForm.watch("landType")}
                onSelect={(value) => basicForm.setValue("landType", value)}
                columns={3}
              />

              {/* Land Ownership Proof */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Lease Contract ID"
                  {...basicForm.register("leaseContractId")}
                />
                <Input
                  placeholder="Duration"
                  {...basicForm.register("duration")}
                />
                <Input
                  placeholder="Owner"
                  {...basicForm.register("owner")}
                />
              </div>

              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    BACK
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
                  NEXT
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 2:
        return (
          <FormSection title="Financial & Revenue Data">
            <form className="space-y-6">
              <Input
                placeholder="Unit Investment Cost (CNY per mu or per MW)"
                {...financialForm.register("unitInvestmentCost")}
              />
              <Input
                placeholder="Annual Cash Flow Breakdown"
                {...financialForm.register("annualCashFlowBreakdown")}
              />
              <Input
                placeholder="Orchard Product Sales Revenue"
                {...financialForm.register("orchardProductSalesRevenue")}
              />
              <Input
                placeholder="Solar Electricity Sales Revenue"
                {...financialForm.register("solarElectricitySalesRevenue")}
              />
              <Input
                placeholder="Other Subsidies / Green Certificate Income"
                {...financialForm.register("otherSubsidies")}
              />
              <Input
                placeholder="Annualized IRR / ROI Calculation"
                {...financialForm.register("annualizedIRR")}
              />

              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    BACK
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
                  NEXT
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 3:
        return (
          <FormSection title="Operations & Compliance">
            <form className="space-y-6">
              {/* Company Name and Business License */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Company Name"
                  {...operationsForm.register("companyName")}
                />
                <Input
                  placeholder="Business License / Credit Code"
                  {...operationsForm.register("businessLicense")}
                />
              </div>

              <Input
                placeholder="EPC / O&M Contractor Name"
                {...operationsForm.register("epcContractorName")}
              />

              {/* Government Filing */}
              <OptionSelector
                label="Government Filing / Approval Document IDs"
                options={["NDRC", "Energy Bureau", "Agriculture Bureau"]}
                selected={operationsForm.watch("governmentFiling")}
                onSelect={(value) => operationsForm.setValue("governmentFiling", value)}
                columns={3}
              />

              {/* Operating Entity */}
              <OptionSelector
                label="Operating Entity"
                options={["Agriculture Insurance", "Solar Plant Insurance"]}
                selected={operationsForm.watch("operatingEntity")}
                onSelect={(value) => operationsForm.setValue("operatingEntity", value)}
                columns={2}
              />

              {/* Tier Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Select Tier</label>
                <Select
                  value={operationsForm.watch("tier")}
                  onValueChange={(value) => operationsForm.setValue("tier", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tier" className="text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orchard Data">Orchard Data</SelectItem>
                    <SelectItem value="Solar Data">Solar Data</SelectItem>
                    <SelectItem value="Compute Data">Compute Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    BACK
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1"
                >
                  REVIEW
                </Button>
              </div>
            </form>
          </FormSection>
        );

      case 4:
        const tier = operationsForm.watch("tier");
        
        if (tier === "Orchard Data") {
          return (
            <FormSection title="Orchard Data">
              <form className="space-y-6">
                <Input
                  placeholder="Planting Area (mu / hectares)"
                  {...orchardForm.register("plantingArea")}
                />

                {/* Number of Trees, Age, Variety */}
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Number of Trees"
                    {...orchardForm.register("numberOfTrees")}
                  />
                  <Input
                    placeholder="Age"
                    {...orchardForm.register("age")}
                  />
                  <Input
                    placeholder="Variety"
                    {...orchardForm.register("variety")}
                  />
                </div>

                {/* Planting Density */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Planting Density</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Row Spacing"
                      {...orchardForm.register("rowSpacing")}
                    />
                    <Input
                      placeholder="Tree Density"
                      {...orchardForm.register("treeDensity")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Annual Yield (tons)"
                      {...orchardForm.register("annualYield")}
                    />
                    <Input
                      placeholder="Last 3 years yield"
                      {...orchardForm.register("lastThreeYearsYield")}
                    />
                  </div>
                </div>

                {/* Monitoring System */}
                <div className="space-y-3">
                  <YesNoToggle
                    label="Monitoring System (IoT devices for pest/climate control)"
                    value={orchardForm.watch("monitoringSystem")}
                    onChange={(value) => orchardForm.setValue("monitoringSystem", value)}
                  />
                  {orchardForm.watch("monitoringSystem") && (
                    <Input
                      placeholder="Device ID if available"
                      {...orchardForm.register("deviceId")}
                    />
                  )}
                </div>

                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      BACK
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleReview}
                    className="btn-primary flex-1"
                  >
                    REVIEW
                  </Button>
                </div>
              </form>
            </FormSection>
          );
        } else if (tier === "Solar Data") {
          return (
            <FormSection title="Solar Data">
              <form className="space-y-6">
                <Input
                  placeholder="Installed Capacity (MWp)"
                  {...solarForm.register("installedCapacity")}
                />

                {/* PV Module Model, Manufacturer, Installation Date */}
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="PV Module Model"
                    {...solarForm.register("pvModuleModel")}
                  />
                  <Input
                    placeholder="Manufacturer"
                    {...solarForm.register("manufacturer")}
                  />
                  <Input
                    placeholder="Installation Date"
                    {...solarForm.register("installationDate")}
                  />
                </div>

                {/* Grid Connection */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Grid Connection Permit ID"
                    {...solarForm.register("gridConnectionPermitId")}
                  />
                  <Input
                    placeholder="Grid Company"
                    {...solarForm.register("gridCompany")}
                  />
                </div>

                <Input
                  placeholder="Average Annual Power Generation (last 12 months, kWh)"
                  {...solarForm.register("averageAnnualPowerGeneration")}
                />

                <Input
                  placeholder="Tariff / PPA Contract ID"
                  {...solarForm.register("tariffPpaContractId")}
                />

                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      BACK
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleReview}
                    className="btn-primary flex-1"
                  >
                    REVIEW
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
      <div className="container mx-auto px-4 py-8">
        <AssetFormHeader />
        
        <div className="max-w-4xl mx-auto">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={steps.length}
            steps={steps}
          />
          
          <div className="glass rounded-lg p-8 shadow-lg">
            <h1 className="!text-2xl font-bold text-white mb-8 text-center">
              ASSET REGISTRATION FORM
            </h1>
            {renderStep()}
          </div>
        </div>
      </div>
      
      <AssetFormFooter />
    </div>
  );
}
