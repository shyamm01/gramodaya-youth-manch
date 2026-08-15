import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Mobile Number validation schema
 */
export const mobileSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(15, 'Mobile number must not exceed 15 characters')
  .regex(/^[0-9+\s()-]+$/, 'Invalid mobile number format')
  .transform((val) => val.replace(/\D/g, '').slice(-10));

/**
 * Pincode validation schema (6 digits)
 */
export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Pincode must be a valid 6-digit Indian PIN code')
  .optional()
  .or(z.literal(''));

/**
 * 1. MEMBER / REGISTRATION SCHEMA
 */
export const memberCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: mobileSchema,
  villageId: z.union([z.string(), z.number()]).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(4, 'Password must be at least 4 characters').optional(),
  photoUrl: z.string().optional().or(z.literal('')),
  organizationName: z.string().optional(),
  fatherName: z.string().max(100).optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().max(300).optional(),
  pincode: pincodeSchema,
  state: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  block: z.string().max(100).optional(),
  gramPanchayat: z.string().max(100).optional(),
  villageName: z.string().max(100).optional(),
  postOffice: z.string().max(100).optional(),
  houseNo: z.string().max(100).optional(),
  street: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  politicalBackground: z.string().max(200).optional(),
  bloodGroup: z.string().max(10).optional(),
  role: z.string().default('MEMBER'),
  systemRole: z.string().default('MEMBER'),
  status: z.string().default('active'),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 2. COMPLAINT / GRIEVANCE SCHEMA
 */
export const complaintCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  category: z.string().min(2, 'Category is required').default('Other'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().min(2, 'Location is required').default('Rasoolpur'),
  reporterName: z.string().min(2, 'Reporter name is required'),
  reporterMobile: mobileSchema,
  villageId: z.union([z.string(), z.number()]).optional(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isDemo: z.boolean().optional().default(false),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 3. SOCIAL WORK SCHEMA
 */
export const socialWorkCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().default('Rasoolpur'),
  submitterName: z.string().min(2, 'Submitter name is required'),
  submitterMobile: mobileSchema,
  date: z.string().optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 4. EVENT SCHEMA
 */
export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(200),
  description: z.string().optional(),
  date: z.string().min(4, 'Date is required'),
  time: z.string().min(2, 'Time is required'),
  location: z.string().min(2, 'Location is required'),
  villageId: z.union([z.string(), z.number()]).optional(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  status: z.string().default('PUBLISHED'),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 5. ANNOUNCEMENT SCHEMA
 */
export const announcementCreateSchema = z.object({
  title: z.string().min(3, 'Announcement title must be at least 3 characters').max(200),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  publishedBy: z.string().default('ग्रामोदय यूथ मंच'),
  isUrgent: z.boolean().default(false),
  date: z.string().optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 6. GALLERY SCHEMA
 */
export const galleryCreateSchema = z.object({
  photoUrl: z.string().min(5, 'Photo URL is required'),
  caption: z.string().max(200).optional(),
  uploadedBy: z.string().default('Admin'),
  uploadedByMobile: z.string().optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 7. ELDER SCHEMA
 */
export const elderCreateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  age: z.string().optional(),
  role: z.string().optional(),
  contribution: z.string().optional(),
  photoUrl: z.string().optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 8. PUBLIC INFO SCHEMA
 */
export const publicInfoCreateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(5, 'Description is required'),
  category: z.string().default('General'),
  submitterName: z.string().min(2, 'Submitter name is required'),
  submitterMobile: mobileSchema,
  villageId: z.union([z.string(), z.number()]).optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 9. VILLAGE CHAPTER SCHEMA
 */
export const villageCreateSchema = z.object({
  name: z.string().min(2, 'Village name is required'),
  nameHindi: z.string().min(2, 'Village name in Hindi is required'),
  gramPanchayatName: z.string().optional(),
  gramPanchayatNameHindi: z.string().optional(),
  districtName: z.string().default('Hardoi'),
  districtNameHindi: z.string().default('हरदोई'),
  stateName: z.string().default('Uttar Pradesh'),
  stateNameHindi: z.string().default('उत्तर प्रदेश'),
  blockName: z.string().default('Hardoi'),
  blockNameHindi: z.string().default('हरदोई'),
  pincode: pincodeSchema.default('241125'),
  postOffice: z.string().default('Bahera Rasoolpur'),
  orgName: z.string().default('Gramodaya Youth Manch'),
  orgNameHindi: z.string().default('ग्रामोदय यूथ मंच'),
  sloganHindi: z.string().optional(),
  taglineHindi: z.string().optional(),
  adminName: z.string().optional(),
  adminMobile: z.string().optional(),
});

/**
 * 10. AUTH & OTP SCHEMAS
 */
export const sendOtpSchema = z.object({
  mobile: mobileSchema,
  purpose: z.enum(['LOGIN', 'REGISTER', 'RESET_PASSWORD']).optional().default('LOGIN'),
});

export const verifyOtpSchema = z.object({
  mobile: mobileSchema,
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(6, 'OTP must not exceed 6 digits'),
});

export const authLoginSchema = z.object({
  mobile: z.string().min(3, 'Mobile number or Email is required'),
  password: z.string().min(1, 'Password is required').optional(),
  otp: z.string().optional(),
});

export const groupMessageSchema = z.object({
  senderName: z.string().min(2, 'Sender name is required'),
  senderRole: z.string().default('Member'),
  senderMobile: z.string().optional(),
  senderPhoto: z.string().optional(),
  text: z.string().min(1, 'Message text cannot be empty'),
  villageId: z.union([z.string(), z.number()]).optional(),
});

export type ValidationResult<T> =
  | { success: true; data: T; response?: never }
  | { success: false; response: NextResponse; data?: never };

/**
 * Helper function to validate request JSON body with a Zod Schema
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const rawBody = await req.json();
    const result = schema.safeParse(rawBody);

    if (!result.success) {
      const errorFormatted = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: errorFormatted[0]?.message || 'Validation failed',
            errors: errorFormatted,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      ),
    };
  }
}
