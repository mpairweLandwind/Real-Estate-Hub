import { z } from "zod"

// Property validation schema
export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  propertyType: z.enum(["apartment", "house", "commercial", "land", "office"]),
  listingType: z.enum(["rent", "sale", "both"]),
  price: z.number().min(1, "Price must be greater than 0").max(100000000, "Price too high"),
  bedrooms: z.number().int().min(0).max(50).optional().nullable(),
  bathrooms: z.number().int().min(0).max(50).optional().nullable(),
  areaSqft: z.number().min(1).max(1000000).optional().nullable(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().max(100).optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export type PropertyFormData = z.infer<typeof propertySchema>

// Maintenance request validation schema
export const maintenanceSchema = z.object({
  propertyId: z.string().uuid("Invalid property"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  category: z.enum(["plumbing", "electrical", "hvac", "carpentry", "painting", "cleaning", "landscaping", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  estimatedCost: z.number().min(0).max(1000000).optional().nullable(),
})

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>

// Profile validation schema
export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: z
    .string()
    .regex(/^[\d\s\-+$$$$]+$/, "Invalid phone number format")
    .min(10, "Phone number too short")
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal("")),
  userType: z.enum(["tenant", "owner", "agent", "maintenance_provider"]),
})

export type ProfileFormData = z.infer<typeof profileSchema>
