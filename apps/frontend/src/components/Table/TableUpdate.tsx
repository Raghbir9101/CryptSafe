import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Save, Trash2 } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
// import { toast } from "@/components/ui/use-toast"
import { useNavigate, useParams } from "react-router-dom"
import { Label } from "../ui/label"
import { toast } from "sonner"
import { createTable, updateTable } from "../Services/TableService"
import { api } from "@/Utils/utils"
import { TableInterface } from "@repo/types"
import { decryptObjectValues, encryptObjectValues } from "../Services/encrption"

// Define the field types
const fieldTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"] as const

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
    .min(1, "At least one field is required"),
})

type FormValues = z.infer<typeof formSchema>

export default function TableUpdate() {
  const { id } = useParams();
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

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Here you would typically send the data to your API
      console.log("Table data:", {
        ...data,
      })

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
      const encryptedData = encryptObjectValues(postData, import.meta.env.VITE_GOOGLE_API);
      const res = await updateTable(id, encryptedData)
      if (res.status == "error") {
        return toast(`Error creating table`, {
          description: `There was an error creating your table. Please try again.`,
        })
      }


      toast(`Table updated successfully`, {
        description: `Table "${data.name}" has been created.`,
      })

      router("/tables")

    } catch (error) {
      console.error("Error creating table:", error)
      toast(`Error updating table`, {
        description: `There was an error creating your table. Please try again.`,
      })

    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    api.get<TableInterface>(`/tables/${id}`).then((res) => {
      console.log(res.data,'res.data')
      const decryptedData = decryptObjectValues(res.data, import.meta.env.VITE_GOOGLE_API);
      console.log(decryptedData,'decryptedData')
      form.setValue("name", decryptedData.name ?? "")
      form.setValue("description", decryptedData.description ?? "")
      form.setValue("fields", (decryptedData.fields || []).map(item => {
        return {
          ...item,
          options: ((item.options || []).join(","))
        }
      }))
    });
  }, [])

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Table</CardTitle>
          <CardDescription>
            Define the structure of your table by adding fields and setting their properties.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
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
                  <Button type="button" variant="outline" size="sm" onClick={addField} className=" flex items-center " >
                    <Plus className="h-3 w-3" />
                    <Label className="relative top-[-0.5px]">Add Field</Label>
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No fields added yet. Click "Add Field" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">Field {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-8 w-8 absolute top-2 right-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove field</span>
                            </Button>
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
                          {(form.watch(`fields.${index}.type`) === "SELECT" ||
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
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-5">
              <Button variant="outline" type="button" onClick={() => router(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
                    Update Table
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}