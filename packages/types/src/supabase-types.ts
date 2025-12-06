export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          barangay_id: string | null;
          city_municipality_id: string;
          coordinates: unknown;
          created_at: string;
          display_name: string | null;
          id: string;
          is_default: boolean | null;
          island_group_id: string | null;
          name: string | null;
          owner_id: string | null;
          province_id: string;
          region_id: string | null;
          street: string | null;
          updated_at: string;
          zip_code: string | null;
        };
        Insert: {
          barangay_id?: string | null;
          city_municipality_id: string;
          coordinates?: unknown;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_default?: boolean | null;
          island_group_id?: string | null;
          name?: string | null;
          owner_id?: string | null;
          province_id: string;
          region_id?: string | null;
          street?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Update: {
          barangay_id?: string | null;
          city_municipality_id?: string;
          coordinates?: unknown;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_default?: boolean | null;
          island_group_id?: string | null;
          name?: string | null;
          owner_id?: string | null;
          province_id?: string;
          region_id?: string | null;
          street?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_barangay_id_barangays_id_fk';
            columns: ['barangay_id'];
            isOneToOne: false;
            referencedRelation: 'barangays';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'addresses_city_municipality_id_cities_municipalities_id_fk';
            columns: ['city_municipality_id'];
            isOneToOne: false;
            referencedRelation: 'cities_municipalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'addresses_island_group_id_island_groups_id_fk';
            columns: ['island_group_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'addresses_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'addresses_province_id_provinces_id_fk';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'addresses_region_id_regions_id_fk';
            columns: ['region_id'];
            isOneToOne: false;
            referencedRelation: 'regions';
            referencedColumns: ['id'];
          },
        ];
      };
      avatars: {
        Row: {
          alt: string | null;
          blur_hash: string | null;
          created_at: string;
          filename: string | null;
          filesize: number | null;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          owner_id: string | null;
          sizes_icon_filename: string | null;
          sizes_icon_filesize: number | null;
          sizes_icon_height: number | null;
          sizes_icon_mime_type: string | null;
          sizes_icon_url: string | null;
          sizes_icon_width: number | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          thumbnail_u_r_l: string | null;
          updated_at: string;
          url: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_icon_filename?: string | null;
          sizes_icon_filesize?: number | null;
          sizes_icon_height?: number | null;
          sizes_icon_mime_type?: string | null;
          sizes_icon_url?: string | null;
          sizes_icon_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_icon_filename?: string | null;
          sizes_icon_filesize?: number | null;
          sizes_icon_height?: number | null;
          sizes_icon_mime_type?: string | null;
          sizes_icon_url?: string | null;
          sizes_icon_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'avatars_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      barangays: {
        Row: {
          city_municipality_id: string | null;
          code: string;
          created_at: string;
          district_code: string | null;
          id: string;
          island_group_id: string;
          name: string;
          old_name: string | null;
          province_id: string | null;
          region_id: string;
          sub_municipality_code: string | null;
          updated_at: string;
        };
        Insert: {
          city_municipality_id?: string | null;
          code: string;
          created_at?: string;
          district_code?: string | null;
          id?: string;
          island_group_id: string;
          name: string;
          old_name?: string | null;
          province_id?: string | null;
          region_id: string;
          sub_municipality_code?: string | null;
          updated_at?: string;
        };
        Update: {
          city_municipality_id?: string | null;
          code?: string;
          created_at?: string;
          district_code?: string | null;
          id?: string;
          island_group_id?: string;
          name?: string;
          old_name?: string | null;
          province_id?: string | null;
          region_id?: string;
          sub_municipality_code?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'barangays_city_municipality_id_cities_municipalities_id_fk';
            columns: ['city_municipality_id'];
            isOneToOne: false;
            referencedRelation: 'cities_municipalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'barangays_island_group_id_island_groups_id_fk';
            columns: ['island_group_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'barangays_province_id_provinces_id_fk';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'barangays_region_id_regions_id_fk';
            columns: ['region_id'];
            isOneToOne: false;
            referencedRelation: 'regions';
            referencedColumns: ['id'];
          },
        ];
      };
      blocked_users: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blocked_users_blocked_id_users_id_fk';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocked_users_blocker_id_users_id_fk';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cities_municipalities: {
        Row: {
          code: string;
          created_at: string;
          district_code: string | null;
          id: string;
          is_capital: boolean;
          island_group_id: string;
          name: string;
          old_name: string | null;
          province_id: string | null;
          region_id: string;
          type: Database['public']['Enums']['enum_cities_municipalities_type'];
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          district_code?: string | null;
          id?: string;
          is_capital?: boolean;
          island_group_id: string;
          name: string;
          old_name?: string | null;
          province_id?: string | null;
          region_id: string;
          type?: Database['public']['Enums']['enum_cities_municipalities_type'];
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          district_code?: string | null;
          id?: string;
          is_capital?: boolean;
          island_group_id?: string;
          name?: string;
          old_name?: string | null;
          province_id?: string | null;
          region_id?: string;
          type?: Database['public']['Enums']['enum_cities_municipalities_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cities_municipalities_island_group_id_island_groups_id_fk';
            columns: ['island_group_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cities_municipalities_province_id_provinces_id_fk';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cities_municipalities_region_id_regions_id_fk';
            columns: ['region_id'];
            isOneToOne: false;
            referencedRelation: 'regions';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          content: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          likes_count: number | null;
          owner_id: string | null;
          parent_id: string | null;
          post_id: string;
          replied_to_id: string | null;
          replies_count: number | null;
          status: Database['public']['Enums']['comment_status_enum'] | null;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          likes_count?: number | null;
          owner_id?: string | null;
          parent_id?: string | null;
          post_id: string;
          replied_to_id?: string | null;
          replies_count?: number | null;
          status?: Database['public']['Enums']['comment_status_enum'] | null;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          likes_count?: number | null;
          owner_id?: string | null;
          parent_id?: string | null;
          post_id?: string;
          replied_to_id?: string | null;
          replies_count?: number | null;
          status?: Database['public']['Enums']['comment_status_enum'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_comments_id_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_posts_id_fk';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_replied_to_id_comments_id_fk';
            columns: ['replied_to_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      comments_mentions: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_mentions_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      comments_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      conversation_participants: {
        Row: {
          added_by_id: string | null;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          participant_id: string;
          role: Database['public']['Enums']['enum_conversation_participants_role'];
          updated_at: string;
        };
        Insert: {
          added_by_id?: string | null;
          conversation_id: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          participant_id: string;
          role?: Database['public']['Enums']['enum_conversation_participants_role'];
          updated_at?: string;
        };
        Update: {
          added_by_id?: string | null;
          conversation_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          participant_id?: string;
          role?: Database['public']['Enums']['enum_conversation_participants_role'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_participants_added_by_id_users_id_fk';
            columns: ['added_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversation_participants_conversation_id_conversations_id_fk';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversation_participants_participant_id_users_id_fk';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          archived: boolean | null;
          avatar_id: string | null;
          created_at: string;
          created_by_id: string;
          deleted_at: string | null;
          id: string;
          last_message_at: string | null;
          title: string | null;
          type: Database['public']['Enums']['enum_conversation_type'];
          updated_at: string;
        };
        Insert: {
          archived?: boolean | null;
          avatar_id?: string | null;
          created_at?: string;
          created_by_id: string;
          deleted_at?: string | null;
          id?: string;
          last_message_at?: string | null;
          title?: string | null;
          type?: Database['public']['Enums']['enum_conversation_type'];
          updated_at?: string;
        };
        Update: {
          archived?: boolean | null;
          avatar_id?: string | null;
          created_at?: string;
          created_by_id?: string;
          deleted_at?: string | null;
          id?: string;
          last_message_at?: string | null;
          title?: string | null;
          type?: Database['public']['Enums']['enum_conversation_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_avatar_id_avatars_id_fk';
            columns: ['avatar_id'];
            isOneToOne: false;
            referencedRelation: 'avatars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      delivery_preferences: {
        Row: {
          address_id: string;
          created_at: string;
          created_by_id: string | null;
          id: string;
          name: string | null;
          owner_id: string | null;
          updated_at: string;
        };
        Insert: {
          address_id: string;
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          name?: string | null;
          owner_id?: string | null;
          updated_at?: string;
        };
        Update: {
          address_id?: string;
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          name?: string | null;
          owner_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'delivery_preferences_address_id_addresses_id_fk';
            columns: ['address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'delivery_preferences_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'delivery_preferences_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      delivery_preferences_available_days: {
        Row: {
          id: string;
          order: number;
          parent_id: string;
          value: Database['public']['Enums']['enum_days'] | null;
        };
        Insert: {
          id?: string;
          order: number;
          parent_id: string;
          value?: Database['public']['Enums']['enum_days'] | null;
        };
        Update: {
          id?: string;
          order?: number;
          parent_id?: string;
          value?: Database['public']['Enums']['enum_days'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'delivery_preferences_available_days_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'delivery_preferences';
            referencedColumns: ['id'];
          },
        ];
      };
      delivery_preferences_preferred_mode: {
        Row: {
          id: string;
          order: number;
          parent_id: string;
          value: Database['public']['Enums']['enum_delivery_modes'] | null;
        };
        Insert: {
          id?: string;
          order: number;
          parent_id: string;
          value?: Database['public']['Enums']['enum_delivery_modes'] | null;
        };
        Update: {
          id?: string;
          order?: number;
          parent_id?: string;
          value?: Database['public']['Enums']['enum_delivery_modes'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'delivery_preferences_preferred_mode_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'delivery_preferences';
            referencedColumns: ['id'];
          },
        ];
      };
      donations: {
        Row: {
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          created_by_id: string | null;
          details_collection_mode: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes: string | null;
          details_storage_type: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id: string;
          expired_at: string | null;
          id: string;
          rejected_at: string | null;
          remaining_volume: number;
          seen: boolean | null;
          seen_at: string | null;
          status: Database['public']['Enums']['enum_donation_request_status'];
          title: string | null;
          updated_at: string;
          volume: number;
        };
        Insert: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          details_collection_mode: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes?: string | null;
          details_storage_type: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id: string;
          expired_at?: string | null;
          id?: string;
          rejected_at?: string | null;
          remaining_volume?: number;
          seen?: boolean | null;
          seen_at?: string | null;
          status?: Database['public']['Enums']['enum_donation_request_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number;
        };
        Update: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          details_collection_mode?: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes?: string | null;
          details_storage_type?: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id?: string;
          expired_at?: string | null;
          id?: string;
          rejected_at?: string | null;
          remaining_volume?: number;
          seen?: boolean | null;
          seen_at?: string | null;
          status?: Database['public']['Enums']['enum_donation_request_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'donations_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_donor_id_individuals_id_fk';
            columns: ['donor_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
        ];
      };
      donations_rels: {
        Row: {
          delivery_preferences_id: string | null;
          hospitals_id: string | null;
          id: number;
          images_id: string | null;
          individuals_id: string | null;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          delivery_preferences_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          delivery_preferences_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'donations_rels_delivery_preferences_fk';
            columns: ['delivery_preferences_id'];
            isOneToOne: false;
            referencedRelation: 'delivery_preferences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_images_fk';
            columns: ['images_id'];
            isOneToOne: false;
            referencedRelation: 'images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
        ];
      };
      hospitals: {
        Row: {
          avatar_id: string | null;
          created_at: string;
          description: string | null;
          display_name: string | null;
          head: string | null;
          hospital_i_d: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          phone: string | null;
          type: Database['public']['Enums']['enum_hospitals_type'] | null;
          updated_at: string;
        };
        Insert: {
          avatar_id?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string | null;
          head?: string | null;
          hospital_i_d?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          phone?: string | null;
          type?: Database['public']['Enums']['enum_hospitals_type'] | null;
          updated_at?: string;
        };
        Update: {
          avatar_id?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string | null;
          head?: string | null;
          hospital_i_d?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          phone?: string | null;
          type?: Database['public']['Enums']['enum_hospitals_type'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hospitals_avatar_id_avatars_id_fk';
            columns: ['avatar_id'];
            isOneToOne: false;
            referencedRelation: 'avatars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hospitals_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      identities: {
        Row: {
          address: string | null;
          birth: string | null;
          created_at: string;
          created_by_id: string | null;
          expiration_date: string | null;
          family_name: string;
          given_name: string;
          id: string;
          id_image_id: string;
          id_number: string;
          id_type: Database['public']['Enums']['enum_identities_id_type'];
          issue_date: string | null;
          middle_name: string | null;
          ref_image_id: string;
          status: Database['public']['Enums']['enum_identities_status'];
          submitted_by_id: string;
          suffix: string | null;
          updated_at: string;
          updated_by_id: string | null;
        };
        Insert: {
          address?: string | null;
          birth?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          expiration_date?: string | null;
          family_name: string;
          given_name: string;
          id?: string;
          id_image_id: string;
          id_number: string;
          id_type: Database['public']['Enums']['enum_identities_id_type'];
          issue_date?: string | null;
          middle_name?: string | null;
          ref_image_id: string;
          status?: Database['public']['Enums']['enum_identities_status'];
          submitted_by_id: string;
          suffix?: string | null;
          updated_at?: string;
          updated_by_id?: string | null;
        };
        Update: {
          address?: string | null;
          birth?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          expiration_date?: string | null;
          family_name?: string;
          given_name?: string;
          id?: string;
          id_image_id?: string;
          id_number?: string;
          id_type?: Database['public']['Enums']['enum_identities_id_type'];
          issue_date?: string | null;
          middle_name?: string | null;
          ref_image_id?: string;
          status?: Database['public']['Enums']['enum_identities_status'];
          submitted_by_id?: string;
          suffix?: string | null;
          updated_at?: string;
          updated_by_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'identities_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'identities_id_image_id_identity_images_id_fk';
            columns: ['id_image_id'];
            isOneToOne: false;
            referencedRelation: 'identity_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'identities_ref_image_id_identity_images_id_fk';
            columns: ['ref_image_id'];
            isOneToOne: false;
            referencedRelation: 'identity_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'identities_submitted_by_id_individuals_id_fk';
            columns: ['submitted_by_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'identities_updated_by_id_users_id_fk';
            columns: ['updated_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      identity_images: {
        Row: {
          alt: string | null;
          blur_hash: string | null;
          created_at: string;
          created_by_id: string | null;
          filename: string | null;
          filesize: number | null;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          owner_id: string | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          thumbnail_u_r_l: string | null;
          updated_at: string;
          url: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'identity_images_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'identity_images_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      images: {
        Row: {
          alt: string | null;
          blur_hash: string | null;
          created_at: string;
          created_by_id: string | null;
          filename: string | null;
          filesize: number | null;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          owner_id: string | null;
          sizes_large_filename: string | null;
          sizes_large_filesize: number | null;
          sizes_large_height: number | null;
          sizes_large_mime_type: string | null;
          sizes_large_url: string | null;
          sizes_large_width: number | null;
          sizes_small_filename: string | null;
          sizes_small_filesize: number | null;
          sizes_small_height: number | null;
          sizes_small_mime_type: string | null;
          sizes_small_url: string | null;
          sizes_small_width: number | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          thumbnail_u_r_l: string | null;
          updated_at: string;
          url: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'images_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      individuals: {
        Row: {
          avatar_id: string | null;
          birth: string;
          created_at: string;
          dependents: number | null;
          display_name: string | null;
          family_name: string;
          gender: Database['public']['Enums']['enum_individuals_gender'];
          given_name: string;
          id: string;
          is_verified: boolean | null;
          marital_status: Database['public']['Enums']['enum_individuals_marital_status'];
          middle_name: string | null;
          owner_id: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_id?: string | null;
          birth: string;
          created_at?: string;
          dependents?: number | null;
          display_name?: string | null;
          family_name: string;
          gender: Database['public']['Enums']['enum_individuals_gender'];
          given_name: string;
          id?: string;
          is_verified?: boolean | null;
          marital_status: Database['public']['Enums']['enum_individuals_marital_status'];
          middle_name?: string | null;
          owner_id?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_id?: string | null;
          birth?: string;
          created_at?: string;
          dependents?: number | null;
          display_name?: string | null;
          family_name?: string;
          gender?: Database['public']['Enums']['enum_individuals_gender'];
          given_name?: string;
          id?: string;
          is_verified?: boolean | null;
          marital_status?: Database['public']['Enums']['enum_individuals_marital_status'];
          middle_name?: string | null;
          owner_id?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'individuals_avatar_id_avatars_id_fk';
            columns: ['avatar_id'];
            isOneToOne: false;
            referencedRelation: 'avatars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'individuals_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      inventory: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          initial_volume: number;
          notes: string | null;
          received_at: string | null;
          remaining_volume: number;
          source_donation_id: string | null;
          status: Database['public']['Enums']['enum_inventory_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          initial_volume: number;
          notes?: string | null;
          received_at?: string | null;
          remaining_volume: number;
          source_donation_id?: string | null;
          status?: Database['public']['Enums']['enum_inventory_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          initial_volume?: number;
          notes?: string | null;
          received_at?: string | null;
          remaining_volume?: number;
          source_donation_id?: string | null;
          status?: Database['public']['Enums']['enum_inventory_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_source_donation_id_donations_id_fk';
            columns: ['source_donation_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_source_donation_id_donations_id_fk';
            columns: ['source_donation_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
        ];
      };
      inventory_allocation_details: {
        Row: {
          _order: number;
          _parent_id: string;
          allocated_at: string | null;
          allocation_id: string | null;
          id: string;
          notes: string | null;
          request_id: string;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          allocated_at?: string | null;
          allocation_id?: string | null;
          id: string;
          notes?: string | null;
          request_id: string;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          allocated_at?: string | null;
          allocation_id?: string | null;
          id?: string;
          notes?: string | null;
          request_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_allocation_details_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'inventory';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_allocation_details_request_id_requests_id_fk';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'inventory_allocation_details_request_id_requests_id_fk';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      inventory_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'inventory';
            referencedColumns: ['id'];
          },
        ];
      };
      island_groups: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      likes_rels: {
        Row: {
          comments_id: string | null;
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          posts_id: string | null;
        };
        Insert: {
          comments_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          posts_id?: string | null;
        };
        Update: {
          comments_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          posts_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_rels_comments_fk';
            columns: ['comments_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'likes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_rels_posts_fk';
            columns: ['posts_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      message_attachments: {
        Row: {
          created_at: string;
          created_by_id: string;
          id: string;
          message_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by_id: string;
          id?: string;
          message_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by_id?: string;
          id?: string;
          message_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_attachments_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_attachments_message_id_messages_id_fk';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      message_attachments_rels: {
        Row: {
          donations_id: string | null;
          id: number;
          message_media_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          requests_id: string | null;
        };
        Insert: {
          donations_id?: string | null;
          id?: number;
          message_media_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          requests_id?: string | null;
        };
        Update: {
          donations_id?: string | null;
          id?: number;
          message_media_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          requests_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_attachments_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_attachments_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
          {
            foreignKeyName: 'message_attachments_rels_message_media_fk';
            columns: ['message_media_id'];
            isOneToOne: false;
            referencedRelation: 'message_media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_attachments_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'message_attachments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_attachments_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'message_attachments_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      message_media: {
        Row: {
          alt: string | null;
          blur_hash: string | null;
          created_at: string;
          created_by_id: string | null;
          filename: string | null;
          filesize: number | null;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          sizes_preview_filename: string | null;
          sizes_preview_filesize: number | null;
          sizes_preview_height: number | null;
          sizes_preview_mime_type: string | null;
          sizes_preview_url: string | null;
          sizes_preview_width: number | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          thumbnail_u_r_l: string | null;
          updated_at: string;
          url: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          sizes_preview_filename?: string | null;
          sizes_preview_filesize?: number | null;
          sizes_preview_height?: number | null;
          sizes_preview_mime_type?: string | null;
          sizes_preview_url?: string | null;
          sizes_preview_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          sizes_preview_filename?: string | null;
          sizes_preview_filesize?: number | null;
          sizes_preview_height?: number | null;
          sizes_preview_mime_type?: string | null;
          sizes_preview_url?: string | null;
          sizes_preview_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_media_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_reactions: {
        Row: {
          created_at: string;
          emoji: string;
          id: string;
          message_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji: string;
          id?: string;
          message_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emoji?: string;
          id?: string;
          message_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reactions_message_id_messages_id_fk';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reactions_user_id_users_id_fk';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_reads: {
        Row: {
          id: string;
          message_id: string;
          read_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          read_at: string;
          user_id: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          read_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reads_message_id_messages_id_fk';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reads_user_id_users_id_fk';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string | null;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          edited: boolean | null;
          edited_at: string | null;
          id: string;
          reply_to_id: string | null;
          search_vector: string | null;
          type: Database['public']['Enums']['enum_message_type'];
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          conversation_id: string;
          created_at?: string;
          deleted_at?: string | null;
          edited?: boolean | null;
          edited_at?: string | null;
          id?: string;
          reply_to_id?: string | null;
          search_vector?: string | null;
          type?: Database['public']['Enums']['enum_message_type'];
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          conversation_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited?: boolean | null;
          edited_at?: string | null;
          id?: string;
          reply_to_id?: string | null;
          search_vector?: string | null;
          type?: Database['public']['Enums']['enum_message_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_conversations_id_fk';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_reply_to_id_messages_id_fk';
            columns: ['reply_to_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      messages_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      milk_bag_images: {
        Row: {
          alt: string | null;
          blur_hash: string | null;
          created_at: string;
          created_by_id: string | null;
          filename: string | null;
          filesize: number | null;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          owner_id: string | null;
          sizes_large_filename: string | null;
          sizes_large_filesize: number | null;
          sizes_large_height: number | null;
          sizes_large_mime_type: string | null;
          sizes_large_url: string | null;
          sizes_large_width: number | null;
          sizes_small_filename: string | null;
          sizes_small_filesize: number | null;
          sizes_small_height: number | null;
          sizes_small_mime_type: string | null;
          sizes_small_url: string | null;
          sizes_small_width: number | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          thumbnail_u_r_l: string | null;
          updated_at: string;
          url: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          blur_hash?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          filename?: string | null;
          filesize?: number | null;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string | null;
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_bag_images_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bag_images_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      milk_bags: {
        Row: {
          bag_image_id: string | null;
          code: string | null;
          collected_at: string;
          created_at: string;
          created_by_id: string | null;
          donor_id: string;
          expires_at: string | null;
          id: string;
          status: Database['public']['Enums']['enum_milk_bag_status'];
          title: string | null;
          updated_at: string;
          volume: number;
        };
        Insert: {
          bag_image_id?: string | null;
          code?: string | null;
          collected_at: string;
          created_at?: string;
          created_by_id?: string | null;
          donor_id: string;
          expires_at?: string | null;
          id?: string;
          status?: Database['public']['Enums']['enum_milk_bag_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number;
        };
        Update: {
          bag_image_id?: string | null;
          code?: string | null;
          collected_at?: string;
          created_at?: string;
          created_by_id?: string | null;
          donor_id?: string;
          expires_at?: string | null;
          id?: string;
          status?: Database['public']['Enums']['enum_milk_bag_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_bags_bag_image_id_milk_bag_images_id_fk';
            columns: ['bag_image_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bag_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bags_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bags_donor_id_individuals_id_fk';
            columns: ['donor_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
        ];
      };
      milk_bags_ownership_history: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
          transfer_reason: Database['public']['Enums']['enum_milk_bag_transfer_reason'];
          transferred_at: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
          transfer_reason?: Database['public']['Enums']['enum_milk_bag_transfer_reason'];
          transferred_at?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
          transfer_reason?: Database['public']['Enums']['enum_milk_bag_transfer_reason'];
          transferred_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_bags_ownership_history_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
        ];
      };
      milk_bags_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_bags_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bags_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bags_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_bags_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
        ];
      };
      milk_banks: {
        Row: {
          avatar_id: string | null;
          created_at: string;
          description: string | null;
          display_name: string | null;
          head: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          phone: string | null;
          type: Database['public']['Enums']['enum_milk_banks_type'] | null;
          updated_at: string;
        };
        Insert: {
          avatar_id?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string | null;
          head?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          phone?: string | null;
          type?: Database['public']['Enums']['enum_milk_banks_type'] | null;
          updated_at?: string;
        };
        Update: {
          avatar_id?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string | null;
          head?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          phone?: string | null;
          type?: Database['public']['Enums']['enum_milk_banks_type'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_banks_avatar_id_avatars_id_fk';
            columns: ['avatar_id'];
            isOneToOne: false;
            referencedRelation: 'avatars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_banks_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      muted_conversations: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          muted_until: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          muted_until?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          muted_until?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'muted_conversations_conversation_id_conversations_id_fk';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'muted_conversations_user_id_users_id_fk';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_categories: {
        Row: {
          active: boolean | null;
          color: Database['public']['Enums']['enum_system_colors'] | null;
          created_at: string;
          created_by_id: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          key: string;
          metadata_allow_user_settings: boolean | null;
          metadata_retention_days: number | null;
          name: string;
          sort_order: number | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean | null;
          color?: Database['public']['Enums']['enum_system_colors'] | null;
          created_at?: string;
          created_by_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          key: string;
          metadata_allow_user_settings?: boolean | null;
          metadata_retention_days?: number | null;
          name: string;
          sort_order?: number | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean | null;
          color?: Database['public']['Enums']['enum_system_colors'] | null;
          created_at?: string;
          created_by_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          key?: string;
          metadata_allow_user_settings?: boolean | null;
          metadata_retention_days?: number | null;
          name?: string;
          sort_order?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_categories_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_channels: {
        Row: {
          active: boolean | null;
          configuration_api_key: string | null;
          configuration_email_config_from_address: string | null;
          configuration_email_config_from_name: string | null;
          configuration_email_config_reply_to: string | null;
          configuration_endpoint: string | null;
          created_at: string;
          created_by_id: string | null;
          delivery_metadata_priority: number | null;
          delivery_metadata_rate_limit_per_hour: number | null;
          delivery_metadata_tags: string | null;
          delivery_retry_settings_max_retries: number | null;
          delivery_retry_settings_retry_delay: number | null;
          delivery_retry_settings_strategy:
            | Database['public']['Enums']['enum_notification_retry_strategy']
            | null;
          description: string | null;
          id: string;
          key: string;
          name: string;
          templates_html_template: string | null;
          templates_sms_template: string | null;
          templates_subject: string | null;
          templates_text_template: string | null;
          type: Database['public']['Enums']['enum_notification_channel_type'];
          updated_at: string;
        };
        Insert: {
          active?: boolean | null;
          configuration_api_key?: string | null;
          configuration_email_config_from_address?: string | null;
          configuration_email_config_from_name?: string | null;
          configuration_email_config_reply_to?: string | null;
          configuration_endpoint?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          delivery_metadata_priority?: number | null;
          delivery_metadata_rate_limit_per_hour?: number | null;
          delivery_metadata_tags?: string | null;
          delivery_retry_settings_max_retries?: number | null;
          delivery_retry_settings_retry_delay?: number | null;
          delivery_retry_settings_strategy?:
            | Database['public']['Enums']['enum_notification_retry_strategy']
            | null;
          description?: string | null;
          id?: string;
          key: string;
          name: string;
          templates_html_template?: string | null;
          templates_sms_template?: string | null;
          templates_subject?: string | null;
          templates_text_template?: string | null;
          type: Database['public']['Enums']['enum_notification_channel_type'];
          updated_at?: string;
        };
        Update: {
          active?: boolean | null;
          configuration_api_key?: string | null;
          configuration_email_config_from_address?: string | null;
          configuration_email_config_from_name?: string | null;
          configuration_email_config_reply_to?: string | null;
          configuration_endpoint?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          delivery_metadata_priority?: number | null;
          delivery_metadata_rate_limit_per_hour?: number | null;
          delivery_metadata_tags?: string | null;
          delivery_retry_settings_max_retries?: number | null;
          delivery_retry_settings_retry_delay?: number | null;
          delivery_retry_settings_strategy?:
            | Database['public']['Enums']['enum_notification_retry_strategy']
            | null;
          description?: string | null;
          id?: string;
          key?: string;
          name?: string;
          templates_html_template?: string | null;
          templates_sms_template?: string | null;
          templates_subject?: string | null;
          templates_text_template?: string | null;
          type?: Database['public']['Enums']['enum_notification_channel_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_channels_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_types: {
        Row: {
          active: boolean | null;
          category_id: string;
          created_at: string;
          created_by_id: string | null;
          description: string | null;
          id: string;
          key: string;
          name: string;
          priority: Database['public']['Enums']['enum_priority_level'];
          template_action_label: string | null;
          template_action_url: string | null;
          template_message: string;
          template_title: string;
          trigger_collection: Database['public']['Enums']['enum_notification_trigger_collection'];
          trigger_conditions: Json | null;
          trigger_event: Database['public']['Enums']['enum_notification_trigger_event'];
          updated_at: string;
        };
        Insert: {
          active?: boolean | null;
          category_id: string;
          created_at?: string;
          created_by_id?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          name: string;
          priority?: Database['public']['Enums']['enum_priority_level'];
          template_action_label?: string | null;
          template_action_url?: string | null;
          template_message: string;
          template_title: string;
          trigger_collection: Database['public']['Enums']['enum_notification_trigger_collection'];
          trigger_conditions?: Json | null;
          trigger_event: Database['public']['Enums']['enum_notification_trigger_event'];
          updated_at?: string;
        };
        Update: {
          active?: boolean | null;
          category_id?: string;
          created_at?: string;
          created_by_id?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          name?: string;
          priority?: Database['public']['Enums']['enum_priority_level'];
          template_action_label?: string | null;
          template_action_url?: string | null;
          template_message?: string;
          template_title?: string;
          trigger_collection?: Database['public']['Enums']['enum_notification_trigger_collection'];
          trigger_conditions?: Json | null;
          trigger_event?: Database['public']['Enums']['enum_notification_trigger_event'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_types_category_id_notification_categories_id_fk';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'notification_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notification_types_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_types_rels: {
        Row: {
          id: number;
          notification_channels_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          id?: number;
          notification_channels_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          id?: number;
          notification_channels_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_types_rels_notification_channels_fk';
            columns: ['notification_channels_id'];
            isOneToOne: false;
            referencedRelation: 'notification_channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notification_types_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'notification_types';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_types_template_variables: {
        Row: {
          _order: number;
          _parent_id: string;
          default_value: string | null;
          description: string | null;
          id: string;
          key: string;
          path: string | null;
          required: boolean | null;
          type: Database['public']['Enums']['enum_js_types'];
        };
        Insert: {
          _order: number;
          _parent_id: string;
          default_value?: string | null;
          description?: string | null;
          id: string;
          key: string;
          path?: string | null;
          required?: boolean | null;
          type: Database['public']['Enums']['enum_js_types'];
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          default_value?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          path?: string | null;
          required?: boolean | null;
          type?: Database['public']['Enums']['enum_js_types'];
        };
        Relationships: [
          {
            foreignKeyName: 'notification_types_template_variables_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'notification_types';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          created_by_id: string | null;
          id: string;
          message: string;
          notification_category_id: string;
          notification_type_id: string | null;
          priority: Database['public']['Enums']['enum_priority_level'] | null;
          read: boolean | null;
          read_at: string | null;
          recipient_id: string;
          related_data_action_label: string | null;
          related_data_action_url: string | null;
          seen: boolean | null;
          seen_at: string | null;
          title: string;
          updated_at: string;
          variables: Json | null;
        };
        Insert: {
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          message: string;
          notification_category_id: string;
          notification_type_id?: string | null;
          priority?: Database['public']['Enums']['enum_priority_level'] | null;
          read?: boolean | null;
          read_at?: string | null;
          recipient_id: string;
          related_data_action_label?: string | null;
          related_data_action_url?: string | null;
          seen?: boolean | null;
          seen_at?: string | null;
          title: string;
          updated_at?: string;
          variables?: Json | null;
        };
        Update: {
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          message?: string;
          notification_category_id?: string;
          notification_type_id?: string | null;
          priority?: Database['public']['Enums']['enum_priority_level'] | null;
          read?: boolean | null;
          read_at?: string | null;
          recipient_id?: string;
          related_data_action_label?: string | null;
          related_data_action_url?: string | null;
          seen?: boolean | null;
          seen_at?: string | null;
          title?: string;
          updated_at?: string;
          variables?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_notification_category_id_notification_categories_';
            columns: ['notification_category_id'];
            isOneToOne: false;
            referencedRelation: 'notification_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_notification_type_id_notification_types_id_fk';
            columns: ['notification_type_id'];
            isOneToOne: false;
            referencedRelation: 'notification_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_recipient_id_users_id_fk';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications_delivery_channels_stats: {
        Row: {
          _order: number;
          _parent_id: string;
          attempts: number | null;
          channel_id: string;
          failure_reason: string | null;
          id: string;
          last_attempt_at: string | null;
          scheduled: boolean | null;
          scheduled_for: string | null;
          sent: boolean | null;
          sent_at: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          attempts?: number | null;
          channel_id: string;
          failure_reason?: string | null;
          id: string;
          last_attempt_at?: string | null;
          scheduled?: boolean | null;
          scheduled_for?: string | null;
          sent?: boolean | null;
          sent_at?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          attempts?: number | null;
          channel_id?: string;
          failure_reason?: string | null;
          id?: string;
          last_attempt_at?: string | null;
          scheduled?: boolean | null;
          scheduled_for?: string | null;
          sent?: boolean | null;
          sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_delivery_channels_stats_channel_id_notification_c';
            columns: ['channel_id'];
            isOneToOne: false;
            referencedRelation: 'notification_channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_delivery_channels_stats_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'notifications';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications_rels: {
        Row: {
          donations_id: string | null;
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
          requests_id: string | null;
          transactions_id: string | null;
        };
        Insert: {
          donations_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
          requests_id?: string | null;
          transactions_id?: string | null;
        };
        Update: {
          donations_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
          requests_id?: string | null;
          transactions_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
          {
            foreignKeyName: 'notifications_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'notifications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'notifications_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_rels_transactions_fk';
            columns: ['transactions_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      payload_jobs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error: Json | null;
          has_error: boolean | null;
          id: string;
          input: Json | null;
          processing: boolean | null;
          queue: string | null;
          task_slug: Database['public']['Enums']['enum_payload_jobs_task_slug'] | null;
          total_tried: number | null;
          updated_at: string;
          wait_until: string | null;
          workflow_slug: Database['public']['Enums']['enum_payload_jobs_workflow_slug'] | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          error?: Json | null;
          has_error?: boolean | null;
          id?: string;
          input?: Json | null;
          processing?: boolean | null;
          queue?: string | null;
          task_slug?: Database['public']['Enums']['enum_payload_jobs_task_slug'] | null;
          total_tried?: number | null;
          updated_at?: string;
          wait_until?: string | null;
          workflow_slug?: Database['public']['Enums']['enum_payload_jobs_workflow_slug'] | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          error?: Json | null;
          has_error?: boolean | null;
          id?: string;
          input?: Json | null;
          processing?: boolean | null;
          queue?: string | null;
          task_slug?: Database['public']['Enums']['enum_payload_jobs_task_slug'] | null;
          total_tried?: number | null;
          updated_at?: string;
          wait_until?: string | null;
          workflow_slug?: Database['public']['Enums']['enum_payload_jobs_workflow_slug'] | null;
        };
        Relationships: [];
      };
      payload_jobs_log: {
        Row: {
          _order: number;
          _parent_id: string;
          completed_at: string;
          error: Json | null;
          executed_at: string;
          id: string;
          input: Json | null;
          output: Json | null;
          state: Database['public']['Enums']['enum_payload_jobs_log_state'];
          task_i_d: string;
          task_slug: Database['public']['Enums']['enum_payload_jobs_log_task_slug'];
        };
        Insert: {
          _order: number;
          _parent_id: string;
          completed_at: string;
          error?: Json | null;
          executed_at: string;
          id: string;
          input?: Json | null;
          output?: Json | null;
          state: Database['public']['Enums']['enum_payload_jobs_log_state'];
          task_i_d: string;
          task_slug: Database['public']['Enums']['enum_payload_jobs_log_task_slug'];
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          completed_at?: string;
          error?: Json | null;
          executed_at?: string;
          id?: string;
          input?: Json | null;
          output?: Json | null;
          state?: Database['public']['Enums']['enum_payload_jobs_log_state'];
          task_i_d?: string;
          task_slug?: Database['public']['Enums']['enum_payload_jobs_log_task_slug'];
        };
        Relationships: [
          {
            foreignKeyName: 'payload_jobs_log_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'payload_jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      payload_kv: {
        Row: {
          data: Json;
          id: string;
          key: string;
        };
        Insert: {
          data: Json;
          id?: string;
          key: string;
        };
        Update: {
          data?: Json;
          id?: string;
          key?: string;
        };
        Relationships: [];
      };
      payload_locked_documents: {
        Row: {
          created_at: string;
          global_slug: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          global_slug?: string | null;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          global_slug?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payload_locked_documents_rels: {
        Row: {
          addresses_id: string | null;
          avatars_id: string | null;
          barangays_id: string | null;
          blocked_users_id: string | null;
          cities_municipalities_id: string | null;
          comments_id: string | null;
          conversation_participants_id: string | null;
          conversations_id: string | null;
          delivery_preferences_id: string | null;
          donations_id: string | null;
          hospitals_id: string | null;
          id: number;
          identities_id: string | null;
          identity_images_id: string | null;
          images_id: string | null;
          individuals_id: string | null;
          inventory_id: string | null;
          island_groups_id: string | null;
          likes_id: string | null;
          message_attachments_id: string | null;
          message_media_id: string | null;
          message_reactions_id: string | null;
          message_reads_id: string | null;
          messages_id: string | null;
          milk_bag_images_id: string | null;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          muted_conversations_id: string | null;
          notification_categories_id: string | null;
          notification_channels_id: string | null;
          notification_types_id: string | null;
          notifications_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          payload_jobs_id: string | null;
          payload_kv_id: string | null;
          posts_id: string | null;
          provinces_id: string | null;
          regions_id: string | null;
          requests_id: string | null;
          transactions_id: string | null;
          user_search_id: string | null;
          users_id: string | null;
        };
        Insert: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          blocked_users_id?: string | null;
          cities_municipalities_id?: string | null;
          comments_id?: string | null;
          conversation_participants_id?: string | null;
          conversations_id?: string | null;
          delivery_preferences_id?: string | null;
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          identities_id?: string | null;
          identity_images_id?: string | null;
          images_id?: string | null;
          individuals_id?: string | null;
          inventory_id?: string | null;
          island_groups_id?: string | null;
          likes_id?: string | null;
          message_attachments_id?: string | null;
          message_media_id?: string | null;
          message_reactions_id?: string | null;
          message_reads_id?: string | null;
          messages_id?: string | null;
          milk_bag_images_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          muted_conversations_id?: string | null;
          notification_categories_id?: string | null;
          notification_channels_id?: string | null;
          notification_types_id?: string | null;
          notifications_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          payload_jobs_id?: string | null;
          payload_kv_id?: string | null;
          posts_id?: string | null;
          provinces_id?: string | null;
          regions_id?: string | null;
          requests_id?: string | null;
          transactions_id?: string | null;
          user_search_id?: string | null;
          users_id?: string | null;
        };
        Update: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          blocked_users_id?: string | null;
          cities_municipalities_id?: string | null;
          comments_id?: string | null;
          conversation_participants_id?: string | null;
          conversations_id?: string | null;
          delivery_preferences_id?: string | null;
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          identities_id?: string | null;
          identity_images_id?: string | null;
          images_id?: string | null;
          individuals_id?: string | null;
          inventory_id?: string | null;
          island_groups_id?: string | null;
          likes_id?: string | null;
          message_attachments_id?: string | null;
          message_media_id?: string | null;
          message_reactions_id?: string | null;
          message_reads_id?: string | null;
          messages_id?: string | null;
          milk_bag_images_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          muted_conversations_id?: string | null;
          notification_categories_id?: string | null;
          notification_channels_id?: string | null;
          notification_types_id?: string | null;
          notifications_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          payload_jobs_id?: string | null;
          payload_kv_id?: string | null;
          posts_id?: string | null;
          provinces_id?: string | null;
          regions_id?: string | null;
          requests_id?: string | null;
          transactions_id?: string | null;
          user_search_id?: string | null;
          users_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payload_locked_documents_rels_addresses_fk';
            columns: ['addresses_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_avatars_fk';
            columns: ['avatars_id'];
            isOneToOne: false;
            referencedRelation: 'avatars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_barangays_fk';
            columns: ['barangays_id'];
            isOneToOne: false;
            referencedRelation: 'barangays';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_blocked_users_fk';
            columns: ['blocked_users_id'];
            isOneToOne: false;
            referencedRelation: 'blocked_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_cities_municipalities_fk';
            columns: ['cities_municipalities_id'];
            isOneToOne: false;
            referencedRelation: 'cities_municipalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_comments_fk';
            columns: ['comments_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_conversation_participants_fk';
            columns: ['conversation_participants_id'];
            isOneToOne: false;
            referencedRelation: 'conversation_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_conversations_fk';
            columns: ['conversations_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_delivery_preferences_fk';
            columns: ['delivery_preferences_id'];
            isOneToOne: false;
            referencedRelation: 'delivery_preferences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_identities_fk';
            columns: ['identities_id'];
            isOneToOne: false;
            referencedRelation: 'identities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_identity_images_fk';
            columns: ['identity_images_id'];
            isOneToOne: false;
            referencedRelation: 'identity_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_images_fk';
            columns: ['images_id'];
            isOneToOne: false;
            referencedRelation: 'images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_inventory_fk';
            columns: ['inventory_id'];
            isOneToOne: false;
            referencedRelation: 'inventory';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_island_groups_fk';
            columns: ['island_groups_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_likes_fk';
            columns: ['likes_id'];
            isOneToOne: false;
            referencedRelation: 'likes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_message_attachments_fk';
            columns: ['message_attachments_id'];
            isOneToOne: false;
            referencedRelation: 'message_attachments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_message_media_fk';
            columns: ['message_media_id'];
            isOneToOne: false;
            referencedRelation: 'message_media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_message_reactions_fk';
            columns: ['message_reactions_id'];
            isOneToOne: false;
            referencedRelation: 'message_reactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_message_reads_fk';
            columns: ['message_reads_id'];
            isOneToOne: false;
            referencedRelation: 'message_reads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_messages_fk';
            columns: ['messages_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_milk_bag_images_fk';
            columns: ['milk_bag_images_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bag_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_muted_conversations_fk';
            columns: ['muted_conversations_id'];
            isOneToOne: false;
            referencedRelation: 'muted_conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_notification_categories_fk';
            columns: ['notification_categories_id'];
            isOneToOne: false;
            referencedRelation: 'notification_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_notification_channels_fk';
            columns: ['notification_channels_id'];
            isOneToOne: false;
            referencedRelation: 'notification_channels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_notification_types_fk';
            columns: ['notification_types_id'];
            isOneToOne: false;
            referencedRelation: 'notification_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_notifications_fk';
            columns: ['notifications_id'];
            isOneToOne: false;
            referencedRelation: 'notifications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'payload_locked_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_payload_jobs_fk';
            columns: ['payload_jobs_id'];
            isOneToOne: false;
            referencedRelation: 'payload_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_payload_kv_fk';
            columns: ['payload_kv_id'];
            isOneToOne: false;
            referencedRelation: 'payload_kv';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_posts_fk';
            columns: ['posts_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_provinces_fk';
            columns: ['provinces_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_regions_fk';
            columns: ['regions_id'];
            isOneToOne: false;
            referencedRelation: 'regions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_transactions_fk';
            columns: ['transactions_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_user_search_fk';
            columns: ['user_search_id'];
            isOneToOne: false;
            referencedRelation: 'user_search';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_users_fk';
            columns: ['users_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      payload_migrations: {
        Row: {
          batch: number | null;
          created_at: string;
          id: string;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          batch?: number | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          batch?: number | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      payload_preferences: {
        Row: {
          created_at: string;
          id: string;
          key: string | null;
          updated_at: string;
          value: Json | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          key?: string | null;
          updated_at?: string;
          value?: Json | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          key?: string | null;
          updated_at?: string;
          value?: Json | null;
        };
        Relationships: [];
      };
      payload_preferences_rels: {
        Row: {
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
          users_id: string | null;
        };
        Insert: {
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
          users_id?: string | null;
        };
        Update: {
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
          users_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payload_preferences_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'payload_preferences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_preferences_rels_users_fk';
            columns: ['users_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          comments_count: number | null;
          content: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          likes_count: number | null;
          owner_id: string | null;
          shares_count: number | null;
          status: Database['public']['Enums']['enum_posts_status'] | null;
          summary: string | null;
          title: string;
          updated_at: string;
          visibility: Database['public']['Enums']['enum_posts_visibility'];
        };
        Insert: {
          comments_count?: number | null;
          content?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          likes_count?: number | null;
          owner_id?: string | null;
          shares_count?: number | null;
          status?: Database['public']['Enums']['enum_posts_status'] | null;
          summary?: string | null;
          title: string;
          updated_at?: string;
          visibility?: Database['public']['Enums']['enum_posts_visibility'];
        };
        Update: {
          comments_count?: number | null;
          content?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          likes_count?: number | null;
          owner_id?: string | null;
          shares_count?: number | null;
          status?: Database['public']['Enums']['enum_posts_status'] | null;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          visibility?: Database['public']['Enums']['enum_posts_visibility'];
        };
        Relationships: [
          {
            foreignKeyName: 'posts_owner_id_users_id_fk';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_attachments: {
        Row: {
          _order: number;
          _parent_id: string;
          caption: string | null;
          id: string;
          image_id: string | null;
          media_type: Database['public']['Enums']['post_attachment_media_type_enum'];
        };
        Insert: {
          _order: number;
          _parent_id: string;
          caption?: string | null;
          id: string;
          image_id?: string | null;
          media_type?: Database['public']['Enums']['post_attachment_media_type_enum'];
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          caption?: string | null;
          id?: string;
          image_id?: string | null;
          media_type?: Database['public']['Enums']['post_attachment_media_type_enum'];
        };
        Relationships: [
          {
            foreignKeyName: 'posts_attachments_image_id_images_id_fk';
            columns: ['image_id'];
            isOneToOne: false;
            referencedRelation: 'images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_attachments_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_rels: {
        Row: {
          donations_id: string | null;
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          posts_id: string | null;
          requests_id: string | null;
        };
        Insert: {
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          posts_id?: string | null;
          requests_id?: string | null;
        };
        Update: {
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          posts_id?: string | null;
          requests_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
          {
            foreignKeyName: 'posts_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_posts_fk';
            columns: ['posts_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'posts_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_tags: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
          tag: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
          tag?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
          tag?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_tags_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      provinces: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          island_group_id: string;
          name: string;
          region_id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          island_group_id: string;
          name: string;
          region_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          island_group_id?: string;
          name?: string;
          region_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'provinces_island_group_id_island_groups_id_fk';
            columns: ['island_group_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'provinces_region_id_regions_id_fk';
            columns: ['region_id'];
            isOneToOne: false;
            referencedRelation: 'regions';
            referencedColumns: ['id'];
          },
        ];
      };
      regions: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          island_group_id: string;
          name: string;
          region_name: string | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          island_group_id: string;
          name: string;
          region_name?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          island_group_id?: string;
          name?: string;
          region_name?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'regions_island_group_id_island_groups_id_fk';
            columns: ['island_group_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      requests: {
        Row: {
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          created_by_id: string | null;
          details_image_id: string | null;
          details_needed_at: string;
          details_notes: string | null;
          details_reason: string | null;
          details_storage_preference:
            | Database['public']['Enums']['enum_requests_details_storage_preference']
            | null;
          details_urgency: Database['public']['Enums']['enum_priority_level'];
          expired_at: string | null;
          id: string;
          initial_volume_needed: number;
          rejected_at: string | null;
          requester_id: string;
          seen: boolean | null;
          seen_at: string | null;
          status: Database['public']['Enums']['enum_donation_request_status'];
          title: string | null;
          updated_at: string;
          volume_fulfilled: number;
          volume_needed: number;
        };
        Insert: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          details_image_id?: string | null;
          details_needed_at: string;
          details_notes?: string | null;
          details_reason?: string | null;
          details_storage_preference?:
            | Database['public']['Enums']['enum_requests_details_storage_preference']
            | null;
          details_urgency?: Database['public']['Enums']['enum_priority_level'];
          expired_at?: string | null;
          id?: string;
          initial_volume_needed?: number;
          rejected_at?: string | null;
          requester_id: string;
          seen?: boolean | null;
          seen_at?: string | null;
          status?: Database['public']['Enums']['enum_donation_request_status'];
          title?: string | null;
          updated_at?: string;
          volume_fulfilled?: number;
          volume_needed?: number;
        };
        Update: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          details_image_id?: string | null;
          details_needed_at?: string;
          details_notes?: string | null;
          details_reason?: string | null;
          details_storage_preference?:
            | Database['public']['Enums']['enum_requests_details_storage_preference']
            | null;
          details_urgency?: Database['public']['Enums']['enum_priority_level'];
          expired_at?: string | null;
          id?: string;
          initial_volume_needed?: number;
          rejected_at?: string | null;
          requester_id?: string;
          seen?: boolean | null;
          seen_at?: string | null;
          status?: Database['public']['Enums']['enum_donation_request_status'];
          title?: string | null;
          updated_at?: string;
          volume_fulfilled?: number;
          volume_needed?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_details_image_id_images_id_fk';
            columns: ['details_image_id'];
            isOneToOne: false;
            referencedRelation: 'images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_requester_id_individuals_id_fk';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
        ];
      };
      requests_rels: {
        Row: {
          delivery_preferences_id: string | null;
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          delivery_preferences_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          delivery_preferences_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_rels_delivery_preferences_fk';
            columns: ['delivery_preferences_id'];
            isOneToOne: false;
            referencedRelation: 'delivery_preferences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'requests_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      spatial_ref_sys: {
        Row: {
          auth_name: string | null;
          auth_srid: number | null;
          proj4text: string | null;
          srid: number;
          srtext: string | null;
        };
        Insert: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid: number;
          srtext?: string | null;
        };
        Update: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid?: number;
          srtext?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          created_at: string;
          created_by_id: string | null;
          delivery_arrival_recipient_arrived_at: string | null;
          delivery_arrival_recipient_departed_at: string | null;
          delivery_arrival_sender_arrived_at: string | null;
          delivery_arrival_sender_departed_at: string | null;
          delivery_confirmed_address_id: string | null;
          delivery_confirmed_confirmed_at: string | null;
          delivery_confirmed_datetime: string | null;
          delivery_confirmed_instructions: string | null;
          delivery_confirmed_mode: Database['public']['Enums']['enum_delivery_modes'] | null;
          donation_id: string | null;
          id: string;
          matched_volume: number;
          request_id: string | null;
          status: Database['public']['Enums']['enum_transaction_status'];
          tracking_cancel_reason: string | null;
          tracking_cancelled_at: string | null;
          tracking_completed_at: string | null;
          tracking_delivered_at: string | null;
          tracking_failed_at: string | null;
          tracking_failure_reason: string | null;
          transaction_number: string | null;
          transaction_type: Database['public']['Enums']['enum_transaction_type'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by_id?: string | null;
          delivery_arrival_recipient_arrived_at?: string | null;
          delivery_arrival_recipient_departed_at?: string | null;
          delivery_arrival_sender_arrived_at?: string | null;
          delivery_arrival_sender_departed_at?: string | null;
          delivery_confirmed_address_id?: string | null;
          delivery_confirmed_confirmed_at?: string | null;
          delivery_confirmed_datetime?: string | null;
          delivery_confirmed_instructions?: string | null;
          delivery_confirmed_mode?: Database['public']['Enums']['enum_delivery_modes'] | null;
          donation_id?: string | null;
          id?: string;
          matched_volume?: number;
          request_id?: string | null;
          status?: Database['public']['Enums']['enum_transaction_status'];
          tracking_cancel_reason?: string | null;
          tracking_cancelled_at?: string | null;
          tracking_completed_at?: string | null;
          tracking_delivered_at?: string | null;
          tracking_failed_at?: string | null;
          tracking_failure_reason?: string | null;
          transaction_number?: string | null;
          transaction_type?: Database['public']['Enums']['enum_transaction_type'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by_id?: string | null;
          delivery_arrival_recipient_arrived_at?: string | null;
          delivery_arrival_recipient_departed_at?: string | null;
          delivery_arrival_sender_arrived_at?: string | null;
          delivery_arrival_sender_departed_at?: string | null;
          delivery_confirmed_address_id?: string | null;
          delivery_confirmed_confirmed_at?: string | null;
          delivery_confirmed_datetime?: string | null;
          delivery_confirmed_instructions?: string | null;
          delivery_confirmed_mode?: Database['public']['Enums']['enum_delivery_modes'] | null;
          donation_id?: string | null;
          id?: string;
          matched_volume?: number;
          request_id?: string | null;
          status?: Database['public']['Enums']['enum_transaction_status'];
          tracking_cancel_reason?: string | null;
          tracking_cancelled_at?: string | null;
          tracking_completed_at?: string | null;
          tracking_delivered_at?: string | null;
          tracking_failed_at?: string | null;
          tracking_failure_reason?: string | null;
          transaction_number?: string | null;
          transaction_type?: Database['public']['Enums']['enum_transaction_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_delivery_confirmed_address_id_addresses_id_fk';
            columns: ['delivery_confirmed_address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_donation_id_donations_id_fk';
            columns: ['donation_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_donation_id_donations_id_fk';
            columns: ['donation_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['donation_id'];
          },
          {
            foreignKeyName: 'transactions_request_id_requests_id_fk';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'matched_donations_requests_view';
            referencedColumns: ['request_id'];
          },
          {
            foreignKeyName: 'transactions_request_id_requests_id_fk';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions_delivery_proposed: {
        Row: {
          _order: number;
          _parent_id: string;
          address_id: string | null;
          agreements_both_agreed: boolean | null;
          agreements_recipient_agreed: boolean | null;
          agreements_recipient_agreed_at: string | null;
          agreements_sender_agreed: boolean | null;
          agreements_sender_agreed_at: string | null;
          datetime: string | null;
          id: string;
          instructions: string | null;
          mode: Database['public']['Enums']['enum_delivery_modes'] | null;
          proposed_at: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          address_id?: string | null;
          agreements_both_agreed?: boolean | null;
          agreements_recipient_agreed?: boolean | null;
          agreements_recipient_agreed_at?: string | null;
          agreements_sender_agreed?: boolean | null;
          agreements_sender_agreed_at?: string | null;
          datetime?: string | null;
          id: string;
          instructions?: string | null;
          mode?: Database['public']['Enums']['enum_delivery_modes'] | null;
          proposed_at?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          address_id?: string | null;
          agreements_both_agreed?: boolean | null;
          agreements_recipient_agreed?: boolean | null;
          agreements_recipient_agreed_at?: string | null;
          agreements_sender_agreed?: boolean | null;
          agreements_sender_agreed_at?: string | null;
          datetime?: string | null;
          id?: string;
          instructions?: string | null;
          mode?: Database['public']['Enums']['enum_delivery_modes'] | null;
          proposed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_delivery_proposed_address_id_addresses_id_fk';
            columns: ['address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_delivery_proposed_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions_tracking_seen_status: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
          seen: boolean | null;
          seen_at: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
          seen?: boolean | null;
          seen_at?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
          seen?: boolean | null;
          seen_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_tracking_seen_status_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions_tracking_status_history: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
          notes: string | null;
          status: Database['public']['Enums']['enum_transaction_status'];
          timestamp: string;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
          notes?: string | null;
          status: Database['public']['Enums']['enum_transaction_status'];
          timestamp: string;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
          notes?: string | null;
          status?: Database['public']['Enums']['enum_transaction_status'];
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_tracking_status_history_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      user_search: {
        Row: {
          created_at: string;
          id: string;
          priority: number | null;
          search_excerpt: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          priority?: number | null;
          search_excerpt?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          priority?: number | null;
          search_excerpt?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_search_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_search_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_search_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_search_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_search_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'user_search';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          auth_id: string | null;
          created_at: string;
          email: string;
          email_confirmed_at: string | null;
          id: string;
          last_sign_in_at: string | null;
          online_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          picture: string | null;
          profile_type: Database['public']['Enums']['enum_users_profile_type'] | null;
          role: Database['public']['Enums']['enum_users_role'] | null;
          updated_at: string;
        };
        Insert: {
          auth_id?: string | null;
          created_at?: string;
          email: string;
          email_confirmed_at?: string | null;
          id?: string;
          last_sign_in_at?: string | null;
          online_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          picture?: string | null;
          profile_type?: Database['public']['Enums']['enum_users_profile_type'] | null;
          role?: Database['public']['Enums']['enum_users_role'] | null;
          updated_at?: string;
        };
        Update: {
          auth_id?: string | null;
          created_at?: string;
          email?: string;
          email_confirmed_at?: string | null;
          id?: string;
          last_sign_in_at?: string | null;
          online_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          picture?: string | null;
          profile_type?: Database['public']['Enums']['enum_users_profile_type'] | null;
          role?: Database['public']['Enums']['enum_users_role'] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      users_rels: {
        Row: {
          hospitals_id: string | null;
          id: number;
          individuals_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          hospitals_id?: string | null;
          id?: number;
          individuals_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_rels_individuals_fk';
            columns: ['individuals_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null;
          f_geography_column: unknown;
          f_table_catalog: unknown;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown;
          f_table_catalog: string | null;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      matched_donations_requests_view: {
        Row: {
          distance: number | null;
          donation_id: string | null;
          donation_status: Database['public']['Enums']['enum_donation_request_status'] | null;
          id: number | null;
          matched_barangay_id: string | null;
          matched_city_municipality_id: string | null;
          matched_delivery_day: Database['public']['Enums']['enum_days'] | null;
          matched_delivery_mode: Database['public']['Enums']['enum_delivery_modes'] | null;
          matched_province_id: string | null;
          request_id: string | null;
          request_status: Database['public']['Enums']['enum_donation_request_status'] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown };
        Returns: unknown;
      };
      _postgis_pgsql_version: { Args: never; Returns: string };
      _postgis_scripts_pgsql_version: { Args: never; Returns: string };
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown };
        Returns: number;
      };
      _postgis_stats: {
        Args: { ''?: string; att_name: string; tbl: unknown };
        Returns: string;
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_sortablehash: { Args: { geom: unknown }; Returns: number };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          clip?: unknown;
          g1: unknown;
          return_polygons?: boolean;
          tolerance?: number;
        };
        Returns: unknown;
      };
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      addauth: { Args: { '': string }; Returns: boolean };
      addgeometrycolumn:
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              new_dim: number;
              new_srid_in: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          };
      disablelongtransactions: { Args: never; Returns: string };
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      enablelongtransactions: { Args: never; Returns: string };
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      geometry: { Args: { '': string }; Returns: unknown };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geomfromewkt: { Args: { '': string }; Returns: unknown };
      gettransactionid: { Args: never; Returns: unknown };
      longtransactionsenabled: { Args: never; Returns: boolean };
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number };
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: string;
      };
      postgis_extensions_upgrade: { Args: never; Returns: string };
      postgis_full_version: { Args: never; Returns: string };
      postgis_geos_version: { Args: never; Returns: string };
      postgis_lib_build_date: { Args: never; Returns: string };
      postgis_lib_revision: { Args: never; Returns: string };
      postgis_lib_version: { Args: never; Returns: string };
      postgis_libjson_version: { Args: never; Returns: string };
      postgis_liblwgeom_version: { Args: never; Returns: string };
      postgis_libprotobuf_version: { Args: never; Returns: string };
      postgis_libxml_version: { Args: never; Returns: string };
      postgis_proj_version: { Args: never; Returns: string };
      postgis_scripts_build_date: { Args: never; Returns: string };
      postgis_scripts_installed: { Args: never; Returns: string };
      postgis_scripts_released: { Args: never; Returns: string };
      postgis_svn_version: { Args: never; Returns: string };
      postgis_type_name: {
        Args: {
          coord_dimension: number;
          geomname: string;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_version: { Args: never; Returns: string };
      postgis_wagyu_version: { Args: never; Returns: string };
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
            Returns: number;
          };
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkt: { Args: { '': string }; Returns: string };
      st_asgeojson:
        | {
            Args: {
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
              r: Record<string, unknown>;
            };
            Returns: string;
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_asgml:
        | {
            Args: {
              geom: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string };
      st_asmvtgeom: {
        Args: {
          bounds: unknown;
          buffer?: number;
          clip_geom?: boolean;
          extent?: number;
          geom: unknown;
        };
        Returns: unknown;
      };
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_astext: { Args: { '': string }; Returns: string };
      st_astwkb:
        | {
            Args: {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number };
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown };
        Returns: unknown;
      };
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number };
            Returns: unknown;
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number };
            Returns: unknown;
          };
      st_centroid: { Args: { '': string }; Returns: unknown };
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean;
          param_geom: unknown;
          param_pctconvex: number;
        };
        Returns: unknown;
      };
      st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_coorddim: { Args: { geometry: unknown }; Returns: number };
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean };
            Returns: number;
          };
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number };
            Returns: number;
          };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_expand:
        | {
            Args: {
              dm?: number;
              dx: number;
              dy: number;
              dz?: number;
              geom: unknown;
            };
            Returns: unknown;
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number };
            Returns: unknown;
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown };
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number };
        Returns: unknown;
      };
      st_generatepoints:
        | {
            Args: { area: unknown; npoints: number; seed: number };
            Returns: unknown;
          }
        | { Args: { area: unknown; npoints: number }; Returns: unknown };
      st_geogfromtext: { Args: { '': string }; Returns: unknown };
      st_geographyfromtext: { Args: { '': string }; Returns: unknown };
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string };
      st_geomcollfromtext: { Args: { '': string }; Returns: unknown };
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean;
          g: unknown;
          max_iter?: number;
          tolerance?: number;
        };
        Returns: unknown;
      };
      st_geometryfromtext: { Args: { '': string }; Returns: unknown };
      st_geomfromewkt: { Args: { '': string }; Returns: unknown };
      st_geomfromgeojson:
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': string }; Returns: unknown };
      st_geomfromgml: { Args: { '': string }; Returns: unknown };
      st_geomfromkml: { Args: { '': string }; Returns: unknown };
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown };
      st_geomfromtext: { Args: { '': string }; Returns: unknown };
      st_gmltosql: { Args: { '': string }; Returns: unknown };
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown };
        Returns: number;
      };
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean };
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown };
        Returns: Database['public']['CompositeTypes']['valid_detail'];
        SetofOptions: {
          from: '*';
          to: 'valid_detail';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number };
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string };
        Returns: unknown;
      };
      st_linefromtext: { Args: { '': string }; Returns: unknown };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown };
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          frommeasure: number;
          geometry: unknown;
          leftrightoffset?: number;
          tomeasure: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_mlinefromtext: { Args: { '': string }; Returns: unknown };
      st_mpointfromtext: { Args: { '': string }; Returns: unknown };
      st_mpolyfromtext: { Args: { '': string }; Returns: unknown };
      st_multilinestringfromtext: { Args: { '': string }; Returns: unknown };
      st_multipointfromtext: { Args: { '': string }; Returns: unknown };
      st_multipolygonfromtext: { Args: { '': string }; Returns: unknown };
      st_node: { Args: { g: unknown }; Returns: unknown };
      st_normalize: { Args: { geom: unknown }; Returns: unknown };
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_pointfromtext: { Args: { '': string }; Returns: unknown };
      st_pointm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
        };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: { Args: { '': string }; Returns: unknown };
      st_polygonfromtext: { Args: { '': string }; Returns: unknown };
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_m?: number;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number };
        Returns: unknown;
      };
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number };
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number };
        Returns: unknown[];
      };
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown };
        Returns: unknown;
      };
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_tileenvelope: {
        Args: {
          bounds?: unknown;
          margin?: number;
          x: number;
          y: number;
          zoom: number;
        };
        Returns: unknown;
      };
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number };
            Returns: unknown;
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string };
            Returns: unknown;
          };
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown };
      st_union:
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number };
            Returns: unknown;
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown };
      st_wkttosql: { Args: { '': string }; Returns: unknown };
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number };
        Returns: unknown;
      };
      unlockrows: { Args: { '': string }; Returns: number };
      update_milk_bag_status: { Args: never; Returns: undefined };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          column_name: string;
          new_srid_in: number;
          schema_name: string;
          table_name: string;
        };
        Returns: string;
      };
    };
    Enums: {
      comment_status_enum: 'PUBLISHED' | 'EDITED';
      enum_cities_municipalities_type: 'NONE' | 'CITY' | 'MUNICIPALITY';
      enum_conversation_participants_role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
      enum_conversation_type: 'DIRECT' | 'GROUP';
      enum_days: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
      enum_delivery_modes: 'PICKUP' | 'DELIVERY' | 'MEETUP';
      enum_donation_request_status:
        | 'PENDING'
        | 'AVAILABLE'
        | 'MATCHED'
        | 'COMPLETED'
        | 'EXPIRED'
        | 'CANCELLED'
        | 'REJECTED';
      enum_donations_details_collection_mode: 'MANUAL' | 'MANUAL_PUMP' | 'ELECTRIC_PUMP';
      enum_donations_details_storage_type: 'FRESH' | 'FROZEN' | 'OTHER';
      enum_hospitals_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_identities_id_type:
        | 'PASSPORT'
        | 'DRIVER_LICENSE'
        | 'UMID'
        | 'SSS'
        | 'POSTAL_ID'
        | 'TIN'
        | 'PHILHEALTH'
        | 'PHILID'
        | 'PRC'
        | 'OTHERS';
      enum_identities_status: 'PENDING' | 'REQUIRED_ACTION' | 'APPROVED' | 'REJECTED';
      enum_individuals_gender: 'MALE' | 'FEMALE' | 'OTHER';
      enum_individuals_marital_status:
        | 'SINGLE'
        | 'MARRIED'
        | 'SEPARATED'
        | 'WIDOWED'
        | 'DIVORCED'
        | 'N/A';
      enum_inventory_status: 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'CONSUMED';
      enum_js_types: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
      enum_message_type: 'TEXT' | 'SYSTEM';
      enum_milk_bag_status:
        | 'DRAFT'
        | 'AVAILABLE'
        | 'ALLOCATED'
        | 'CONSUMED'
        | 'EXPIRED'
        | 'DISCARDED';
      enum_milk_bag_transfer_reason: 'DONATION_COMPLETED' | 'REDISTRIBUTION' | 'RETURN' | 'N/A';
      enum_milk_banks_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_notification_channel_type:
        | 'IN_APP'
        | 'EMAIL'
        | 'SMS'
        | 'PUSH'
        | 'WEBHOOK'
        | 'EXTERNAL_API';
      enum_notification_retry_strategy: 'FIXED' | 'EXPONENTIAL' | 'LINEAR';
      enum_notification_trigger_collection: 'requests' | 'donations' | 'transactions';
      enum_notification_trigger_event: 'CREATE' | 'UPDATE' | 'DELETE';
      enum_payload_jobs_log_state: 'failed' | 'succeeded';
      enum_payload_jobs_log_task_slug:
        | 'inline'
        | 'id-verification-task'
        | 'send-email'
        | 'calculate-post-comment-count-task'
        | 'calculate-comment-reply-count-task';
      enum_payload_jobs_task_slug:
        | 'inline'
        | 'id-verification-task'
        | 'send-email'
        | 'calculate-post-comment-count-task'
        | 'calculate-comment-reply-count-task';
      enum_payload_jobs_workflow_slug: 'id-verification-workflow';
      enum_posts_status: 'DRAFT' | 'PUBLISHED' | 'REMOVED';
      enum_posts_visibility: 'PUBLIC' | 'PRIVATE';
      enum_priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      enum_requests_details_storage_preference: 'FRESH' | 'FROZEN' | 'OTHER' | 'EITHER';
      enum_system_colors:
        | 'PRIMARY'
        | 'SECONDARY'
        | 'TERTIARY'
        | 'POSITIVE'
        | 'WARNING'
        | 'DANGER'
        | 'INFO'
        | 'MUTED'
        | 'DEFAULT';
      enum_transaction_status:
        | 'MATCHED'
        | 'PENDING_DELIVERY_CONFIRMATION'
        | 'DELIVERY_SCHEDULED'
        | 'IN_TRANSIT'
        | 'READY_FOR_PICKUP'
        | 'DELIVERED'
        | 'COMPLETED'
        | 'FAILED'
        | 'CANCELLED';
      enum_transaction_type: 'P2P' | 'P2O' | 'O2P';
      enum_users_profile_type: 'INDIVIDUAL' | 'HOSPITAL' | 'MILK_BANK';
      enum_users_role: 'AUTHENTICATED' | 'ADMIN';
      post_attachment_media_type_enum: 'IMAGE';
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      comment_status_enum: ['PUBLISHED', 'EDITED'],
      enum_cities_municipalities_type: ['NONE', 'CITY', 'MUNICIPALITY'],
      enum_conversation_participants_role: ['ADMIN', 'MODERATOR', 'MEMBER'],
      enum_conversation_type: ['DIRECT', 'GROUP'],
      enum_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      enum_delivery_modes: ['PICKUP', 'DELIVERY', 'MEETUP'],
      enum_donation_request_status: [
        'PENDING',
        'AVAILABLE',
        'MATCHED',
        'COMPLETED',
        'EXPIRED',
        'CANCELLED',
        'REJECTED',
      ],
      enum_donations_details_collection_mode: ['MANUAL', 'MANUAL_PUMP', 'ELECTRIC_PUMP'],
      enum_donations_details_storage_type: ['FRESH', 'FROZEN', 'OTHER'],
      enum_hospitals_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_identities_id_type: [
        'PASSPORT',
        'DRIVER_LICENSE',
        'UMID',
        'SSS',
        'POSTAL_ID',
        'TIN',
        'PHILHEALTH',
        'PHILID',
        'PRC',
        'OTHERS',
      ],
      enum_identities_status: ['PENDING', 'REQUIRED_ACTION', 'APPROVED', 'REJECTED'],
      enum_individuals_gender: ['MALE', 'FEMALE', 'OTHER'],
      enum_individuals_marital_status: [
        'SINGLE',
        'MARRIED',
        'SEPARATED',
        'WIDOWED',
        'DIVORCED',
        'N/A',
      ],
      enum_inventory_status: ['AVAILABLE', 'RESERVED', 'EXPIRED', 'CONSUMED'],
      enum_js_types: ['string', 'number', 'boolean', 'date', 'array', 'object'],
      enum_message_type: ['TEXT', 'SYSTEM'],
      enum_milk_bag_status: ['DRAFT', 'AVAILABLE', 'ALLOCATED', 'CONSUMED', 'EXPIRED', 'DISCARDED'],
      enum_milk_bag_transfer_reason: ['DONATION_COMPLETED', 'REDISTRIBUTION', 'RETURN', 'N/A'],
      enum_milk_banks_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_notification_channel_type: ['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'EXTERNAL_API'],
      enum_notification_retry_strategy: ['FIXED', 'EXPONENTIAL', 'LINEAR'],
      enum_notification_trigger_collection: ['requests', 'donations', 'transactions'],
      enum_notification_trigger_event: ['CREATE', 'UPDATE', 'DELETE'],
      enum_payload_jobs_log_state: ['failed', 'succeeded'],
      enum_payload_jobs_log_task_slug: [
        'inline',
        'id-verification-task',
        'send-email',
        'calculate-post-comment-count-task',
        'calculate-comment-reply-count-task',
      ],
      enum_payload_jobs_task_slug: [
        'inline',
        'id-verification-task',
        'send-email',
        'calculate-post-comment-count-task',
        'calculate-comment-reply-count-task',
      ],
      enum_payload_jobs_workflow_slug: ['id-verification-workflow'],
      enum_posts_status: ['DRAFT', 'PUBLISHED', 'REMOVED'],
      enum_posts_visibility: ['PUBLIC', 'PRIVATE'],
      enum_priority_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      enum_requests_details_storage_preference: ['FRESH', 'FROZEN', 'OTHER', 'EITHER'],
      enum_system_colors: [
        'PRIMARY',
        'SECONDARY',
        'TERTIARY',
        'POSITIVE',
        'WARNING',
        'DANGER',
        'INFO',
        'MUTED',
        'DEFAULT',
      ],
      enum_transaction_status: [
        'MATCHED',
        'PENDING_DELIVERY_CONFIRMATION',
        'DELIVERY_SCHEDULED',
        'IN_TRANSIT',
        'READY_FOR_PICKUP',
        'DELIVERED',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
      ],
      enum_transaction_type: ['P2P', 'P2O', 'O2P'],
      enum_users_profile_type: ['INDIVIDUAL', 'HOSPITAL', 'MILK_BANK'],
      enum_users_role: ['AUTHENTICATED', 'ADMIN'],
      post_attachment_media_type_enum: ['IMAGE'],
    },
  },
} as const;
