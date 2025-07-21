export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          currency_code: string
          date: string
          debt_id: number
          description: string | null
          exchange_rate: number | null
          id: number
          updated_at: string | null
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string | null
          currency_code: string
          date: string
          debt_id: number
          description?: string | null
          exchange_rate?: number | null
          id?: number
          updated_at?: string | null
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          debt_id?: number
          description?: string | null
          exchange_rate?: number | null
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
            foreignKeyName: "debt_histories_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
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
          asset_id: number | null
          category_id: number | null
          created_at: string | null
          currency_code: string
          date: string
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
          asset_id?: number | null
          category_id?: number | null
          created_at?: string | null
          currency_code: string
          date: string
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
          asset_id?: number | null
          category_id?: number | null
          created_at?: string | null
          currency_code?: string
          date?: string
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
            foreignKeyName: "goal_investment_records_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
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
          from_amount: number | null
          to_amount: number | null
          created_at: string | null
          from_currency: string | null
          to_currency: string | null
          date: string
          from_asset_id: number | null
          from_goal_id: number | null
          from_instrument_id: number | null
          from_wallet_id: number | null
          id: number
          to_asset_id: number | null
          to_goal_id: number | null
          to_instrument_id: number | null
          to_wallet_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          from_amount?: number | null
          to_amount?: number | null
          created_at?: string | null
          from_currency?: string | null
          to_currency?: string | null
          date: string
          from_asset_id?: number | null
          from_goal_id?: number | null
          from_instrument_id?: number | null
          from_wallet_id?: number | null
          id?: number
          to_asset_id?: number | null
          to_goal_id?: number | null
          to_instrument_id?: number | null
          to_wallet_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          from_amount?: number | null
          to_amount?: number | null
          created_at?: string | null
          from_currency?: string | null
          to_currency?: string | null
          date?: string
          from_asset_id?: number | null
          from_goal_id?: number | null
          from_instrument_id?: number | null
          from_wallet_id?: number | null
          id?: number
          to_asset_id?: number | null
          to_goal_id?: number | null
          to_instrument_id?: number | null
          to_wallet_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_transfers_from_currency_fkey"
            columns: ["from_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "goal_transfers_to_currency_fkey"
            columns: ["to_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
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
          currency_code: string
          date: string
          description: string | null
          exchange_rate: number | null
          id: number
          updated_at: string | null
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string | null
          currency_code: string
          date: string
          description?: string | null
          exchange_rate?: number | null
          id?: number
          updated_at?: string | null
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string | null
          exchange_rate?: number | null
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
            foreignKeyName: "transactions_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
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
          from_amount: number
          to_amount: number
          created_at: string | null
          from_currency: string
          to_currency: string
          date: string
          from_wallet_id: number
          id: number
          to_wallet_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          from_amount: number
          to_amount: number
          created_at?: string | null
          from_currency: string
          to_currency: string
          date: string
          from_wallet_id: number
          id?: number
          to_wallet_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          from_amount?: number
          to_amount?: number
          created_at?: string | null
          from_currency?: string
          to_currency?: string
          date?: string
          from_wallet_id?: number
          id?: number
          to_wallet_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_currency_fkey"
            columns: ["from_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "transfers_to_currency_fkey"
            columns: ["to_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
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
      fund_summary: {
        Row: {
          asset_name: string | null
          asset_symbol: string | null
          currency_code: string | null
          goal_id: number | null
          instrument_name: string | null
          total_amount: number | null
          user_id: string | null
          unit_label: string | null
          total_amount_unit: number | null
        }
        Relationships: []
      }
      money_movements: {
        Row: {
          amount: number | null
          asset_id: number | null
          currency_code: string | null
          date: string | null
          goal_id: number | null
          instrument_id: number | null
          resource_id: number | null
          resource_type: string | null
          user_id: string | null
          wallet_id: number | null
          description: string | null
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
          _user_id: string
          _wallet_id: number
          _category_id: number
          _amount: number
          _currency_code: string
          _trx_date: string
          _description: string
          _budget_ids?: number[]
          _project_ids?: number[]
        }
        Returns: undefined
      }
      update_transaction_with_relations: {
        Args: {
          _transaction_id: number
          _user_id: string
          _wallet_id: number
          _category_id: number
          _amount: number
          _currency_code: string
          _trx_date: string
          _description: string
          _budget_ids?: number[]
          _project_ids?: number[]
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
