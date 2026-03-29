import { z } from "zod";

const courseDetailTutorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profile_picture: z.string().nullable().optional(),
});

export const courseVideoItemSchema = z.object({
  video_id: z.string(),
  video_title: z.string(),
  video_url: z.string(),
  video_description: z.string().nullable().optional(),
  video_priority: z.number(),
});

export const courseDetailApiSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  image: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  tutor_id: z.string(),
  subtitle: z.string().nullable().optional(),
  video_presentation: z.string().nullable().optional(),
  active: z.boolean().optional(),
  tutor: courseDetailTutorSchema.nullable().optional(),
  videos: z.array(courseVideoItemSchema).nullable(),
  audios: z.array(z.unknown()).nullable().optional(),
});

export type CourseDetail = z.infer<typeof courseDetailApiSchema>;
export type CourseVideoItem = z.infer<typeof courseVideoItemSchema>;
