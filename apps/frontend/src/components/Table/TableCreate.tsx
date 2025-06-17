import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Save, Trash2 } from "lucide-react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { Label } from "../ui/label"
import { toast } from "sonner"
import { createTable } from "../Services/TableService"
import { encryptObjectValues } from "../Services/encrption"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define the field types
// const fieldTypes = ["TEXT", "NUMBER", "DATE", "DATE-TIME", "BOOLEAN", "SELECT", "MULTISELECT"] as const
const fieldTypes = ["TEXT", "NUMBER", "DATE", "DATE-TIME", "BOOLEAN", "SELECT"] as const

// Define the schema for the form
const formSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  description: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string().min(1, "Field name is required"),
        type: z.enum(fieldTypes),
        unique: z.boolean().default(false),
        required: z.boolean().default(false),
        hidden: z.boolean().default(false),
        options: z.string().optional(),
      }),
    )
    .min(1, "At least one field is required")
    // .refine(
    //   (fields) => {
    //     const names = fields.map((field) => field.name.toLowerCase());
    //     return new Set(names).size === names.length;
    //   },
    //   {
    //     message: "Field names must be unique",
    //     path: ["fields"],
    //   }
    // ),
})

type FormValues = z.infer<typeof formSchema>

export default function TableCreate() {
  const router = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      fields: [
        {
          name: "",
          type: "TEXT",
          unique: false,
          required: false,
          hidden: false,
        },
      ],
    },
  })

  // Add form-level validation for duplicate field names
  const validateFieldNames = () => {
    const fields = form.getValues("fields");
    console.log(fields)
    const fieldNames = fields.map(field => field.name.toLowerCase());
    const seen = new Set();
    const duplicates = [];

    fieldNames.forEach((name, index) => {
      if (name && seen.has(name)) {
        duplicates.push(index);
      }
      seen.add(name);
    });

    if (duplicates.length > 0) {
      const lastDuplicateIndex = duplicates[duplicates.length - 1];
      
      // Show toast immediately
      toast.error("Duplicate Field Names", {
        description: "Please ensure all field names are unique.",
      });

      // Focus on the last duplicate field
      const inputElement = document.querySelector(`input[name="fields.${lastDuplicateIndex}.name"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }

      return false;
    }
    return true;
  };

  // Get the fields from the form
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  })

  // Add a new field
  const addField = () => {
    append({
      name: "",
      type: "TEXT",
      unique: false,
      required: false,
      hidden: false,
    })
  }  

  // Add a new field at specific index
  const addFieldAtIndex = (index: number) => {
    const newField: FormValues['fields'][0] = {
      name: "",
      type: "TEXT",
      unique: false,
      required: false,
      hidden: false,
    }
    const currentFields = form.getValues("fields")
    const updatedFields = [
      ...currentFields.slice(0, index + 1),
      newField,
      ...currentFields.slice(index + 1)
    ]
    form.setValue("fields", updatedFields)
  }
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length < 2) {
        toast.error("CSV file must have a header row and at least one field");
        return;
      }

      // Parse and validate header row
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const expectedHeaders = ['fieldname', 'datatype', 'options', 'unique', 'required', 'hidden'];
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      // Get header indices
      const fieldName = headers.indexOf('fieldname');
      const fieldType = headers.indexOf('datatype');
      const fieldOptions = headers.indexOf('options');
      const fieldUnique = headers.indexOf('unique');
      const fieldRequired = headers.indexOf('required');
      const fieldHidden = headers.indexOf('hidden');

      // Clear existing fields safely
      const currentLength = fields.length;
      for (let i = currentLength - 1; i >= 0; i--) {
        remove(i);
      }

      let successCount = 0;
      const errors: string[] = [];

      // Parse each field row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          console.log("values", values)
          // Validate row length
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Invalid number of columns`);
            continue;
          }

          // Validate field name
          if (!values[fieldName]) {
            errors.push(`Row ${i + 1}: Field name is required`);
            continue;
          }

          // Validate and normalize field type
          const type = values[fieldType].toUpperCase();
          if (!fieldTypes.includes(type as any)) {
            errors.push(`Row ${i + 1}: Invalid field type "${type}"`);
            continue;
          }

          // Parse boolean values safely
          const toBool = (val: string) => val.toLowerCase() === 'true';
          
          // Clean up options string
          let options = values[fieldOptions] || '';
          if (options.startsWith('"') && options.endsWith('"')) {
            options = options.slice(1, -1);
          }

          // Add the field with all validations passed
          append({
            name: values[fieldName],
            type: type as any,
            options: options.split("^").join(","),
            unique: toBool(values[fieldUnique]),
            required: toBool(values[fieldRequired]),
            hidden: toBool(values[fieldHidden])
          });

          successCount++;
        } catch (err) {
          console.error(`Error parsing row ${i + 1}:`, err);
          errors.push(`Row ${i + 1}: Invalid data format`);
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} fields`);
      } else {
        toast.error("No fields were imported");
      }

      // Show errors if any occurred
      if (errors.length > 0) {
        console.error("Import errors:", errors);
        toast.error("Some rows could not be imported", {
          description: errors.slice(0, 3).join('\n') + 
                      (errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : '')
        });
      }

    } catch (error) {
      console.error("Error reading CSV:", error);
      toast.error("Error reading CSV file");
    } finally {
      // Reset the file input
      event.target.value = '';
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    
    // First check for empty field names
    const emptyFields = data.fields.some(field => !field.name.trim());
    if (emptyFields) {
      toast.error("Empty Field Names", {
        description: "Please fill in all field names.",
      });
      return;
    }

    // Then check for duplicates
    if (!validateFieldNames()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your API
      console.log("Table data:", {
        ...data,
      });

      const postData = {
        name: data.name,
        description: data.description,
        fields: data.fields.map(item => {
          return {
            ...item,
            options: (item.options || "").split(",").filter(Boolean)
          }
        })
      }
      const encrypted = encryptObjectValues(postData, import.meta.env.VITE_GOOGLE_API);
      console.log(encrypted,'entypted.')
      const res = await createTable(encrypted);

      if (res.status == "error") {
        return toast.error("Error creating table", {
          description: "There was an error creating your table. Please try again.",
        });
      }

      toast.success("Table created successfully", {
        description: `Table "${data.name}" has been created.`,
      });

      router("/tables");

    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Error creating table", {
        description: "There was an error creating your table. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create New Table</h1>
        </div>
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Hidden file input for CSV import */}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="csvFileInput"
                />
                {/* Table Basic Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter table name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter a description for this table" className="resize-none" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional description to help users understand the purpose of this table.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Fields Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Fields</h3>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('csvFileInput')?.click()}
                      >
                        Import Fields
                      </Button>
                      <Button
                        type="button"
                        onClick={() => append({ name: '', type: 'TEXT', unique: false, required: false, hidden: false })}
                      >
                        Add Field
                      </Button>
                    </div>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-muted-foreground">No fields added yet. Click "Add Field" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fields.map((field, index) => (
                        <div key={field.id}>
                          <Card className="relative">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Field {index + 1}</CardTitle>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addFieldAtIndex(index)}
                                    className="h-8 w-8"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span className="sr-only">Add field after this</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove field</span>
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Field Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter field name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Field Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select field type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {fieldTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.unique`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Unique</FormLabel>
                                        <FormDescription>Values must be unique</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.required`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Required</FormLabel>
                                        <FormDescription>Field cannot be empty</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.hidden`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Hidden</FormLabel>
                                        <FormDescription>Hide from default view</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Options for SELECT and MULTISELECT types */}
                              {/* {(form.watch(`fields.${index}.type`) === "SELECT" ||
                                form.watch(`fields.${index}.type`) === "MULTISELECT") && (
                                  <FormField
                                    control={form.control}
                                    name={`fields.${index}.options`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Options</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Enter options, comma seperated "
                                            className="resize-none"
                                            value={field.value}
                                            onChange={(e) => {
                                              const options = e.target.value
                                              field.onChange(options)
                                            }}
                                          />
                                        </FormControl>
                                        <FormDescription>Enter each option on a new line</FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )} */}
                                {(form.watch(`fields.${index}.type`) === "SELECT") && (
                                <FormField
                                  control={form.control}
                                  name={`fields.${index}.options`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Options</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter options, comma seperated "
                                          className="resize-none"
                                          value={field.value}
                                          onChange={(e) => {
                                            const options = e.target.value
                                            field.onChange(options)
                                          }}
                                        />
                                      </FormControl>
                                      <FormDescription>Enter each option on a new line</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-5">
                <Button variant="outline" type="button" onClick={() => router(-1)}>
                  Cancel
                </Button>
                <div className="flex justify-center gap-2">
                <Button type="button" variant="outline" onClick={addField} className=" flex items-center " >
                      <Plus className="h-3 w-3" />
                      <Label className="relative top-[-0.5px]">Add Field</Label>
                    </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#4161ed] hover:bg-[#1f3fcc]">
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Create Table
                    </span>
                  )}
                </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}

