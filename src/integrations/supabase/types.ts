export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          budget_id: number
          created_at: string | null
          id: number
          transaction_id: number
          updated_at: string | null
        }
        Insert: {
          budget_id: number
          created_at?: string | null
          id?: number
          transaction_id: number
          updated_at?: string | null
        }
        Update: {
          budget_id?: number
          created_at?: string | null
          id?: number
          transaction_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_associations"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "budget_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          created_at: string | null
          currency_code: string
          end_date: string
          id: number
          name: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency_code: string
          end_date: string
          id?: number
          name: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency_code?: string
          end_date?: string
          id?: number
          name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      business_project_transactions: {
        Row: {
          created_at: string | null
          id: number
          project_id: number
          transaction_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          project_id: number
          transaction_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          project_id?: number
          transaction_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_project_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_project_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_associations"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "business_project_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: number
          name: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          application:
            | Database["public"]["Enums"]["category_application"]
            | null
          created_at: string | null
          id: number
          is_income: boolean | null
          name: string
          parent_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application?:
            | Database["public"]["Enums"]["category_application"]
            | null
          created_at?: string | null
          id?: number
          is_income?: boolean | null
          name: string
          parent_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application?:
            | Database["public"]["Enums"]["category_application"]
            | null
          created_at?: string | null
          id?: number
          is_income?: boolean | null
          name?: string
          parent_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          is_default: boolean | null
          name: string
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          is_default?: boolean | null
          name: string
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          is_default?: boolean | null
          name?: string
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debt_histories: {
        Row: {
          amount: number
          category_id: number
          created_at: string | null
          date: string
          debt_id: number
          description: string | null
          id: number
          updated_at: string | null
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string | null
          date: string
          debt_id: number
          description?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string | null
          date?: string
          debt_id?: number
          description?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
          wallet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "debt_histories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_histories_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_histories_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string | null
          currency_code: string
          due_date: string | null
          id: number
          name: string
          status: Database["public"]["Enums"]["debt_statuses"]
          type: Database["public"]["Enums"]["debt_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code: string
          due_date?: string | null
          id?: number
          name: string
          status?: Database["public"]["Enums"]["debt_statuses"]
          type: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string
          due_date?: string | null
          id?: number
          name?: string
          status?: Database["public"]["Enums"]["debt_statuses"]
          type?: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      goal_investment_records: {
        Row: {
          amount: number
          amount_unit: number | null
          asset_id: number | null
          category_id: number | null
          created_at: string | null
          date: string
          description: string | null
          goal_id: number
          id: number
          instrument_id: number | null
          is_valuation: boolean | null
          updated_at: string | null
          user_id: string
          wallet_id: number | null
        }
        Insert: {
          amount: number
          amount_unit?: number | null
          asset_id?: number | null
          category_id?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          goal_id: number
          id?: number
          instrument_id?: number | null
          is_valuation?: boolean | null
          updated_at?: string | null
          user_id: string
          wallet_id?: number | null
        }
        Update: {
          amount?: number
          amount_unit?: number | null
          asset_id?: number | null
          category_id?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          goal_id?: number
          id?: number
          instrument_id?: number | null
          is_valuation?: boolean | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_investment_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "investment_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_investment_records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_investment_records_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_investment_records_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "investment_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_investment_records_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_transfers: {
        Row: {
          created_at: string | null
          date: string
          from_amount: number | null
          from_amount_unit: number | null
          from_asset_id: number | null
          from_goal_id: number | null
          from_instrument_id: number | null
          from_wallet_id: number | null
          id: number
          to_amount: number | null
          to_amount_unit: number | null
          to_asset_id: number | null
          to_goal_id: number | null
          to_instrument_id: number | null
          to_wallet_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          from_amount?: number | null
          from_amount_unit?: number | null
          from_asset_id?: number | null
          from_goal_id?: number | null
          from_instrument_id?: number | null
          from_wallet_id?: number | null
          id?: number
          to_amount?: number | null
          to_amount_unit?: number | null
          to_asset_id?: number | null
          to_goal_id?: number | null
          to_instrument_id?: number | null
          to_wallet_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          from_amount?: number | null
          from_amount_unit?: number | null
          from_asset_id?: number | null
          from_goal_id?: number | null
          from_instrument_id?: number | null
          from_wallet_id?: number | null
          id?: number
          to_amount?: number | null
          to_amount_unit?: number | null
          to_asset_id?: number | null
          to_goal_id?: number | null
          to_instrument_id?: number | null
          to_wallet_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_transfers_from_asset_id_fkey"
            columns: ["from_asset_id"]
            isOneToOne: false
            referencedRelation: "investment_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_from_goal_id_fkey"
            columns: ["from_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_from_instrument_id_fkey"
            columns: ["from_instrument_id"]
            isOneToOne: false
            referencedRelation: "investment_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_to_asset_id_fkey"
            columns: ["to_asset_id"]
            isOneToOne: false
            referencedRelation: "investment_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_to_goal_id_fkey"
            columns: ["to_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_to_instrument_id_fkey"
            columns: ["to_instrument_id"]
            isOneToOne: false
            referencedRelation: "investment_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transfers_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          currency_code: string
          id: number
          is_achieved: boolean | null
          is_active: boolean | null
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code: string
          id?: number
          is_achieved?: boolean | null
          is_active?: boolean | null
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string
          id?: number
          is_achieved?: boolean | null
          is_active?: boolean | null
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      investment_asset_values: {
        Row: {
          asset_id: number
          created_at: string | null
          date: string
          id: number
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          date: string
          id?: number
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          date?: string
          id?: number
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_investment_asset_values_asset"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "investment_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_assets: {
        Row: {
          created_at: string | null
          id: number
          instrument_id: number
          name: string
          symbol: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          instrument_id: number
          name: string
          symbol?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          instrument_id?: number
          name?: string
          symbol?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_assets_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "investment_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_instruments: {
        Row: {
          created_at: string | null
          id: number
          is_trackable: boolean | null
          name: string
          unit_label: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_trackable?: boolean | null
          name: string
          unit_label?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_trackable?: boolean | null
          name?: string
          unit_label?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: number
          created_at: string | null
          date: string
          description: string | null
          id: number
          updated_at: string | null
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          updated_at?: string | null
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
          wallet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string | null
          date: string
          from_amount: number
          from_wallet_id: number
          id: number
          to_amount: number
          to_wallet_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          from_amount: number
          from_wallet_id: number
          id?: number
          to_amount: number
          to_wallet_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          from_amount?: number
          from_wallet_id?: number
          id?: number
          to_amount?: number
          to_wallet_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string | null
          currency_code: string
          id: number
          initial_amount: number | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code: string
          id?: number
          initial_amount?: number | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string
          id?: number
          initial_amount?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      debt_summary: {
        Row: {
          user_id: string | null
          debt_id: number | null
          debt_name: string | null
          income_amount: number | null
          outcome_amount: number | null
          currency_code: string | null
          income_amount_in_base_currency: number | null
          outcome_amount_in_base_currency: number | null
          base_currency_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "debts_base_currency_code_fkey"
            columns: ["base_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      budget_item_with_transactions: {
        Row: {
          user_id: string | null
          id: number | null
          budget_id: number | null
          transaction_id: number | null
          wallet_id: number | null
          wallet_name: string | null
          category_id: number | null
          category_name: string | null
          description: string | null
          amount: number | null
          original_currency_code: string | null
          date: string | null
          base_currency_code: string | null
          exchange_rate: number | null
        }
      }
      budget_summary: {
        Row: {
          user_id: string | null
          budget_id: number | null
          name: string | null
          budget_amount: number | null
          start_date: string | null
          end_date: string | null
          amount: number | null
          original_currency_code: string | null
          amount_in_base_currency: number | null
          base_currency_code: string | null
        }
      }
      money_summary: {
        Row: {
          wallet_id: number | null
          wallet_name: string | null
          goal_id: number | null
          goal_name: string | null
          instrument_id: number | null
          instrument_name: string | null
          asset_id: number | null
          asset_name: string | null
          asset_symbol: string | null
          original_currency_code: string | null
          amount: number | null
          base_currency_code: string | null
          latest_rate: number | null
          latest_rate_date: string | null
          amount_unit: number | null
          latest_asset_value: number | null
          latest_asset_value_date: string | null
          user_id: string | null
          unit_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_currency_code_fkey"
            columns: ["original_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "wallets_base_currency_code_fkey"
            columns: ["base_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      money_movements: {
        Row: {
          amount: number | null
          amount_unit: number | null
          asset_id: number | null
          asset_name: string | null
          asset_symbol: string | null
          category_id: number | null
          category_name: string | null
          created_at: string | null
          currency_code: string | null
          date: string | null
          description: string | null
          goal_id: number | null
          goal_name: string | null
          id: number | null
          instrument_id: number | null
          instrument_name: string | null
          opposite_asset_id: number | null
          opposite_asset_name: string | null
          opposite_asset_symbol: string | null
          opposite_goal_id: number | null
          opposite_goal_name: string | null
          opposite_instrument_id: number | null
          opposite_instrument_name: string | null
          opposite_wallet_id: number | null
          opposite_wallet_name: string | null
          resource_id: number | null
          resource_type: string | null
          unit_label: string | null
          user_id: string | null
          wallet_id: number | null
          wallet_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      transaction_associations: {
        Row: {
          budgets: Json | null
          business_projects: Json | null
          transaction_id: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      initialize_missing_user_data: {
        Args: { user_uuid?: string }
        Returns: undefined
      }
      insert_transaction_with_relations: {
        Args: {
          _amount: number
          _budget_ids?: number[]
          _category_id: number
          _description: string
          _project_ids?: number[]
          _trx_date: string
          _user_id: string
          _wallet_id: number
        }
        Returns: undefined
      }
      update_transaction_with_relations: {
        Args: {
          _amount: number
          _budget_ids?: number[]
          _category_id: number
          _description: string
          _project_ids?: number[]
          _transaction_id: number
          _trx_date: string
          _user_id: string
          _wallet_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      category_application: "transaction" | "investment" | "debt"
      debt_statuses: "active" | "paid_off"
      debt_type: "loan" | "borrowed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      category_application: ["transaction", "investment", "debt"],
      debt_statuses: ["active", "paid_off"],
      debt_type: ["loan", "borrowed"],
    },
  },
} as const
