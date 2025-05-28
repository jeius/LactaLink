export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
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
          created_at: string;
          default: boolean | null;
          display_name: string | null;
          id: string;
          island_group_id: string | null;
          name: string | null;
          owner_id: string | null;
          province_id: string;
          region_id: string | null;
          street: string | null;
          updated_at: string;
        };
        Insert: {
          barangay_id?: string | null;
          city_municipality_id: string;
          created_at?: string;
          default?: boolean | null;
          display_name?: string | null;
          id?: string;
          island_group_id?: string | null;
          name?: string | null;
          owner_id?: string | null;
          province_id: string;
          region_id?: string | null;
          street?: string | null;
          updated_at?: string;
        };
        Update: {
          barangay_id?: string | null;
          city_municipality_id?: string;
          created_at?: string;
          default?: boolean | null;
          display_name?: string | null;
          id?: string;
          island_group_id?: string | null;
          name?: string | null;
          owner_id?: string | null;
          province_id?: string;
          region_id?: string | null;
          street?: string | null;
          updated_at?: string;
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
          city_municipality_id: string;
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
          city_municipality_id: string;
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
          city_municipality_id?: string;
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
      hospitals_rels: {
        Row: {
          addresses_id: string | null;
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hospitals_rels_addresses_fk';
            columns: ['addresses_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hospitals_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'hospitals';
            referencedColumns: ['id'];
          },
        ];
      };
      images: {
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
          sizes_large_filename: string | null;
          sizes_large_filesize: number | null;
          sizes_large_height: number | null;
          sizes_large_mime_type: string | null;
          sizes_large_url: string | null;
          sizes_large_width: number | null;
          sizes_medium_filename: string | null;
          sizes_medium_filesize: number | null;
          sizes_medium_height: number | null;
          sizes_medium_mime_type: string | null;
          sizes_medium_url: string | null;
          sizes_medium_width: number | null;
          sizes_og_filename: string | null;
          sizes_og_filesize: number | null;
          sizes_og_height: number | null;
          sizes_og_mime_type: string | null;
          sizes_og_url: string | null;
          sizes_og_width: number | null;
          sizes_small_filename: string | null;
          sizes_small_filesize: number | null;
          sizes_small_height: number | null;
          sizes_small_mime_type: string | null;
          sizes_small_url: string | null;
          sizes_small_width: number | null;
          sizes_square_filename: string | null;
          sizes_square_filesize: number | null;
          sizes_square_height: number | null;
          sizes_square_mime_type: string | null;
          sizes_square_url: string | null;
          sizes_square_width: number | null;
          sizes_thumbnail_filename: string | null;
          sizes_thumbnail_filesize: number | null;
          sizes_thumbnail_height: number | null;
          sizes_thumbnail_mime_type: string | null;
          sizes_thumbnail_url: string | null;
          sizes_thumbnail_width: number | null;
          sizes_xlarge_filename: string | null;
          sizes_xlarge_filesize: number | null;
          sizes_xlarge_height: number | null;
          sizes_xlarge_mime_type: string | null;
          sizes_xlarge_url: string | null;
          sizes_xlarge_width: number | null;
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
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_medium_filename?: string | null;
          sizes_medium_filesize?: number | null;
          sizes_medium_height?: number | null;
          sizes_medium_mime_type?: string | null;
          sizes_medium_url?: string | null;
          sizes_medium_width?: number | null;
          sizes_og_filename?: string | null;
          sizes_og_filesize?: number | null;
          sizes_og_height?: number | null;
          sizes_og_mime_type?: string | null;
          sizes_og_url?: string | null;
          sizes_og_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_square_filename?: string | null;
          sizes_square_filesize?: number | null;
          sizes_square_height?: number | null;
          sizes_square_mime_type?: string | null;
          sizes_square_url?: string | null;
          sizes_square_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          sizes_xlarge_filename?: string | null;
          sizes_xlarge_filesize?: number | null;
          sizes_xlarge_height?: number | null;
          sizes_xlarge_mime_type?: string | null;
          sizes_xlarge_url?: string | null;
          sizes_xlarge_width?: number | null;
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
          sizes_large_filename?: string | null;
          sizes_large_filesize?: number | null;
          sizes_large_height?: number | null;
          sizes_large_mime_type?: string | null;
          sizes_large_url?: string | null;
          sizes_large_width?: number | null;
          sizes_medium_filename?: string | null;
          sizes_medium_filesize?: number | null;
          sizes_medium_height?: number | null;
          sizes_medium_mime_type?: string | null;
          sizes_medium_url?: string | null;
          sizes_medium_width?: number | null;
          sizes_og_filename?: string | null;
          sizes_og_filesize?: number | null;
          sizes_og_height?: number | null;
          sizes_og_mime_type?: string | null;
          sizes_og_url?: string | null;
          sizes_og_width?: number | null;
          sizes_small_filename?: string | null;
          sizes_small_filesize?: number | null;
          sizes_small_height?: number | null;
          sizes_small_mime_type?: string | null;
          sizes_small_url?: string | null;
          sizes_small_width?: number | null;
          sizes_square_filename?: string | null;
          sizes_square_filesize?: number | null;
          sizes_square_height?: number | null;
          sizes_square_mime_type?: string | null;
          sizes_square_url?: string | null;
          sizes_square_width?: number | null;
          sizes_thumbnail_filename?: string | null;
          sizes_thumbnail_filesize?: number | null;
          sizes_thumbnail_height?: number | null;
          sizes_thumbnail_mime_type?: string | null;
          sizes_thumbnail_url?: string | null;
          sizes_thumbnail_width?: number | null;
          sizes_xlarge_filename?: string | null;
          sizes_xlarge_filesize?: number | null;
          sizes_xlarge_height?: number | null;
          sizes_xlarge_mime_type?: string | null;
          sizes_xlarge_url?: string | null;
          sizes_xlarge_width?: number | null;
          thumbnail_u_r_l?: string | null;
          updated_at?: string;
          url?: string | null;
          width?: number | null;
        };
        Relationships: [];
      };
      images_rels: {
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
            foreignKeyName: 'images_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_rels_users_fk';
            columns: ['users_id'];
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
      individuals_rels: {
        Row: {
          addresses_id: string | null;
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'individuals_rels_addresses_fk';
            columns: ['addresses_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'individuals_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'individuals';
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
      milk_banks_rels: {
        Row: {
          addresses_id: string | null;
          id: number;
          order: number | null;
          parent_id: string;
          path: string;
        };
        Insert: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id: string;
          path: string;
        };
        Update: {
          addresses_id?: string | null;
          id?: number;
          order?: number | null;
          parent_id?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milk_banks_rels_addresses_fk';
            columns: ['addresses_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'milk_banks_rels_parent_fk';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
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
          hospitals_id: string | null;
          id: number;
          images_id: string | null;
          individuals_id: string | null;
          island_groups_id: string | null;
          milk_banks_id: string | null;
          order: number | null;
          parent_id: string;
          path: string;
          provinces_id: string | null;
          regions_id: string | null;
          users_id: string | null;
        };
        Insert: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          cities_municipalities_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          island_groups_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id: string;
          path: string;
          provinces_id?: string | null;
          regions_id?: string | null;
          users_id?: string | null;
        };
        Update: {
          addresses_id?: string | null;
          avatars_id?: string | null;
          barangays_id?: string | null;
          cities_municipalities_id?: string | null;
          hospitals_id?: string | null;
          id?: number;
          images_id?: string | null;
          individuals_id?: string | null;
          island_groups_id?: string | null;
          milk_banks_id?: string | null;
          order?: number | null;
          parent_id?: string;
          path?: string;
          provinces_id?: string | null;
          regions_id?: string | null;
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
            foreignKeyName: 'payload_locked_documents_rels_milk_banks_fk';
            columns: ['milk_banks_id'];
            isOneToOne: false;
            referencedRelation: 'milk_banks';
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
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      enum_cities_municipalities_type: 'NONE' | 'CITY' | 'MUNICIPALITY';
      enum_hospitals_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_individuals_gender: 'MALE' | 'FEMALE' | 'OTHER';
      enum_individuals_marital_status:
        | 'SINGLE'
        | 'MARRIED'
        | 'WIDOWED'
        | 'DIVORCED'
        | 'SEPARATED'
        | 'N/A';
      enum_milk_banks_type: 'GOVERNMENT' | 'PRIVATE' | 'OTHER';
      enum_users_profile_type: 'INDIVIDUAL' | 'HOSPITAL' | 'MILK_BANK';
      enum_users_role: 'AUTHENTICATED' | 'ADMIN';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
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
      enum_hospitals_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_individuals_gender: ['MALE', 'FEMALE', 'OTHER'],
      enum_individuals_marital_status: [
        'SINGLE',
        'MARRIED',
        'WIDOWED',
        'DIVORCED',
        'SEPARATED',
        'N/A',
      ],
      enum_milk_banks_type: ['GOVERNMENT', 'PRIVATE', 'OTHER'],
      enum_users_profile_type: ['INDIVIDUAL', 'HOSPITAL', 'MILK_BANK'],
      enum_users_role: ['AUTHENTICATED', 'ADMIN'],
    },
  },
} as const;
