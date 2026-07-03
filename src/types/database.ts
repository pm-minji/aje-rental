export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          nickname: string | null;
          profile_image: string | null;
          introduction: string | null;
          role: 'user' | 'ajussi' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      ajussi_profiles: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          hourly_rate: number;
          available_areas: string[];
          open_chat_url: string | null;
          is_active: boolean;
          tags: string[];
          availability_mask: Record<string, any>;
          created_at: string;
          updated_at: string;
          real_name: string | null;
          birth_date: string | null;
          phone_number: string | null;
          career_history: string | null;
          specialties: string[] | null;
          slug: string | null;
        };
        Insert: Omit<Database['public']['Tables']['ajussi_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ajussi_profiles']['Insert']>;
      };
      requests: {
        Row: {
          id: string;
          client_id: string;
          ajussi_id: string;
          date: string;
          duration: number;
          location: string;
          description: string;
          status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
          payment_status: 'NONE' | 'PAYMENT_REQUESTED' | 'PAID' | 'EXPIRED' | 'REFUND_REQUESTED' | 'REFUNDED' | 'REFUND_DENIED';
          deposit_amount: number | null;
          payapp_mul_no: string | null;
          pay_type: number | null;
          paid_at: string | null;
          refund_requested_at: string | null;
          refund_processed_at: string | null;
          admin_payment_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['requests']['Row'],
          'id' | 'created_at' | 'updated_at' | 'payment_status' | 'deposit_amount' | 'payapp_mul_no' | 'pay_type' | 'paid_at' | 'refund_requested_at' | 'refund_processed_at' | 'admin_payment_note'
        > & Partial<Pick<
          Database['public']['Tables']['requests']['Row'],
          'payment_status' | 'deposit_amount' | 'payapp_mul_no' | 'pay_type' | 'paid_at' | 'refund_requested_at' | 'refund_processed_at' | 'admin_payment_note'
        >>;
        Update: Partial<Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      payment_events: {
        Row: {
          id: string;
          request_id: string | null;
          mul_no: string | null;
          pay_state: number | null;
          raw: Record<string, any>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_events']['Insert']>;
      };
      notification_logs: {
        Row: {
          id: string;
          event_type: string;
          channel: string;
          recipient: string;
          request_id: string | null;
          status: 'SENT' | 'FAILED';
          error: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notification_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notification_logs']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          request_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          ajussi_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
      ajussi_applications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          hourly_rate: number;
          available_areas: string[];
          open_chat_url: string;
          tags: string[];
          status: 'PENDING' | 'APPROVED' | 'REJECTED';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          real_name: string | null;
          birth_date: string | null;
          phone_number: string | null;
          career_history: string | null;
          specialties: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['ajussi_applications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ajussi_applications']['Insert']>;
      };
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AjussiProfile = Database['public']['Tables']['ajussi_profiles']['Row'];
export type Request = Database['public']['Tables']['requests']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type AjussiApplication = Database['public']['Tables']['ajussi_applications']['Row'];

export type RequestStatus = Request['status'];
export type PaymentStatus = Request['payment_status'];
export type PaymentEvent = Database['public']['Tables']['payment_events']['Row'];
export type NotificationLog = Database['public']['Tables']['notification_logs']['Row'];

export interface AjussiWithProfile extends AjussiProfile {
  profiles: Profile;
}

export interface RequestWithDetails extends Request {
  client: Profile;
  ajussi: Profile;
  ajussi_profiles: AjussiProfile;
  review?: {
    request_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
}

export interface AjussiWithReviews extends AjussiProfile {
  profiles: Profile;
  reviews?: ReviewWithDetails[];
  averageRating?: number;
  reviewCount?: number;
}

export interface ReviewWithDetails extends Review {
  reviewer: Pick<Profile, 'name' | 'nickname' | 'profile_image'>;
  request: Pick<Request, 'date' | 'duration' | 'location'>;
}