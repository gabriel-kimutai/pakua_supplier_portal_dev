import { getListing, updateListing } from "@/lib/functions/listings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { X, Upload, ImageIcon } from "lucide-react";
import { getCategories } from "@/lib/functions/categories";
import type { Category } from "@/lib/category-model";
import ErrorComponent from "@/components/Error";

export const Route = createFileRoute("/_base/manage_/$id")({
  component: RouteComponent,
  loader: ({ params }) => getListing({ data: params.id }),
  pendingComponent: () => {
    return <h1>Loading...</h1>
  },
  errorComponent: ({ error }) => {
    return <ErrorComponent message={error.message} />
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const listing = Route.useLoaderData()


  const categoryQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["updateListing"],
    mutationFn: async (formData: FormData) => await updateListing({ data: formData }),
    onSuccess: (ctx) => {
      if (ctx?.error) {
        toast.error("Failed to update listing", { description: ctx.message })
        return
      }
      toast.success("Listing updated")
    },
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[] | null>(
    listing?.images || null
  );

  useEffect(() => setExistingImages(listing?.images || null), [listing])


  // Handle new image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error("Invalid files", {
        description:
          "Some files were skipped. Only images under 5MB are allowed.",
      });
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    console.log(selectedImages)
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev!.filter((u) => u !== url));
  };

  // Create preview URL for selected files
  const createPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  // Dynamically create validation schema based on attributes
  const listingSchema = useMemo(() => {
    const attributesSchema: Record<string, any> = {};

    // Create schema for each attribute based on its type
    Object.entries(listing?.attributes || {}).forEach(([key, value]) => {
      if (typeof value === "number") {
        attributesSchema[key] = z
          .number()
          .min(0, `${formatAttributeName(key)} must be a positive number`);
      } else if (typeof value === "string") {
        attributesSchema[key] = z
          .string()
          .min(1, `${formatAttributeName(key)} is required`);
      } else if (typeof value === "boolean") {
        attributesSchema[key] = z.boolean();
      } else {
        // Default to string for other types
        attributesSchema[key] = z.any();
      }
    });

    return z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string(),
      price: z.number().min(0, "Price must be a positive number"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      category_id: z.number(),
      location: z.string().min(1, "Location is required"),
      attributes: z.object(attributesSchema),
    });
  }, [listing]);

  const form = useForm({
    defaultValues: listing,
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData();

        // Append form values
        Object.entries(value).forEach(([key, val]) => {
          if (key === "images" || key === "seller") {
            return
          }
          if (key === "attributes") {
            // Append attributes as a JSON string
            formData.append(key, JSON.stringify(val));
          } else {
            // @ts-ignore
            formData.append(key, val);
          }
        });

        selectedImages.forEach((file: File) => {
          formData.append("images", file, file.name); // Append each selected image
        });
        formData.append("id", id)

        mutate(formData)

      } catch (error) {
        console.error(error);
      }
    },
  });


  // Helper function to format attribute names for display
  function formatAttributeName(name: string): string {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Helper function to determine input type based on attribute value
  function getInputTypeForAttribute(value: any): string {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "checkbox";
    return "text";
  }

  // Render dynamic attribute fields
  const renderAttributeFields = () => {
    return Object.entries(listing?.attributes).map(([key, value]) => {
      const inputType = getInputTypeForAttribute(value);
      const formattedName = formatAttributeName(key);

      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={`attr-${key}`}>{formattedName}</Label>
          <form.Field
            name={`attributes.${key}`}
            validators={{
              onChange:
                typeof value === "number"
                  ? z
                    .number()
                    .min(0, `${formattedName} must be a positive number`)
                  : typeof value === "string"
                    ? z.string().min(1, `${formattedName} is required`)
                    : z.any(),
            }}
          >
            {(field) => (
              <>
                {inputType === "checkbox" ? (
                  <div className="flex items-center space-x-2">
                    <input
                      id={`attr-${key}`}
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`attr-${key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {formattedName}
                    </label>
                  </div>
                ) : key === "price_measure" ? (
                  <Select
                    name={field.state.value}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id={`attr-${key}`}>
                      <SelectValue>{field.state.value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per sq/m">per sq/m</SelectItem>
                      <SelectItem value="per piece">per piece</SelectItem>
                      <SelectItem value="per box">per box</SelectItem>
                      <SelectItem value="per set">per set</SelectItem>
                    </SelectContent>
                  </Select>
                ) : key === "material" ? (
                  <Input
                    id={`attr-${key}`}
                    type={inputType}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        inputType === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id={`attr-${key}`}
                    type={inputType}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        inputType === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors[0]?.message}
                  </p>
                ) : null}
              </>
            )}
          </form.Field>
        </div>
      );
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        encType={'multipart/form-data'}
        className="space-y-8"
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="hover:cursor-pointer" value="general">General Details</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="attributes">Attributes</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Edit the general details of your listing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <form.Field
                    name="title"
                    validators={{
                      onChange: z.string().min(1, "Title is required"),
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          id="title"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors
                          ? field.state.meta.errors.map((err) => (
                            <p className="text-sm text-red-500 mt-1">
                              {err?.message}
                            </p>
                          ))
                          : null}
                      </>
                    )}
                  </form.Field>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <form.Field name="description">
                    {(field) => (
                      <Textarea
                        id="description"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="min-h-[120px]"
                      />
                    )}
                  </form.Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <form.Field
                      name="price"
                      validators={{
                        onChange: z
                          .number()
                          .min(0, "Price must be a positive number"),
                      }}
                    >
                      {(field) => (
                        <>
                          <Input
                            id="price"
                            type="number"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                          />
                          {field.state.meta.errors
                            ? field.state.meta.errors.map((err) => (
                              <p className="text-sm text-red-500 mt-1">
                                {err?.message}
                              </p>
                            ))
                            : null}
                        </>
                      )}
                    </form.Field>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <form.Field
                      name="quantity"
                      validators={{
                        onChange: z
                          .number()
                          .min(1, "Quantity must be at least 1"),
                      }}
                    >
                      {(field) => (
                        <>
                          <Input
                            id="quantity"
                            type="number"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                          />
                          {field.state.meta.errors
                            ? field.state.meta.errors.map((err) => (
                              <p className="text-sm text-red-500 mt-1">
                                {err?.message}
                              </p>
                            ))
                            : null}
                        </>
                      )}
                    </form.Field>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <form.Field name="category.name">
                    {(field) => (
                      <Select
                        // @ts-ignore
                        value={field.state.value || null}
                        onValueChange={(value) =>
                          field.handleChange(value)
                        }
                      >

                        <SelectTrigger>
                          {/* {JSON.stringify(field.state.value)} */}
                          <SelectValue aria-label={field.state.value} >{field.state.value || "test"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categoryQuery.isFetched &&
                            categoryQuery.data?.map((category: Category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <form.Field
                    name="location"
                    validators={{
                      onChange: z.string().min(1, "Location is required"),
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          id="location"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors
                          ? field.state.meta.errors.map((err) => (
                            <p className="text-sm text-red-500 mt-1">
                              {err?.message}
                            </p>
                          ))
                          : null}
                      </>
                    )}
                  </form.Field>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attributes">
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
                <CardDescription>
                  Edit the specific attributes of your product.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderAttributeFields()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload and manage images for your listing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div className="text-lg font-medium text-gray-900">
                      Upload Images
                    </div>
                    <div className="text-sm text-gray-500">
                      Click to select images or drag and drop
                    </div>
                    <div className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB each
                    </div>
                  </label>
                </div>

                {/* Existing Images */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages?.map((imageUrl, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Existing image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Images Preview */}
                {selectedImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">New Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedImages.map((file, index) => (
                        <div
                          key={`selected-${index}`}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={createPreviewUrl(file) || "/placeholder.svg"}
                              alt={`Selected image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ImageIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Image Guidelines
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • Use high-quality images that clearly show your
                          product
                        </li>
                        <li>
                          • The first image will be used as the main product
                          image
                        </li>
                        <li>• Recommended size: 800x800 pixels or larger</li>
                        <li>• Maximum file size: 5MB per image</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-end px-0">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
