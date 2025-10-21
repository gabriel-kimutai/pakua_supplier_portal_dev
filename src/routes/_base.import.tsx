import { useState, useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Upload, FileText, AlertCircle, CheckCircle2, X, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMutation } from "@tanstack/react-query";
import { uploadListings, type UploadListing } from "@/lib/functions/listings.ts";
import { toast } from "sonner"


export const Route = createFileRoute("/_base/import",)({
  component: ImportPage
})

interface FilePreview {
  name: string
  size: number
  type: string
  preview?: string
}


interface ValidationIssue {
  row: number
  field: string
  issue: string
  severity: "warning" | "error"
}

export default function ImportPage() {
  const [file, setFile] = useState<FilePreview | null>(null)
  const [parsedData, setParsedData] = useState<UploadListing[] | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "confirmation">("upload")
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const router = useRouter()

  // Calculate validation summary
  const validationSummary = useMemo(() => {
    if (!validationIssues.length) return null

    const errorCount = validationIssues.filter((issue) => issue.severity === "error").length
    const warningCount = validationIssues.filter((issue) => issue.severity === "warning").length

    return {
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
    }
  }, [validationIssues])

  const uploadMutation = useMutation({
    mutationKey: ['upload'],
    mutationFn: async (data: UploadListing[]) => uploadListings({ data: data }),
  })

  const validateData = (data: UploadListing[]): ValidationIssue[] => {
    const issues: ValidationIssue[] = []

    data.forEach((product, index) => {
      // Check required fixed fields
      if (!product.name) {
        issues.push({
          row: index + 1,
          field: "name",
          issue: "Product name is required",
          severity: "error",
        })
      }

      // Validate price
      if (product.price === undefined || product.price === "") {
        issues.push({
          row: index + 1,
          field: "price",
          issue: "Price is required",
          severity: "error",
        })
      } else if (isNaN(Number(product.price)) || Number(product.price) < 0) {
        issues.push({
          row: index + 1,
          field: "price",
          issue: "Price must be a positive number",
          severity: "error",
        })
      }

      // Validate quantity
      if (product.quantity === undefined || product.quantity === "") {
        issues.push({
          row: index + 1,
          field: "quantity",
          issue: "Quantity is required",
          severity: "error",
        })
      } else if (isNaN(Number(product.quantity)) || Number(product.quantity) < 0) {
        issues.push({
          row: index + 1,
          field: "quantity",
          issue: "Quantity must be a non-negative integer",
          severity: "error",
        })
      }

      // Check for missing optional fixed fields (as warnings)
      if (!product.category) {
        issues.push({
          row: index + 1,
          field: "category",
          issue: "Category is missing",
          severity: "warning",
        })
      }

      // if (!product.subcategory) {
      //   issues.push({
      //     row: index + 1,
      //     field: "subcategory",
      //     issue: "Subcategory is missing",
      //     severity: "warning",
      //   })
      // }

      if (!product.country) {
        issues.push({
          row: index + 1,
          field: "country",
          issue: "Country is missing",
          severity: "warning",
        })
      }

      // if (!product.brand) {
      //   issues.push({
      //     row: index + 1,
      //     field: "brand",
      //     issue: "Brand is missing",
      //     severity: "warning",
      //   })
      // }

      if (!product.supplier) {
        issues.push({
          row: index + 1,
          field: "supplier",
          issue: "Supplier is missing",
          severity: "warning",
        })
      }

      if (!product.location) {
        issues.push({
          row: index + 1,
          field: "location",
          issue: "Location is missing",
          severity: "warning",
        })
      }
    })

    return issues
  }

  const normalizeData = (data: UploadListing[]): UploadListing[] => {
    return data.map((product) => ({
      ...product,
      price: product.price !== undefined ? Number(product.price) : 0,
      quantity: product.quantity !== undefined ? Number(product.quantity) : 0,
      status: product.status || (Number(product.quantity) > 0 ? "active" : "inactive"),
    }))
  }

  const processCSVData = (data: any[]): UploadListing[] => {
    const fixedFields = [
      "name",
      "category",
      // "subcategory",
      "quantity",
      "country",
      // "brand",
      "price",
      "supplier",
      "location"
    ]

    const headers = data[0]
    const rows = data.slice(1) // Get all rows except headers

    // Process each row
    return rows.map(row => {
      const fixed: Record<string, any> = {}
      const attrs: Record<string, any> = {}

      headers.forEach((header: string, index: number) => {
        const value = row[index]
        const key = header.toLowerCase().replace(/\s*\(.*?\)/g, "").replace(/\s+/g, "_")

        if (fixedFields.includes(key)) {
          fixed[key] = value
        } else {
          attrs[key] = value
        }
      })

      return {
        ...fixed,
        attributes: attrs
      } as UploadListing
    })
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const selectedFile = acceptedFiles[0]
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    })

    // Reset states
    setParsedData(null)
    setUploadStatus("idle")
    setErrorMessage(null)
    setValidationIssues([])

    // Parse file based on type
    const fileReader = new FileReader()

    fileReader.onload = (event) => {

      try {
        const result = event.target?.result

        if (!result || typeof result === "string") {
          throw new Error("Failed to read file")
        }

        const content = new Uint8Array(result)

        let data: UploadListing[] = []

        if (
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "application/vnd.ms-excel"
        ) {
          // Parse Excel
          const workbook = XLSX.read(content, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          data = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false }) as UploadListing[]
        } else {
          throw new Error("Unsupported file format")
        }

        // Validate data
        if (data.length === 0) {
          throw new Error("No data found in file")
        }

        // Validate the data
        data = processCSVData(data)
        const issues = validateData(data)
        setValidationIssues(issues)

        // Normalize data
        const normalizedData = normalizeData(data)
        setParsedData(normalizedData)

        // Move to preview step
        setCurrentStep("preview")
      } catch (error) {
        console.error("Error parsing file:", error)
        setErrorMessage(error instanceof Error ? error.message : "Failed to parse file")
      }
    }

    if (selectedFile.type === "text/csv") {
      fileReader.readAsText(selectedFile)
    } else {
      fileReader.readAsArrayBuffer(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!parsedData) return

    setUploadStatus("uploading")
    setUploadProgress(0)
    setCurrentStep("confirmation")

    try {
      uploadMutation.mutate(parsedData, {
        onSuccess: async (data) => {
          if (data?.error) {
            toast.error("Upload failed", { description: data.message })
          }
        },
      })
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }


      setUploadStatus("success")

      // Redirect to products page after a delay
      setTimeout(() => {
        router.navigate({ to: "/manage" })
      }, 2000)
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadStatus("error")
      setErrorMessage("Failed to upload products. Please try again.")
    }
  }

  const resetUpload = () => {
    setFile(null)
    setParsedData(null)
    setUploadStatus("idle")
    setErrorMessage(null)
    setCurrentStep("upload")
    setValidationIssues([])
  }

  const goBack = () => {
    if (currentStep === "preview") {
      setCurrentStep("upload")
    } else if (currentStep === "confirmation") {
      setCurrentStep("preview")
    }
  }

  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Upload Product File</CardTitle>
        <CardDescription>
          Upload a CSV or Excel file containing your product data. The file should include columns for SKU, name, price,
          and quantity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop the file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-gray-500">or click to browse (CSV, XLSX, XLS)</p>
            </div>
          </div>
        </div>

        {file && (
          <div className="mt-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  resetUpload()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.navigate({ to: "/dashboard" })}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )

  const renderPreviewStep = () => {
    if (!parsedData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview Import Data</CardTitle>
          <CardDescription>
            Review your product data before importing. Make sure everything looks correct.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationSummary && (
            <Alert
              variant={validationSummary.hasErrors ? "destructive" : "default"}
              className={`mb-6 ${!validationSummary.hasErrors && validationSummary.hasWarnings ? "bg-yellow-50 border-yellow-200" : ""}`}
            >
              {validationSummary.hasErrors ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertTitle>
                {validationSummary.hasErrors
                  ? `${validationSummary.errorCount} error${validationSummary.errorCount !== 1 ? "s" : ""} found`
                  : `${validationSummary.warningCount} warning${validationSummary.warningCount !== 1 ? "s" : ""} found`}
              </AlertTitle>
              <AlertDescription>
                {validationSummary.hasErrors
                  ? "Please fix the errors before proceeding with the import."
                  : "You can proceed with the import, but you may want to check the warnings first."}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="data">
            <TabsList className="mb-4">
              <TabsTrigger value="data">Data Preview</TabsTrigger>
              <TabsTrigger value="issues">
                Validation Issues
                {validationIssues.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {validationIssues.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Subcategory</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="hidden md:table-cell">Brand</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category || "-"}</TableCell>
                          <TableCell>{product.subcategory || "-"}</TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>{Number(product.quantity)}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.brand || "-"}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.location || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {parsedData.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-sm text-gray-500">
                            {parsedData.length - 10} more rows not shown in preview
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="issues">
              {validationIssues.length === 0 ? (
                <div className="p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">No validation issues found</p>
                  <p className="text-sm text-gray-500 mt-1">Your data looks good and is ready to import</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Issue</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationIssues.map((issue, index) => (
                          <TableRow key={index}>
                            <TableCell>{issue.row}</TableCell>
                            <TableCell>{issue.field}</TableCell>
                            <TableCell>{issue.issue}</TableCell>
                            <TableCell>
                              {issue.severity === "error" ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Warning
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => setCurrentStep("confirmation")} disabled={validationSummary?.hasErrors}>
            Proceed to Import
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderConfirmationStep = () => {
    if (!parsedData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Import</CardTitle>
          <CardDescription>You are about to import {parsedData.length} products to your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {uploadStatus === "success" ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                Your products have been successfully imported. Redirecting to product management...
              </AlertDescription>
            </Alert>
          ) : uploadStatus === "error" ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Ready to Import</AlertTitle>
                <AlertDescription className="text-blue-700">
                  You are about to import {parsedData.length} products to your inventory. This action cannot be undone.
                </AlertDescription>
              </Alert>

              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Import Summary</h3>
                <ul className="space-y-1 text-sm">
                  <li>Total products: {parsedData.length}</li>
                  <li>New products: {parsedData.length}</li>
                  <li>File: {file?.name}</li>
                  {validationSummary?.hasWarnings && (
                    <li className="text-yellow-600">
                      Warnings: {validationSummary.warningCount} (will be imported anyway)
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {uploadStatus !== "success" && (
            <>
              <Button variant="outline" onClick={goBack} disabled={uploadStatus === "uploading"}>
                Back
              </Button>
              <Button onClick={handleUpload} disabled={uploadStatus === "uploading"} variant="default">
                {uploadStatus === "uploading" ? "Importing..." : "Confirm Import"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Import Products</h1>
        <p className="text-gray-500">Upload a CSV or Excel file to import your products.</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === "upload"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-500"
                  }`}
              >
                1
              </div>
              <div className={`ml-4 ${currentStep === "upload" ? "text-gray-900" : "text-gray-500"}`}>
                <p className="text-sm font-medium">Upload File</p>
              </div>
            </div>
            <div className="hidden sm:block w-full max-w-[100px] border-t border-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === "preview"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-500"
                  }`}
              >
                2
              </div>
              <div className={`ml-4 ${currentStep === "preview" ? "text-gray-900" : "text-gray-500"}`}>
                <p className="text-sm font-medium">Preview & Validate</p>
              </div>
            </div>
            <div className="hidden sm:block w-full max-w-[100px] border-t border-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === "confirmation"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-500"
                  }`}
              >
                3
              </div>
              <div className={`ml-4 ${currentStep === "confirmation" ? "text-gray-900" : "text-gray-500"}`}>
                <p className="text-sm font-medium">Confirm & Import</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {currentStep === "upload" && renderUploadStep()}
        {currentStep === "preview" && renderPreviewStep()}
        {currentStep === "confirmation" && renderConfirmationStep()}

        <Card>
          <CardHeader>
            <CardTitle>File Format Guidelines</CardTitle>
            <CardDescription>Your file should follow this format for successful import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Fixed Columns</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>name</strong> - Product name</li>
                  <li><strong>category</strong> - Product category</li>
                  <li><strong>subcategory</strong> - Product subcategory</li>
                  <li><strong>quantity</strong> - Available stock (numeric)</li>
                  <li><strong>country</strong> - Country of origin</li>
                  <li><strong>brand</strong> - Product brand</li>
                  <li><strong>price</strong> - Product price (numeric)</li>
                  <li><strong>supplier</strong> - Product supplier</li>
                  <li><strong>location</strong> - Storage location</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Additional Columns</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Any additional columns will be treated as custom attributes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Example</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">category</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">price</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">quantity</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">brand</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-3 py-2">Steel Beam</td>
                        <td className="px-3 py-2">Construction</td>
                        <td className="px-3 py-2">299.99</td>
                        <td className="px-3 py-2">50</td>
                        <td className="px-3 py-2">SteelCo</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Safety Helmet</td>
                        <td className="px-3 py-2">Safety Equipment</td>
                        <td className="px-3 py-2">45.00</td>
                        <td className="px-3 py-2">200</td>
                        <td className="px-3 py-2">SafetyFirst</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
