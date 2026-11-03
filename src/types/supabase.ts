// =========================================================
// SPE Visions: Supabase database types
// Hand-written to match supabase/migrations.
// Regenerate later with:
//   npx supabase gen types typescript --project-id fzyxznyclhovdoujazph > src/types/supabase.ts
// =========================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  duration: string;
  level:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | "Beginner to Advanced"
    | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type CourseVideoRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  provider: string;
  provider_video_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type InternshipRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  stipend: string | null;
  category: string | null;
  eligibility: string | null;
  skills: string[];
  seats: number | null;
  deadline: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

type InternshipApplicationRow = {
  id: string;
  internship_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  cover_note: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

type JobRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  employment_type:
    | "Full Time"
    | "Part Time"
    | "Internship"
    | "Contract"
    | "Freelance"
    | null;
  company: string | null;
  work_mode: "Remote" | "On-site" | "Hybrid" | null;
  experience: string | null;
  salary: string | null;
  skills: string[];
  application_link: string | null;
  deadline: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type JobApplicationRow = {
  id: string;
  job_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  cover_note: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PortfolioProjectRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  project_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

type CertificateRow = {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
  updated_at: string;
};

type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  source: "purchase" | "free" | "admin";
  order_id: string | null;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type LessonProgressRow = {
  id: string;
  user_id: string;
  course_id: string;
  video_id: string;
  completed_at: string;
};

type CourseLessonRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  duration: number | null;
  order_index: number;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };

      services: {
        Row: ServiceRow;
        Insert: Partial<ServiceRow> & Pick<ServiceRow, "title" | "slug">;
        Update: Partial<ServiceRow>;
        Relationships: [];
      };

      courses: {
        Row: CourseRow;
        Insert: Partial<CourseRow> & Pick<CourseRow, "title" | "slug">;
        Update: Partial<CourseRow>;
        Relationships: [];
      };

      course_videos: {
        Row: CourseVideoRow;
        Insert: Partial<CourseVideoRow> &
          Pick<CourseVideoRow, "course_id" | "title">;
        Update: Partial<CourseVideoRow>;
        Relationships: [
          {
            foreignKeyName: "course_videos_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };

      internships: {
        Row: InternshipRow;
        Insert: Partial<InternshipRow> & Pick<InternshipRow, "title" | "slug">;
        Update: Partial<InternshipRow>;
        Relationships: [];
      };

      internship_applications: {
        Row: InternshipApplicationRow;
        Insert: Partial<InternshipApplicationRow> &
          Pick<InternshipApplicationRow, "full_name" | "email">;
        Update: Partial<InternshipApplicationRow>;
        Relationships: [
          {
            foreignKeyName: "internship_applications_internship_id_fkey";
            columns: ["internship_id"];
            isOneToOne: false;
            referencedRelation: "internships";
            referencedColumns: ["id"];
          }
        ];
      };

      jobs: {
        Row: JobRow;
        Insert: Partial<JobRow> & Pick<JobRow, "title" | "slug">;
        Update: Partial<JobRow>;
        Relationships: [];
      };

      job_applications: {
        Row: JobApplicationRow;
        Insert: Partial<JobApplicationRow> &
          Pick<JobApplicationRow, "full_name" | "email">;
        Update: Partial<JobApplicationRow>;
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };

      blogs: {
        Row: BlogRow;
        Insert: Partial<BlogRow> & Pick<BlogRow, "title" | "slug">;
        Update: Partial<BlogRow>;
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      portfolio_projects: {
        Row: PortfolioProjectRow;
        Insert: Partial<PortfolioProjectRow> &
          Pick<PortfolioProjectRow, "title" | "slug">;
        Update: Partial<PortfolioProjectRow>;
        Relationships: [];
      };

      certificates: {
        Row: CertificateRow;
        Insert: Partial<CertificateRow> &
          Pick<CertificateRow, "user_id" | "course_id" | "certificate_number">;
        Update: Partial<CertificateRow>;
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };

      contact_messages: {
        Row: ContactMessageRow;
        Insert: Partial<ContactMessageRow> &
          Pick<ContactMessageRow, "name" | "email" | "message">;
        Update: Partial<ContactMessageRow>;
        Relationships: [];
      };

      enrollments: {
        Row: EnrollmentRow;
        Insert: Partial<EnrollmentRow> &
          Pick<EnrollmentRow, "user_id" | "course_id">;
        Update: Partial<EnrollmentRow>;
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };

      orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow> &
          Pick<
            OrderRow,
            "user_id" | "course_id" | "amount" | "razorpay_order_id"
          >;
        Update: Partial<OrderRow>;
        Relationships: [];
      };

      lesson_progress: {
        Row: LessonProgressRow;
        Insert: Partial<LessonProgressRow> &
          Pick<LessonProgressRow, "user_id" | "course_id" | "video_id">;
        Update: Partial<LessonProgressRow>;
        Relationships: [];
      };
    };

    Views: {
      course_lessons: {
        Row: CourseLessonRow;
        Relationships: [];
      };
    };

        Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      has_course_access: {
        Args: { p_course_id: string };
        Returns: boolean;
      };
      issue_certificate: {
        Args: { p_course_id: string };
        Returns: string;
      };
            admin_list_students: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
        }[];
      };
      verify_certificate: {
        Args: { p_number: string };
        Returns: {
          certificate_number: string;
          issued_at: string;
          holder_name: string | null;
          course_title: string;
        }[];
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ---------------------------------------------------------
// Convenience helpers
//   Tables<"services">      -> a table row
//   ViewRows<"course_lessons"> -> a view row
// ---------------------------------------------------------
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type ViewRows<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];