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
          role: 'user' | 'ajussi';
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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
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
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AjussiProfile = Database['public']['Tables']['ajussi_profiles']['Row'];
export type Request = Database['public']['Tables']['requests']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];

export type RequestStatus = Request['status'];

export interface AjussiWithProfile extends AjussiProfile {
  profiles: Profile;
}

export interface RequestWithDetails extends Request {
  client: Profile;
  ajussi: Profile;
  ajussi_profiles: AjussiProfile;
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