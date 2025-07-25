export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
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
          coordinates: unknown | null;
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
          coordinates?: unknown | null;
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
          coordinates?: unknown | null;
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
      deliveries: {
        Row: {
          created_at: string;
          created_by_id: string | null;
          details_confirmed_address_id: string;
          details_confirmed_time_slot_date: string | null;
          details_confirmed_time_slot_time_slot_custom_time_end_time: string | null;
          details_confirmed_time_slot_time_slot_custom_time_start_time: string | null;
          details_confirmed_time_slot_time_slot_preset_slot:
            | Database['public']['Enums']['enum_time_slot_preset']
            | null;
          details_confirmed_time_slot_time_slot_type:
            | Database['public']['Enums']['enum_time_slot_type']
            | null;
          details_instructions: string | null;
          donation_id: string;
          id: string;
          mode: Database['public']['Enums']['enum_deliveries_mode'];
          request_id: string;
          status: Database['public']['Enums']['enum_deliveries_status'];
          tracking_delivered_at: string | null;
          tracking_failure_reason: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by_id?: string | null;
          details_confirmed_address_id: string;
          details_confirmed_time_slot_date?: string | null;
          details_confirmed_time_slot_time_slot_custom_time_end_time?: string | null;
          details_confirmed_time_slot_time_slot_custom_time_start_time?: string | null;
          details_confirmed_time_slot_time_slot_preset_slot?:
            | Database['public']['Enums']['enum_time_slot_preset']
            | null;
          details_confirmed_time_slot_time_slot_type?:
            | Database['public']['Enums']['enum_time_slot_type']
            | null;
          details_instructions?: string | null;
          donation_id: string;
          id?: string;
          mode: Database['public']['Enums']['enum_deliveries_mode'];
          request_id: string;
          status?: Database['public']['Enums']['enum_deliveries_status'];
          tracking_delivered_at?: string | null;
          tracking_failure_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by_id?: string | null;
          details_confirmed_address_id?: string;
          details_confirmed_time_slot_date?: string | null;
          details_confirmed_time_slot_time_slot_custom_time_end_time?: string | null;
          details_confirmed_time_slot_time_slot_custom_time_start_time?: string | null;
          details_confirmed_time_slot_time_slot_preset_slot?:
            | Database['public']['Enums']['enum_time_slot_preset']
            | null;
          details_confirmed_time_slot_time_slot_type?:
            | Database['public']['Enums']['enum_time_slot_type']
            | null;
          details_instructions?: string | null;
          donation_id?: string;
          id?: string;
          mode?: Database['public']['Enums']['enum_deliveries_mode'];
          request_id?: string;
          status?: Database['public']['Enums']['enum_deliveries_status'];
          tracking_delivered_at?: string | null;
          tracking_failure_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deliveries_created_by_id_users_id_fk';
            columns: ['created_by_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deliveries_details_confirmed_address_id_addresses_id_fk';
            columns: ['details_confirmed_address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deliveries_donation_id_donations_id_fk';
            columns: ['donation_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deliveries_request_id_requests_id_fk';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      deliveries_details_proposed_addresses: {
        Row: {
          _order: number;
          _parent_id: string;
          address_id: string | null;
          id: string;
          proposed_by: Database['public']['Enums']['enum_proposedBy'] | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          address_id?: string | null;
          id: string;
          proposed_by?: Database['public']['Enums']['enum_proposedBy'] | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          address_id?: string | null;
          id?: string;
          proposed_by?: Database['public']['Enums']['enum_proposedBy'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'deliveries_details_proposed_addresses_address_id_addresses_id_f';
            columns: ['address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deliveries_details_proposed_addresses_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'deliveries';
            referencedColumns: ['id'];
          },
        ];
      };
      deliveries_details_proposed_time_slots: {
        Row: {
          _order: number;
          _parent_id: string;
          date: string | null;
          id: string;
          proposed_by: Database['public']['Enums']['enum_proposedBy'] | null;
          time_slot_custom_time_end_time: string | null;
          time_slot_custom_time_start_time: string | null;
          time_slot_preset_slot: Database['public']['Enums']['enum_time_slot_preset'] | null;
          time_slot_type: Database['public']['Enums']['enum_time_slot_type'] | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          date?: string | null;
          id: string;
          proposed_by?: Database['public']['Enums']['enum_proposedBy'] | null;
          time_slot_custom_time_end_time?: string | null;
          time_slot_custom_time_start_time?: string | null;
          time_slot_preset_slot?: Database['public']['Enums']['enum_time_slot_preset'] | null;
          time_slot_type?: Database['public']['Enums']['enum_time_slot_type'] | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          date?: string | null;
          id?: string;
          proposed_by?: Database['public']['Enums']['enum_proposedBy'] | null;
          time_slot_custom_time_end_time?: string | null;
          time_slot_custom_time_start_time?: string | null;
          time_slot_preset_slot?: Database['public']['Enums']['enum_time_slot_preset'] | null;
          time_slot_type?: Database['public']['Enums']['enum_time_slot_type'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'deliveries_details_proposed_time_slots_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'deliveries';
            referencedColumns: ['id'];
          },
        ];
      };
      deliveries_tracking_tracking_history: {
        Row: {
          _order: number;
          _parent_id: string;
          id: string;
          notes: string | null;
          status: string | null;
          timestamp: string | null;
        };
        Insert: {
          _order: number;
          _parent_id: string;
          id: string;
          notes?: string | null;
          status?: string | null;
          timestamp?: string | null;
        };
        Update: {
          _order?: number;
          _parent_id?: string;
          id?: string;
          notes?: string | null;
          status?: string | null;
          timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'deliveries_tracking_tracking_history_parent_id_fk';
            columns: ['_parent_id'];
            isOneToOne: false;
            referencedRelation: 'deliveries';
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
          created_at: string;
          created_by_id: string | null;
          details_collection_mode: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes: string | null;
          details_storage_type: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id: string;
          id: string;
          remaining_volume: number | null;
          status: Database['public']['Enums']['enum_donations_status'];
          title: string | null;
          updated_at: string;
          volume: number | null;
        };
        Insert: {
          created_at?: string;
          created_by_id?: string | null;
          details_collection_mode: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes?: string | null;
          details_storage_type: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id: string;
          id?: string;
          remaining_volume?: number | null;
          status?: Database['public']['Enums']['enum_donations_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number | null;
        };
        Update: {
          created_at?: string;
          created_by_id?: string | null;
          details_collection_mode?: Database['public']['Enums']['enum_donations_details_collection_mode'];
          details_notes?: string | null;
          details_storage_type?: Database['public']['Enums']['enum_donations_details_storage_type'];
          donor_id?: string;
          id?: string;
          remaining_volume?: number | null;
          status?: Database['public']['Enums']['enum_donations_status'];
          title?: string | null;
          updated_at?: string;
          volume?: number | null;
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
          id: number;
          images_id: string | null;
          milk_bags_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          requests_id: string | null;
        };
        Insert: {
          delivery_preferences_id?: string | null;
          id?: number;
          images_id?: string | null;
          milk_bags_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          requests_id?: string | null;
        };
        Update: {
          delivery_preferences_id?: string | null;
          id?: number;
          images_id?: string | null;
          milk_bags_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          requests_id?: string | null;
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
            foreignKeyName: 'donations_rels_images_fk';
            columns: ['images_id'];
            isOneToOne: false;
            referencedRelation: 'images';
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
            foreignKeyName: 'donations_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_rels_requests_fk';
            columns: ['requests_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      hospitals: {
        Row: {
          avatar_id: string | null;
          created_at: string;
          description: string | null;
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
      milk_bags: {
        Row: {
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
      milk_banks: {
        Row: {
          avatar_id: string | null;
          created_at: string;
          description: string | null;
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
      notification_categories: {
        Row: {
          active: boolean | null;
          color: string | null;
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
          color?: string | null;
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
          color?: string | null;
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
          notification_type_id: string;
          priority: Database['public']['Enums']['enum_priority_level'] | null;
          read: boolean | null;
          read_at: string | null;
          recipient_id: string;
          related_data_action_label: string | null;
          related_data_action_url: string | null;
          title: string;
          updated_at: string;
          variables: Json | null;
        };
        Insert: {
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          message: string;
          notification_type_id: string;
          priority?: Database['public']['Enums']['enum_priority_level'] | null;
          read?: boolean | null;
          read_at?: string | null;
          recipient_id: string;
          related_data_action_label?: string | null;
          related_data_action_url?: string | null;
          title: string;
          updated_at?: string;
          variables?: Json | null;
        };
        Update: {
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          message?: string;
          notification_type_id?: string;
          priority?: Database['public']['Enums']['enum_priority_level'] | null;
          read?: boolean | null;
          read_at?: string | null;
          recipient_id?: string;
          related_data_action_label?: string | null;
          related_data_action_url?: string | null;
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
          deliveries_id: string | null;
          donations_id: string | null;
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
          requests_id: string | null;
        };
        Insert: {
          deliveries_id?: string | null;
          donations_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
          requests_id?: string | null;
        };
        Update: {
          deliveries_id?: string | null;
          donations_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
          requests_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_rels_deliveries_fk';
            columns: ['deliveries_id'];
            isOneToOne: false;
            referencedRelation: 'deliveries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_rels_donations_fk';
            columns: ['donations_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
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
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
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
          cities_municipalities_id: string | null;
          deliveries_id: string | null;
          delivery_preferences_id: string | null;
          donations_id: string | null;
          hospitals_id: string | null;
          id: number;
          images_id: string | null;
          individuals_id: string | null;
          island_groups_id: string | null;
          milk_bags_id: string | null;
          milk_banks_id: string | null;
          notification_categories_id: string | null;
          notification_channels_id: string | null;
          notification_types_id: string | null;
          notifications_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          provinces_id: string | null;
          regions_id: string | null;
          requests_id: string | null;
          users_id: string | null;
        };
        Insert: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          cities_municipalities_id?: string | null;
          deliveries_id?: string | null;
          delivery_preferences_id?: string | null;
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          island_groups_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          notification_categories_id?: string | null;
          notification_channels_id?: string | null;
          notification_types_id?: string | null;
          notifications_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          provinces_id?: string | null;
          regions_id?: string | null;
          requests_id?: string | null;
          users_id?: string | null;
        };
        Update: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          cities_municipalities_id?: string | null;
          deliveries_id?: string | null;
          delivery_preferences_id?: string | null;
          donations_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          island_groups_id?: string | null;
          milk_bags_id?: string | null;
          milk_banks_id?: string | null;
          notification_categories_id?: string | null;
          notification_channels_id?: string | null;
          notification_types_id?: string | null;
          notifications_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          provinces_id?: string | null;
          regions_id?: string | null;
          requests_id?: string | null;
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
            foreignKeyName: 'payload_locked_documents_rels_cities_municipalities_fk';
            columns: ['cities_municipalities_id'];
            isOneToOne: false;
            referencedRelation: 'cities_municipalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_deliveries_fk';
            columns: ['deliveries_id'];
            isOneToOne: false;
            referencedRelation: 'deliveries';
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
            foreignKeyName: 'payload_locked_documents_rels_hospitals_fk';
            columns: ['hospitals_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
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
            foreignKeyName: 'payload_locked_documents_rels_island_groups_fk';
            columns: ['island_groups_id'];
            isOneToOne: false;
            referencedRelation: 'island_groups';
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
            referencedRelation: 'requests';
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
          id: string;
          matched_at: string | null;
          matched_donation_id: string | null;
          requested_donor_id: string | null;
          requester_id: string;
          status: Database['public']['Enums']['enum_requests_status'];
          title: string | null;
          updated_at: string;
          volume_needed: number;
        };
        Insert: {
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
          id?: string;
          matched_at?: string | null;
          matched_donation_id?: string | null;
          requested_donor_id?: string | null;
          requester_id: string;
          status?: Database['public']['Enums']['enum_requests_status'];
          title?: string | null;
          updated_at?: string;
          volume_needed: number;
        };
        Update: {
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
          id?: string;
          matched_at?: string | null;
          matched_donation_id?: string | null;
          requested_donor_id?: string | null;
          requester_id?: string;
          status?: Database['public']['Enums']['enum_requests_status'];
          title?: string | null;
          updated_at?: string;
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
            foreignKeyName: 'requests_matched_donation_id_donations_id_fk';
            columns: ['matched_donation_id'];
            isOneToOne: false;
            referencedRelation: 'donations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_requested_donor_id_individuals_id_fk';
            columns: ['requested_donor_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
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
          id: number;
          milk_bags_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          delivery_preferences_id?: string | null;
          id?: number;
          milk_bags_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          delivery_preferences_id?: string | null;
          id?: number;
          milk_bags_id?: string | null;
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
            foreignKeyName: 'requests_rels_milk_bags_fk';
            columns: ['milk_bags_id'];
            isOneToOne: false;
            referencedRelation: 'milk_bags';
            referencedColumns: ['id'];
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
      users: {
        Row: {
          auth_id: string | null;
          created_at: string;
          email: string;
          email_confirmed_at: string | null;
          id: string;
          last_sign_in_at: string | null;
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
          f_geography_column: unknown | null;
          f_table_catalog: unknown | null;
          f_table_name: unknown | null;
          f_table_schema: unknown | null;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown | null;
          f_table_catalog: string | null;
          f_table_name: unknown | null;
          f_table_schema: unknown | null;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown | null;
          f_table_catalog?: string | null;
          f_table_name?: unknown | null;
          f_table_schema?: unknown | null;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown | null;
          f_table_catalog?: string | null;
          f_table_name?: unknown | null;
          f_table_schema?: unknown | null;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string };
        Returns: unknown;
      };
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string };
        Returns: number;
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_bestsrid: {
        Args: { '': unknown };
        Returns: number;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_covers: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
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
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
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
      _st_pointoutside: {
        Args: { '': unknown };
        Returns: unknown;
      };
      _st_sortablehash: {
        Args: { geom: unknown };
        Returns: number;
      };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          g1: unknown;
          clip?: unknown;
          tolerance?: number;
          return_polygons?: boolean;
        };
        Returns: unknown;
      };
      _st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      addauth: {
        Args: { '': string };
        Returns: boolean;
      };
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string;
              schema_name: string;
              table_name: string;
              column_name: string;
              new_srid_in: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            }
          | {
              schema_name: string;
              table_name: string;
              column_name: string;
              new_srid: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            }
          | {
              table_name: string;
              column_name: string;
              new_srid: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            };
        Returns: string;
      };
      box: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box2d: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box2d_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2d_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2df_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2df_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3d: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box3d_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3d_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3dtobox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      bytea: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      disablelongtransactions: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string;
              schema_name: string;
              table_name: string;
              column_name: string;
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string };
        Returns: string;
      };
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string };
        Returns: string;
      };
      enablelongtransactions: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geography: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      geography_analyze: {
        Args: { '': unknown };
        Returns: boolean;
      };
      geography_gist_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_gist_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_send: {
        Args: { '': unknown };
        Returns: string;
      };
      geography_spgist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      geography_typmod_out: {
        Args: { '': number };
        Returns: unknown;
      };
      geometry: {
        Args:
          | { '': string }
          | { '': string }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown };
        Returns: unknown;
      };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_analyze: {
        Args: { '': unknown };
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
      geometry_gist_compress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_decompress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_decompress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_sortsupport_2d: {
        Args: { '': unknown };
        Returns: undefined;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_hash: {
        Args: { '': unknown };
        Returns: number;
      };
      geometry_in: {
        Args: { '': unknown };
        Returns: unknown;
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
      geometry_out: {
        Args: { '': unknown };
        Returns: unknown;
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
      geometry_recv: {
        Args: { '': unknown };
        Returns: unknown;
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
      geometry_send: {
        Args: { '': unknown };
        Returns: string;
      };
      geometry_sortsupport: {
        Args: { '': unknown };
        Returns: undefined;
      };
      geometry_spgist_compress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_spgist_compress_3d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_spgist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      geometry_typmod_out: {
        Args: { '': number };
        Returns: unknown;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometrytype: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      geomfromewkb: {
        Args: { '': string };
        Returns: unknown;
      };
      geomfromewkt: {
        Args: { '': string };
        Returns: unknown;
      };
      get_proj4_from_srid: {
        Args: { '': number };
        Returns: string;
      };
      gettransactionid: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      gidx_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gidx_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      json: {
        Args: { '': unknown };
        Returns: Json;
      };
      jsonb: {
        Args: { '': unknown };
        Returns: Json;
      };
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      path: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_asflatgeobuf_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asgeobuf_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asmvt_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asmvt_serialfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { '': unknown };
        Returns: unknown[];
      };
      pgis_geometry_clusterwithin_finalfn: {
        Args: { '': unknown };
        Returns: unknown[];
      };
      pgis_geometry_collect_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_makeline_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_polygonize_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_union_parallel_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_union_parallel_serialfn: {
        Args: { '': unknown };
        Returns: string;
      };
      point: {
        Args: { '': unknown };
        Returns: unknown;
      };
      polygon: {
        Args: { '': unknown };
        Returns: unknown;
      };
      populate_geometry_columns: {
        Args: { tbl_oid: unknown; use_typmod?: boolean } | { use_typmod?: boolean };
        Returns: string;
      };
      postgis_addbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: string;
      };
      postgis_dropbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_full_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_geos_noop: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_geos_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_getbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_hasbbox: {
        Args: { '': unknown };
        Returns: boolean;
      };
      postgis_index_supportfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_lib_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_noop: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_proj_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_svn_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_type_name: {
        Args: {
          geomname: string;
          coord_dimension: number;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_typmod_dims: {
        Args: { '': number };
        Returns: number;
      };
      postgis_typmod_srid: {
        Args: { '': number };
        Returns: number;
      };
      postgis_typmod_type: {
        Args: { '': number };
        Returns: string;
      };
      postgis_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      spheroid_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      spheroid_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
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
      st_3dlength: {
        Args: { '': unknown };
        Returns: number;
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
      st_3dperimeter: {
        Args: { '': unknown };
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
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
        Returns: number;
      };
      st_area: {
        Args: { '': string } | { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_area2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_asbinary: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkb: {
        Args: { '': unknown };
        Returns: string;
      };
      st_asewkt: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_asgeojson: {
        Args:
          | { '': string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>;
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
            };
        Returns: string;
      };
      st_asgml: {
        Args:
          | { '': string }
          | {
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number;
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            }
          | {
              version: number;
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            };
        Returns: string;
      };
      st_ashexewkb: {
        Args: { '': unknown };
        Returns: string;
      };
      st_askml: {
        Args:
          | { '': string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string };
        Returns: string;
      };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: {
        Args: { geom: unknown; format?: string };
        Returns: string;
      };
      st_asmvtgeom: {
        Args: {
          geom: unknown;
          bounds: unknown;
          extent?: number;
          buffer?: number;
          clip_geom?: boolean;
        };
        Returns: unknown;
      };
      st_assvg: {
        Args:
          | { '': string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number };
        Returns: string;
      };
      st_astext: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_astwkb: {
        Args:
          | {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_z?: number;
              prec_m?: number;
              with_sizes?: boolean;
              with_boxes?: boolean;
            }
          | {
              geom: unknown;
              prec?: number;
              prec_z?: number;
              prec_m?: number;
              with_sizes?: boolean;
              with_boxes?: boolean;
            };
        Returns: string;
      };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_boundary: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean };
        Returns: unknown;
      };
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number };
        Returns: unknown;
      };
      st_buildarea: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_centroid: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      st_cleangeometry: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_clusterintersecting: {
        Args: { '': unknown[] };
        Returns: unknown[];
      };
      st_collect: {
        Args: { '': unknown[] } | { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collectionextract: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_collectionhomogenize: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_concavehull: {
        Args: {
          param_geom: unknown;
          param_pctconvex: number;
          param_allow_holes?: boolean;
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
      st_convexhull: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_coorddim: {
        Args: { geometry: unknown };
        Returns: number;
      };
      st_coveredby: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_covers: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_dimension: {
        Args: { '': unknown };
        Returns: number;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number };
        Returns: number;
      };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dump: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumppoints: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumprings: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumpsegments: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
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
      st_endpoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_envelope: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number };
        Returns: unknown;
      };
      st_exteriorring: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_flipcoordinates: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_force2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_force3d: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number };
        Returns: unknown;
      };
      st_forcecollection: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcecurve: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcepolygonccw: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcepolygoncw: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcerhr: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcesfs: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_generatepoints: {
        Args: { area: unknown; npoints: number } | { area: unknown; npoints: number; seed: number };
        Returns: unknown;
      };
      st_geogfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geogfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geographyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geohash: {
        Args: { geog: unknown; maxchars?: number } | { geom: unknown; maxchars?: number };
        Returns: string;
      };
      st_geomcollfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomcollfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geometricmedian: {
        Args: {
          g: unknown;
          tolerance?: number;
          max_iter?: number;
          fail_if_not_converged?: boolean;
        };
        Returns: unknown;
      };
      st_geometryfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geometrytype: {
        Args: { '': unknown };
        Returns: string;
      };
      st_geomfromewkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromewkt: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromgeojson: {
        Args: { '': Json } | { '': Json } | { '': string };
        Returns: unknown;
      };
      st_geomfromgml: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromkml: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfrommarc21: {
        Args: { marc21xml: string };
        Returns: unknown;
      };
      st_geomfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromtwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_gmltosql: {
        Args: { '': string };
        Returns: unknown;
      };
      st_hasarc: {
        Args: { geometry: unknown };
        Returns: boolean;
      };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { size: number; bounds: unknown };
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
      st_intersects: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_isclosed: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_iscollection: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isempty: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_ispolygonccw: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_ispolygoncw: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isring: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_issimple: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isvalid: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number };
        Returns: Database['public']['CompositeTypes']['valid_detail'];
      };
      st_isvalidreason: {
        Args: { '': unknown };
        Returns: string;
      };
      st_isvalidtrajectory: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_length: {
        Args: { '': string } | { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_length2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_letters: {
        Args: { letters: string; font?: Json };
        Returns: unknown;
      };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number };
        Returns: unknown;
      };
      st_linefrommultipoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_linefromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linemerge: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_linestringfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linetocurve: {
        Args: { geometry: unknown };
        Returns: unknown;
      };
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          geometry: unknown;
          frommeasure: number;
          tomeasure: number;
          leftrightoffset?: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_m: {
        Args: { '': unknown };
        Returns: number;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { '': unknown[] } | { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makepolygon: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { '': unknown } | { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_maximuminscribedcircle: {
        Args: { '': unknown };
        Returns: Record<string, unknown>;
      };
      st_memsize: {
        Args: { '': unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_minimumboundingradius: {
        Args: { '': unknown };
        Returns: Record<string, unknown>;
      };
      st_minimumclearance: {
        Args: { '': unknown };
        Returns: number;
      };
      st_minimumclearanceline: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_mlinefromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mlinefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpolyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpolyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multi: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_multilinefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multilinestringfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipolyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipolygonfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_ndims: {
        Args: { '': unknown };
        Returns: number;
      };
      st_node: {
        Args: { g: unknown };
        Returns: unknown;
      };
      st_normalize: {
        Args: { geom: unknown };
        Returns: unknown;
      };
      st_npoints: {
        Args: { '': unknown };
        Returns: number;
      };
      st_nrings: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numgeometries: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numinteriorring: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numinteriorrings: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numpatches: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numpoints: {
        Args: { '': unknown };
        Returns: number;
      };
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_orientedenvelope: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_perimeter2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_pointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_pointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_pointm: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          mcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_pointonsurface: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_points: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
          mcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonize: {
        Args: { '': unknown[] };
        Returns: unknown;
      };
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
          prec_m?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: string;
      };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_reverse: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number };
        Returns: unknown;
      };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shiftlongitude: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean };
        Returns: unknown;
      };
      st_split: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { size: number; bounds: unknown };
        Returns: Record<string, unknown>[];
      };
      st_srid: {
        Args: { geog: unknown } | { geom: unknown };
        Returns: number;
      };
      st_startpoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number };
        Returns: unknown[];
      };
      st_summary: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
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
          zoom: number;
          x: number;
          y: number;
          bounds?: unknown;
          margin?: number;
        };
        Returns: unknown;
      };
      st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string };
        Returns: unknown;
      };
      st_triangulatepolygon: {
        Args: { g1: unknown };
        Returns: unknown;
      };
      st_union: {
        Args:
          | { '': unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number };
        Returns: unknown;
      };
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown };
        Returns: unknown;
      };
      st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_wkbtosql: {
        Args: { wkb: string };
        Returns: unknown;
      };
      st_wkttosql: {
        Args: { '': string };
        Returns: unknown;
      };
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number };
        Returns: unknown;
      };
      st_x: {
        Args: { '': unknown };
        Returns: number;
      };
      st_xmax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_xmin: {
        Args: { '': unknown };
        Returns: number;
      };
      st_y: {
        Args: { '': unknown };
        Returns: number;
      };
      st_ymax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_ymin: {
        Args: { '': unknown };
        Returns: number;
      };
      st_z: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmflag: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmin: {
        Args: { '': unknown };
        Returns: number;
      };
      text: {
        Args: { '': unknown };
        Returns: string;
      };
      unlockrows: {
        Args: { '': string };
        Returns: number;
      };
      update_milk_bag_status: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          schema_name: string;
          table_name: string;
          column_name: string;
          new_srid_in: number;
        };
        Returns: string;
      };
    };
    Enums: {
      enum_cities_municipalities_type: 'NONE' | 'CITY' | 'MUNICIPALITY';
      enum_days: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
      enum_deliveries_mode: 'PICKUP' | 'DELIVERY' | 'MEETUP';
      enum_deliveries_status:
        | 'PENDING'
        | 'PENDING_CONFIRMATION'
        | 'CONFIRMED'
        | 'SCHEDULED'
        | 'IN_TRANSIT'
        | 'READY_FOR_PICKUP'
        | 'DELIVERED'
        | 'FAILED'
        | 'CANCELLED';
      enum_delivery_modes: 'PICKUP' | 'DELIVERY' | 'MEETUP';
      enum_donations_details_collection_mode: 'MANUAL' | 'MANUAL_PUMP' | 'ELECTRIC_PUMP';
      enum_donations_details_storage_type: 'FRESH' | 'FROZEN';
      enum_donations_status:
        | 'AVAILABLE'
        | 'PARTIALLY_ALLOCATED'
        | 'FULLY_ALLOCATED'
        | 'COMPLETED'
        | 'EXPIRED'
        | 'CANCELLED';
      enum_hospitals_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_individuals_gender: 'MALE' | 'FEMALE' | 'OTHER';
      enum_individuals_marital_status:
        | 'SINGLE'
        | 'MARRIED'
        | 'SEPARATED'
        | 'WIDOWED'
        | 'DIVORCED'
        | 'N/A';
      enum_js_types: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
      enum_milk_bag_status: 'AVAILABLE' | 'ALLOCATED' | 'EXPIRED' | 'DISCARDED';
      enum_milk_banks_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_notification_channel_type:
        | 'IN_APP'
        | 'EMAIL'
        | 'SMS'
        | 'PUSH'
        | 'WEBHOOK'
        | 'EXTERNAL_API';
      enum_notification_retry_strategy: 'FIXED' | 'EXPONENTIAL' | 'LINEAR';
      enum_notification_trigger_collection: 'requests' | 'donations' | 'deliveries' | 'system';
      enum_notification_trigger_event: 'CREATE' | 'UPDATE' | 'DELETE';
      enum_priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      enum_proposedBy: 'DONOR' | 'REQUESTER';
      enum_requests_details_storage_preference: 'FRESH' | 'FROZEN' | 'EITHER';
      enum_requests_status: 'PENDING' | 'MATCHED' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
      enum_time_slot_preset:
        | '08:00-10:00'
        | '10:00-12:00'
        | '12:00-14:00'
        | '14:00-16:00'
        | '16:00-18:00'
        | '18:00-20:00';
      enum_time_slot_type: 'CUSTOM' | 'PRESET';
      enum_users_profile_type: 'INDIVIDUAL' | 'HOSPITAL' | 'MILK_BANK';
      enum_users_role: 'AUTHENTICATED' | 'ADMIN';
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown | null;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown | null;
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
      enum_cities_municipalities_type: ['NONE', 'CITY', 'MUNICIPALITY'],
      enum_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      enum_deliveries_mode: ['PICKUP', 'DELIVERY', 'MEETUP'],
      enum_deliveries_status: [
        'PENDING',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'SCHEDULED',
        'IN_TRANSIT',
        'READY_FOR_PICKUP',
        'DELIVERED',
        'FAILED',
        'CANCELLED',
      ],
      enum_delivery_modes: ['PICKUP', 'DELIVERY', 'MEETUP'],
      enum_donations_details_collection_mode: ['MANUAL', 'MANUAL_PUMP', 'ELECTRIC_PUMP'],
      enum_donations_details_storage_type: ['FRESH', 'FROZEN'],
      enum_donations_status: [
        'AVAILABLE',
        'PARTIALLY_ALLOCATED',
        'FULLY_ALLOCATED',
        'COMPLETED',
        'EXPIRED',
        'CANCELLED',
      ],
      enum_hospitals_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_individuals_gender: ['MALE', 'FEMALE', 'OTHER'],
      enum_individuals_marital_status: [
        'SINGLE',
        'MARRIED',
        'SEPARATED',
        'WIDOWED',
        'DIVORCED',
        'N/A',
      ],
      enum_js_types: ['string', 'number', 'boolean', 'date', 'array', 'object'],
      enum_milk_bag_status: ['AVAILABLE', 'ALLOCATED', 'EXPIRED', 'DISCARDED'],
      enum_milk_banks_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_notification_channel_type: ['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'EXTERNAL_API'],
      enum_notification_retry_strategy: ['FIXED', 'EXPONENTIAL', 'LINEAR'],
      enum_notification_trigger_collection: ['requests', 'donations', 'deliveries', 'system'],
      enum_notification_trigger_event: ['CREATE', 'UPDATE', 'DELETE'],
      enum_priority_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      enum_proposedBy: ['DONOR', 'REQUESTER'],
      enum_requests_details_storage_preference: ['FRESH', 'FROZEN', 'EITHER'],
      enum_requests_status: ['PENDING', 'MATCHED', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
      enum_time_slot_preset: [
        '08:00-10:00',
        '10:00-12:00',
        '12:00-14:00',
        '14:00-16:00',
        '16:00-18:00',
        '18:00-20:00',
      ],
      enum_time_slot_type: ['CUSTOM', 'PRESET'],
      enum_users_profile_type: ['INDIVIDUAL', 'HOSPITAL', 'MILK_BANK'],
      enum_users_role: ['AUTHENTICATED', 'ADMIN'],
    },
  },
} as const;
