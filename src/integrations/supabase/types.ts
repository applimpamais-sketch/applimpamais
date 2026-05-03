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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_onboarding_progress: {
        Row: {
          completed_tours: Json | null
          created_at: string | null
          current_step: number | null
          current_tour: string | null
          has_seen_welcome: boolean | null
          id: string
          updated_at: string | null
          user_id: string
          visited_screens: Json | null
        }
        Insert: {
          completed_tours?: Json | null
          created_at?: string | null
          current_step?: number | null
          current_tour?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
          visited_screens?: Json | null
        }
        Update: {
          completed_tours?: Json | null
          created_at?: string | null
          current_step?: number | null
          current_tour?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
          visited_screens?: Json | null
        }
        Relationships: []
      }
      agendamento_sessoes: {
        Row: {
          campos_faltando: string[] | null
          campos_preenchidos: string[] | null
          created_at: string | null
          dados_parciais: Json | null
          funcionario_bot_id: string | null
          funcionario_telefone: string
          id: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          campos_faltando?: string[] | null
          campos_preenchidos?: string[] | null
          created_at?: string | null
          dados_parciais?: Json | null
          funcionario_bot_id?: string | null
          funcionario_telefone: string
          id?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          campos_faltando?: string[] | null
          campos_preenchidos?: string[] | null
          created_at?: string | null
          dados_parciais?: Json | null
          funcionario_bot_id?: string | null
          funcionario_telefone?: string
          id?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_sessoes_funcionario_bot_id_fkey"
            columns: ["funcionario_bot_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_bot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_sessoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          atribuido_por: string | null
          bairro: string | null
          canal_origem: string | null
          categoria_receita: string | null
          cep: string | null
          cidade: string | null
          concluido_em: string | null
          concluido_por: string | null
          created_at: string | null
          criado_manualmente: boolean | null
          criado_por: string | null
          criado_por_funcionario_bot: string | null
          cupom_codigo: string | null
          cupom_desconto_percentual: number | null
          data_agendamento: string
          data_atribuicao: string | null
          endereco: string
          forma_pagamento: string | null
          genero_cliente: string | null
          google_event_id: string | null
          horario: string | null
          id: string
          is_locacao: boolean | null
          itens_carrinho: Json
          latitude: number | null
          longitude: number | null
          nome_cliente: string
          order_code: string | null
          origem: string | null
          pago_em: string | null
          pago_por: string | null
          parceiro_codigo: string | null
          status: string
          tecnico_id: string | null
          telefone: string
          tenant_id: string | null
          updated_at: string | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_total: number
        }
        Insert: {
          atribuido_por?: string | null
          bairro?: string | null
          canal_origem?: string | null
          categoria_receita?: string | null
          cep?: string | null
          cidade?: string | null
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string | null
          criado_manualmente?: boolean | null
          criado_por?: string | null
          criado_por_funcionario_bot?: string | null
          cupom_codigo?: string | null
          cupom_desconto_percentual?: number | null
          data_agendamento: string
          data_atribuicao?: string | null
          endereco: string
          forma_pagamento?: string | null
          genero_cliente?: string | null
          google_event_id?: string | null
          horario?: string | null
          id?: string
          is_locacao?: boolean | null
          itens_carrinho: Json
          latitude?: number | null
          longitude?: number | null
          nome_cliente: string
          order_code?: string | null
          origem?: string | null
          pago_em?: string | null
          pago_por?: string | null
          parceiro_codigo?: string | null
          status?: string
          tecnico_id?: string | null
          telefone: string
          tenant_id?: string | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_total: number
        }
        Update: {
          atribuido_por?: string | null
          bairro?: string | null
          canal_origem?: string | null
          categoria_receita?: string | null
          cep?: string | null
          cidade?: string | null
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string | null
          criado_manualmente?: boolean | null
          criado_por?: string | null
          criado_por_funcionario_bot?: string | null
          cupom_codigo?: string | null
          cupom_desconto_percentual?: number | null
          data_agendamento?: string
          data_atribuicao?: string | null
          endereco?: string
          forma_pagamento?: string | null
          genero_cliente?: string | null
          google_event_id?: string | null
          horario?: string | null
          id?: string
          is_locacao?: boolean | null
          itens_carrinho?: Json
          latitude?: number | null
          longitude?: number | null
          nome_cliente?: string
          order_code?: string | null
          origem?: string | null
          pago_em?: string | null
          pago_por?: string | null
          parceiro_codigo?: string | null
          status?: string
          tecnico_id?: string | null
          telefone?: string
          tenant_id?: string | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_criado_por_funcionario_bot_fkey"
            columns: ["criado_por_funcionario_bot"]
            isOneToOne: false
            referencedRelation: "funcionarios_bot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pago_por_fkey"
            columns: ["pago_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pago_por_fkey"
            columns: ["pago_por"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_bot: {
        Row: {
          agendamento_id: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          conversa_id: string | null
          criado_em: string | null
          data_desejada: string | null
          endereco_completo: string | null
          horario_desejado: string | null
          id: string
          itens_selecionados: Json
          nome_cliente: string
          status: string | null
          telefone: string
          tenant_id: string | null
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          agendamento_id?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          data_desejada?: string | null
          endereco_completo?: string | null
          horario_desejado?: string | null
          id?: string
          itens_selecionados?: Json
          nome_cliente: string
          status?: string | null
          telefone: string
          tenant_id?: string | null
          updated_at?: string | null
          valor_total?: number
        }
        Update: {
          agendamento_id?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          data_desejada?: string | null
          endereco_completo?: string | null
          horario_desejado?: string | null
          id?: string
          itens_selecionados?: Json
          nome_cliente?: string
          status?: string | null
          telefone?: string
          tenant_id?: string | null
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_bot_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_bot_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_bot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_bot_backup_20251124: {
        Row: {
          agendamento_id: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          conversa_id: string | null
          criado_em: string | null
          data_desejada: string | null
          endereco_completo: string | null
          horario_desejado: string | null
          id: string | null
          itens_selecionados: Json | null
          nome_cliente: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
          valor_total: number | null
        }
        Insert: {
          agendamento_id?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          data_desejada?: string | null
          endereco_completo?: string | null
          horario_desejado?: string | null
          id?: string | null
          itens_selecionados?: Json | null
          nome_cliente?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Update: {
          agendamento_id?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          data_desejada?: string | null
          endereco_completo?: string | null
          horario_desejado?: string | null
          id?: string | null
          itens_selecionados?: Json | null
          nome_cliente?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Relationships: []
      }
      agendamentos_historico: {
        Row: {
          agendamento_id: string
          alterado_por: string | null
          campo_alterado: string | null
          created_at: string
          id: string
          tipo_alteracao: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          agendamento_id: string
          alterado_por?: string | null
          campo_alterado?: string | null
          created_at?: string
          id?: string
          tipo_alteracao: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          agendamento_id?: string
          alterado_por?: string | null
          campo_alterado?: string | null
          created_at?: string
          id?: string
          tipo_alteracao?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_historico_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      alugueis: {
        Row: {
          created_at: string | null
          equipamento: string
          id: string
          periodo_aluguel: string
          preco: number
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipamento: string
          id?: string
          periodo_aluguel: string
          preco: number
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipamento?: string
          id?: string
          periodo_aluguel?: string
          preco?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alugueis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          record_id: string | null
          table_name: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_clientes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          bairro: string
          cidade: string
          comentario: string
          created_at: string
          id: string
          nome: string
          rating: number
          servico: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          bairro: string
          cidade: string
          comentario: string
          created_at?: string
          id?: string
          nome: string
          rating: number
          servico: string
          status?: string
          tenant_id?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          bairro?: string
          cidade?: string
          comentario?: string
          created_at?: string
          id?: string
          nome?: string
          rating?: number
          servico?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_clientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_automation_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "blog_automation_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_automation_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_clusters: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          pilar_post_id: string | null
          revenue_potential: number | null
          seo_score_avg: number | null
          slug: string | null
          target_posts: number | null
          traffic_estimate: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          pilar_post_id?: string | null
          revenue_potential?: number | null
          seo_score_avg?: number | null
          slug?: string | null
          target_posts?: number | null
          traffic_estimate?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          pilar_post_id?: string | null
          revenue_potential?: number | null
          seo_score_avg?: number | null
          slug?: string | null
          target_posts?: number | null
          traffic_estimate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pilar_post"
            columns: ["pilar_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "blog_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_editorial_calendar: {
        Row: {
          cluster_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          post_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cluster_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_editorial_calendar_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_editorial_calendar_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_editorial_calendar_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_editorial_calendar_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_internal_links: {
        Row: {
          anchor_text: string | null
          created_at: string | null
          id: string
          link_type: string | null
          source_post_id: string
          target_post_id: string
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string | null
          id?: string
          link_type?: string | null
          source_post_id: string
          target_post_id: string
        }
        Update: {
          anchor_text?: string | null
          created_at?: string | null
          id?: string
          link_type?: string | null
          source_post_id?: string
          target_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_internal_links_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_internal_links_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_keywords_bank: {
        Row: {
          bairro: string | null
          cannibalization_risk: string | null
          city: string | null
          cluster: string
          cluster_id: string | null
          competition: string | null
          competitor_gap_score: number | null
          cpc: number | null
          created_at: string
          difficulty_score: number | null
          funnel_stage: string
          id: string
          import_batch_id: string | null
          intent: string | null
          is_pilar_keyword: boolean | null
          keyword: string
          opportunity_score: number | null
          post_id: string | null
          search_volume: number | null
          servico_item: string | null
          source: string | null
          trend_score: number | null
          used: boolean | null
        }
        Insert: {
          bairro?: string | null
          cannibalization_risk?: string | null
          city?: string | null
          cluster: string
          cluster_id?: string | null
          competition?: string | null
          competitor_gap_score?: number | null
          cpc?: number | null
          created_at?: string
          difficulty_score?: number | null
          funnel_stage: string
          id?: string
          import_batch_id?: string | null
          intent?: string | null
          is_pilar_keyword?: boolean | null
          keyword: string
          opportunity_score?: number | null
          post_id?: string | null
          search_volume?: number | null
          servico_item?: string | null
          source?: string | null
          trend_score?: number | null
          used?: boolean | null
        }
        Update: {
          bairro?: string | null
          cannibalization_risk?: string | null
          city?: string | null
          cluster?: string
          cluster_id?: string | null
          competition?: string | null
          competitor_gap_score?: number | null
          cpc?: number | null
          created_at?: string
          difficulty_score?: number | null
          funnel_stage?: string
          id?: string
          import_batch_id?: string | null
          intent?: string | null
          is_pilar_keyword?: boolean | null
          keyword?: string
          opportunity_score?: number | null
          post_id?: string | null
          search_volume?: number | null
          servico_item?: string | null
          source?: string | null
          trend_score?: number | null
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_keywords_bank_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_keywords_bank_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts_queue: {
        Row: {
          chosen_keyword: string
          cluster: string
          cluster_id: string | null
          content_html: string | null
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_type: string | null
          difficulty_estimate: string | null
          error_message: string | null
          estimated_revenue: number | null
          estimated_traffic: number | null
          excerpt: string | null
          faq_schema_jsonld: string | null
          faqs_json: Json | null
          id: string
          images: Json | null
          internal_links: Json | null
          internal_links_count: number | null
          is_pilar: boolean | null
          last_refreshed_at: string | null
          meta_description: string | null
          meta_title: string | null
          needs_refresh: boolean | null
          objective: string
          published_at: string | null
          region_bairro: string | null
          region_city: string | null
          secondary_keywords: Json | null
          seed_keyword: string
          seo_score: number | null
          servico_item: string | null
          slug: string | null
          status: string
          title: string | null
          updated_at: string
          word_count: number | null
          wp_post_id: number | null
          wp_post_url: string | null
        }
        Insert: {
          chosen_keyword: string
          cluster: string
          cluster_id?: string | null
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_type?: string | null
          difficulty_estimate?: string | null
          error_message?: string | null
          estimated_revenue?: number | null
          estimated_traffic?: number | null
          excerpt?: string | null
          faq_schema_jsonld?: string | null
          faqs_json?: Json | null
          id?: string
          images?: Json | null
          internal_links?: Json | null
          internal_links_count?: number | null
          is_pilar?: boolean | null
          last_refreshed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          needs_refresh?: boolean | null
          objective: string
          published_at?: string | null
          region_bairro?: string | null
          region_city?: string | null
          secondary_keywords?: Json | null
          seed_keyword: string
          seo_score?: number | null
          servico_item?: string | null
          slug?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          word_count?: number | null
          wp_post_id?: number | null
          wp_post_url?: string | null
        }
        Update: {
          chosen_keyword?: string
          cluster?: string
          cluster_id?: string | null
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_type?: string | null
          difficulty_estimate?: string | null
          error_message?: string | null
          estimated_revenue?: number | null
          estimated_traffic?: number | null
          excerpt?: string | null
          faq_schema_jsonld?: string | null
          faqs_json?: Json | null
          id?: string
          images?: Json | null
          internal_links?: Json | null
          internal_links_count?: number | null
          is_pilar?: boolean | null
          last_refreshed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          needs_refresh?: boolean | null
          objective?: string
          published_at?: string | null
          region_bairro?: string | null
          region_city?: string | null
          secondary_keywords?: Json | null
          seed_keyword?: string
          seo_score?: number | null
          servico_item?: string | null
          slug?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          word_count?: number | null
          wp_post_id?: number | null
          wp_post_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_queue_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_publish_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          message: string | null
          post_queue_id: string | null
          raw_response: Json | null
          step: string
          success: boolean
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          message?: string | null
          post_queue_id?: string | null
          raw_response?: Json | null
          step: string
          success?: boolean
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          message?: string | null
          post_queue_id?: string | null
          raw_response?: Json | null
          step?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "blog_publish_logs_post_queue_id_fkey"
            columns: ["post_queue_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_traffic_estimates: {
        Row: {
          calculation_date: string | null
          calculation_method: string | null
          cluster_id: string | null
          created_at: string | null
          estimated_leads: number | null
          estimated_revenue: number | null
          estimated_visits: number | null
          id: string
          post_id: string | null
        }
        Insert: {
          calculation_date?: string | null
          calculation_method?: string | null
          cluster_id?: string | null
          created_at?: string | null
          estimated_leads?: number | null
          estimated_revenue?: number | null
          estimated_visits?: number | null
          id?: string
          post_id?: string | null
        }
        Update: {
          calculation_date?: string | null
          calculation_method?: string | null
          cluster_id?: string | null
          created_at?: string | null
          estimated_leads?: number | null
          estimated_revenue?: number | null
          estimated_visits?: number | null
          id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_traffic_estimates_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_traffic_estimates_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_disponibilidade: {
        Row: {
          created_at: string | null
          data: string
          id: string
          tenant_id: string | null
          vagas_disponiveis: number
          vagas_totais: number
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          tenant_id?: string | null
          vagas_disponiveis?: number
          vagas_totais?: number
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          tenant_id?: string | null
          vagas_disponiveis?: number
          vagas_totais?: number
        }
        Relationships: [
          {
            foreignKeyName: "calendario_disponibilidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      canais_empresa: {
        Row: {
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          status: string
          tenant_id: string | null
          tipo: string
          total_cliques: number
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          status?: string
          tenant_id?: string | null
          tipo?: string
          total_cliques?: number
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          status?: string
          tenant_id?: string | null
          tipo?: string
          total_cliques?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "canais_empresa_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      carrinhos_abandonados: {
        Row: {
          bairro: string | null
          canal_origem: string | null
          cep: string | null
          cidade: string | null
          created_at: string | null
          cupom_codigo: string | null
          cupom_desconto_percentual: number | null
          data_agendamento: string | null
          email: string | null
          endereco: string | null
          etapa_abandonada: string
          id: string
          itens_carrinho: Json
          last_activity: string | null
          nome_cliente: string | null
          notas_internas: string | null
          percentual_preenchimento: number | null
          session_id: string
          status: string
          telefone: string | null
          tenant_id: string | null
          tentativas_contato: number | null
          tipo_ultima_mensagem: string | null
          ultima_tentativa_contato: string | null
          updated_at: string | null
          user_agent: string | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_total: number
        }
        Insert: {
          bairro?: string | null
          canal_origem?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          cupom_codigo?: string | null
          cupom_desconto_percentual?: number | null
          data_agendamento?: string | null
          email?: string | null
          endereco?: string | null
          etapa_abandonada: string
          id?: string
          itens_carrinho: Json
          last_activity?: string | null
          nome_cliente?: string | null
          notas_internas?: string | null
          percentual_preenchimento?: number | null
          session_id: string
          status?: string
          telefone?: string | null
          tenant_id?: string | null
          tentativas_contato?: number | null
          tipo_ultima_mensagem?: string | null
          ultima_tentativa_contato?: string | null
          updated_at?: string | null
          user_agent?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_total: number
        }
        Update: {
          bairro?: string | null
          canal_origem?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          cupom_codigo?: string | null
          cupom_desconto_percentual?: number | null
          data_agendamento?: string | null
          email?: string | null
          endereco?: string | null
          etapa_abandonada?: string
          id?: string
          itens_carrinho?: Json
          last_activity?: string | null
          nome_cliente?: string | null
          notas_internas?: string | null
          percentual_preenchimento?: number | null
          session_id?: string
          status?: string
          telefone?: string | null
          tenant_id?: string | null
          tentativas_contato?: number | null
          tipo_ultima_mensagem?: string | null
          ultima_tentativa_contato?: string | null
          updated_at?: string | null
          user_agent?: string | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "carrinhos_abandonados_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes: {
        Row: {
          agendamento_id: string | null
          carrinho_id: string | null
          created_at: string
          enviado_por: string | null
          id: string
          mensagem: string
          status_entrega: string | null
          template_usado: string | null
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          agendamento_id?: string | null
          carrinho_id?: string | null
          created_at?: string
          enviado_por?: string | null
          id?: string
          mensagem: string
          status_entrega?: string | null
          template_usado?: string | null
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          agendamento_id?: string | null
          carrinho_id?: string | null
          created_at?: string
          enviado_por?: string | null
          id?: string
          mensagem?: string
          status_entrega?: string | null
          template_usado?: string | null
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_carrinho_id_fkey"
            columns: ["carrinho_id"]
            isOneToOne: false
            referencedRelation: "carrinhos_abandonados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons_desconto: {
        Row: {
          auto_aplicar: boolean | null
          categorias_aplicaveis: string[]
          codigo: string
          created_at: string | null
          data_validade_fim: string | null
          data_validade_inicio: string | null
          desconto_percentual: number
          id: string
          status: string
          tenant_id: string | null
          tipo_aplicacao: Database["public"]["Enums"]["tipo_aplicacao_cupom"]
          updated_at: string | null
          uso_atual: number | null
          uso_maximo: number | null
        }
        Insert: {
          auto_aplicar?: boolean | null
          categorias_aplicaveis: string[]
          codigo: string
          created_at?: string | null
          data_validade_fim?: string | null
          data_validade_inicio?: string | null
          desconto_percentual: number
          id?: string
          status?: string
          tenant_id?: string | null
          tipo_aplicacao?: Database["public"]["Enums"]["tipo_aplicacao_cupom"]
          updated_at?: string | null
          uso_atual?: number | null
          uso_maximo?: number | null
        }
        Update: {
          auto_aplicar?: boolean | null
          categorias_aplicaveis?: string[]
          codigo?: string
          created_at?: string | null
          data_validade_fim?: string | null
          data_validade_inicio?: string | null
          desconto_percentual?: number
          id?: string
          status?: string
          tenant_id?: string | null
          tipo_aplicacao?: Database["public"]["Enums"]["tipo_aplicacao_cupom"]
          updated_at?: string | null
          uso_atual?: number | null
          uso_maximo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cupons_desconto_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_log: {
        Row: {
          executed_at: string | null
          id: string
          records_deleted: number
          retention_period: string
          table_name: string
        }
        Insert: {
          executed_at?: string | null
          id?: string
          records_deleted: number
          retention_period: string
          table_name: string
        }
        Update: {
          executed_at?: string | null
          id?: string
          records_deleted?: number
          retention_period?: string
          table_name?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string
          comprovante_url: string | null
          created_at: string
          created_by: string | null
          data_despesa: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          origem: string | null
          rateio_percentual: number | null
          recorrente: boolean | null
          servico_relacionado: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data_despesa: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          rateio_percentual?: number | null
          recorrente?: boolean | null
          servico_relacionado?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data_despesa?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          rateio_percentual?: number | null
          recorrente?: boolean | null
          servico_relacionado?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_equipamentos: {
        Row: {
          agendamento_id: string
          created_at: string
          data_entrega_realizada: string | null
          data_saida_entrega: string | null
          id: string
          observacoes: string | null
          responsavel_entrega: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          data_entrega_realizada?: string | null
          data_saida_entrega?: string | null
          id?: string
          observacoes?: string | null
          responsavel_entrega?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          data_entrega_realizada?: string | null
          data_saida_entrega?: string | null
          id?: string
          observacoes?: string | null
          responsavel_entrega?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agendamento"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_avaliacoes: {
        Row: {
          agendamento_id: string | null
          created_at: string
          enviado_em: string | null
          feedback: string | null
          id: string
          nome_cliente: string | null
          nota: number | null
          respondido_em: string | null
          status: string
          telefone: string
          tenant_id: string | null
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          enviado_em?: string | null
          feedback?: string | null
          id?: string
          nome_cliente?: string | null
          nota?: number | null
          respondido_em?: string | null
          status?: string
          telefone: string
          tenant_id?: string | null
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          enviado_em?: string | null
          feedback?: string | null
          id?: string
          nome_cliente?: string | null
          nota?: number | null
          respondido_em?: string | null
          status?: string
          telefone?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fila_avaliacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_avaliacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_notificacoes_tecnico: {
        Row: {
          agendamento_id: string | null
          created_at: string
          enviado_em: string | null
          erro_mensagem: string | null
          id: string
          status: string
          tecnico_id: string | null
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          status?: string
          tecnico_id?: string | null
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          status?: string
          tecnico_id?: string | null
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_notificacoes_tecnico_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_tecnico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_tecnico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_tecnico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios_bot: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone_whatsapp: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone_whatsapp: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone_whatsapp?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_bot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_agendamentos: {
        Row: {
          agendamento_id: string
          alterado_por: string | null
          campo_alterado: string | null
          created_at: string
          id: string
          tenant_id: string | null
          tipo_alteracao: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          agendamento_id: string
          alterado_por?: string | null
          campo_alterado?: string | null
          created_at?: string
          id?: string
          tenant_id?: string | null
          tipo_alteracao: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          agendamento_id?: string
          alterado_por?: string | null
          campo_alterado?: string | null
          created_at?: string
          id?: string
          tenant_id?: string | null
          tipo_alteracao?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_agendamentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_agendamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_atribuicoes: {
        Row: {
          agendamento_id: string | null
          atribuido_por: string | null
          created_at: string | null
          id: string
          motivo: string | null
          tecnico_anterior_id: string | null
          tecnico_novo_id: string | null
          tenant_id: string | null
        }
        Insert: {
          agendamento_id?: string | null
          atribuido_por?: string | null
          created_at?: string | null
          id?: string
          motivo?: string | null
          tecnico_anterior_id?: string | null
          tecnico_novo_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          agendamento_id?: string | null
          atribuido_por?: string | null
          created_at?: string | null
          id?: string
          motivo?: string | null
          tecnico_anterior_id?: string | null
          tecnico_novo_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_atribuicoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_atribuicoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iarc_copys_geradas: {
        Row: {
          contexto: Json | null
          copys: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          tenant_id: string | null
          tipo_copy: string
        }
        Insert: {
          contexto?: Json | null
          copys?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          tenant_id?: string | null
          tipo_copy: string
        }
        Update: {
          contexto?: Json | null
          copys?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          tenant_id?: string | null
          tipo_copy?: string
        }
        Relationships: [
          {
            foreignKeyName: "iarc_copys_geradas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iarc_criativos: {
        Row: {
          created_at: string | null
          created_by: string | null
          estilo: string | null
          id: string
          imagens: Json | null
          prompt: string
          tenant_id: string | null
          texto_overlay: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          estilo?: string | null
          id?: string
          imagens?: Json | null
          prompt: string
          tenant_id?: string | null
          texto_overlay?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          estilo?: string | null
          id?: string
          imagens?: Json | null
          prompt?: string
          tenant_id?: string | null
          texto_overlay?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "iarc_criativos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iarc_landing_page_revisions: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          id: string
          landing_page_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          landing_page_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          landing_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iarc_landing_page_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iarc_landing_page_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iarc_landing_page_revisions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "iarc_landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      iarc_landing_pages: {
        Row: {
          config: Json | null
          copy_gerada: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          nome: string
          publicada_em: string | null
          slug: string | null
          status: string | null
          template_tipo: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          copy_gerada?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome: string
          publicada_em?: string | null
          slug?: string | null
          status?: string | null
          template_tipo: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          copy_gerada?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome?: string
          publicada_em?: string | null
          slug?: string | null
          status?: string | null
          template_tipo?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iarc_landing_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes: {
        Row: {
          atualizado_em: string | null
          configuracao: Json
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          status: string
          tipo: string
          ultimo_uso: string | null
        }
        Insert: {
          atualizado_em?: string | null
          configuracao?: Json
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          status?: string
          tipo: string
          ultimo_uso?: string | null
        }
        Update: {
          atualizado_em?: string | null
          configuracao?: Json
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          status?: string
          tipo?: string
          ultimo_uso?: string | null
        }
        Relationships: []
      }
      leads_cupom: {
        Row: {
          agendamento_id: string | null
          bairro: string
          cidade: string
          converteu_em_agendamento: boolean | null
          created_at: string | null
          cupom_codigo: string
          id: string
          nome_completo: string
          origem: string | null
          tenant_id: string | null
          updated_at: string | null
          whatsapp: string
        }
        Insert: {
          agendamento_id?: string | null
          bairro: string
          cidade: string
          converteu_em_agendamento?: boolean | null
          created_at?: string | null
          cupom_codigo?: string
          id?: string
          nome_completo: string
          origem?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          whatsapp: string
        }
        Update: {
          agendamento_id?: string | null
          bairro?: string
          cidade?: string
          converteu_em_agendamento?: boolean | null
          created_at?: string | null
          cupom_codigo?: string
          id?: string
          nome_completo?: string
          origem?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_cupom_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_cupom_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_white_label: {
        Row: {
          created_at: string | null
          email: string
          empresa: string
          id: string
          mensagem: string | null
          nome: string
          origem: string | null
          status: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa: string
          id?: string
          mensagem?: string | null
          nome: string
          origem?: string | null
          status?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa?: string
          id?: string
          mensagem?: string | null
          nome?: string
          origem?: string | null
          status?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ledger_consistency_log: {
        Row: {
          created_at: string | null
          detalhes: Json | null
          id: string
          registro_id: string | null
          resolvido: boolean | null
          resolvido_em: string | null
          resolvido_por: string | null
          tabela_origem: string
          tipo_inconsistencia: string
          valor_encontrado: number | null
          valor_esperado: number | null
        }
        Insert: {
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          registro_id?: string | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          tabela_origem: string
          tipo_inconsistencia: string
          valor_encontrado?: number | null
          valor_esperado?: number | null
        }
        Update: {
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          registro_id?: string | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          tabela_origem?: string
          tipo_inconsistencia?: string
          valor_encontrado?: number | null
          valor_esperado?: number | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          agendamento_id: string | null
          categoria: string
          created_at: string | null
          data_movimentacao: string
          descricao: string | null
          despesa_id: string | null
          forma_pagamento: string | null
          id: string
          metadata: Json | null
          origem: string
          pagamento_id: string | null
          reembolso_id: string | null
          status: string
          tenant_id: string | null
          tipo: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          categoria: string
          created_at?: string | null
          data_movimentacao: string
          descricao?: string | null
          despesa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          metadata?: Json | null
          origem: string
          pagamento_id?: string | null
          reembolso_id?: string | null
          status?: string
          tenant_id?: string | null
          tipo: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string
          created_at?: string | null
          data_movimentacao?: string
          descricao?: string | null
          despesa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          metadata?: Json | null
          origem?: string
          pagamento_id?: string | null
          reembolso_id?: string | null
          status?: string
          tenant_id?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos_agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_reembolso_id_fkey"
            columns: ["reembolso_id"]
            isOneToOne: false
            referencedRelation: "reembolsos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consents: {
        Row: {
          consent_given: boolean
          consent_text: string
          consent_version: string
          country: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          session_id: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_given: boolean
          consent_text: string
          consent_version?: string
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_text?: string
          consent_version?: string
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          carrinho_items: number | null
          carrinho_valor: number | null
          cidade: string | null
          created_at: string | null
          estado: string | null
          etapa: string
          id: string
          pagina_atual: string
          pais: string | null
          session_id: string
          tenant_id: string | null
          ultima_atividade: string | null
          user_agent: string | null
        }
        Insert: {
          carrinho_items?: number | null
          carrinho_valor?: number | null
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          etapa: string
          id?: string
          pagina_atual: string
          pais?: string | null
          session_id: string
          tenant_id?: string | null
          ultima_atividade?: string | null
          user_agent?: string | null
        }
        Update: {
          carrinho_items?: number | null
          carrinho_valor?: number | null
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          etapa?: string
          id?: string
          pagina_atual?: string
          pais?: string | null
          session_id?: string
          tenant_id?: string | null
          ultima_atividade?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_investimentos: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          plataforma: string
          tenant_id: string | null
          updated_at: string
          usar_despesas_automatico: boolean
          valor_investido: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          plataforma?: string
          tenant_id?: string | null
          updated_at?: string
          usar_despesas_automatico?: boolean
          valor_investido?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          plataforma?: string
          tenant_id?: string | null
          updated_at?: string
          usar_despesas_automatico?: boolean
          valor_investido?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_investimentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_financeiras: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          percentual_atingido: number | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          valor_meta: number
          valor_realizado: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          percentual_atingido?: number | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valor_meta: number
          valor_realizado?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          percentual_atingido?: number | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valor_meta?: number
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_financeiras_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          agendamento_id: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_nome: string
          codigo_verificacao: string | null
          created_at: string | null
          data_competencia: string | null
          data_emissao: string | null
          descricao_servico: string
          emitida_por: string | null
          id: string
          numero_nota: string | null
          observacoes: string | null
          resposta_api: Json | null
          serie: string | null
          status: string | null
          tenant_id: string | null
          tipo: string | null
          updated_at: string | null
          url_pdf: string | null
          url_xml: string | null
          valor_impostos: number | null
          valor_total: number
        }
        Insert: {
          agendamento_id?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome: string
          codigo_verificacao?: string | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico: string
          emitida_por?: string | null
          id?: string
          numero_nota?: string | null
          observacoes?: string | null
          resposta_api?: Json | null
          serie?: string | null
          status?: string | null
          tenant_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          url_pdf?: string | null
          url_xml?: string | null
          valor_impostos?: number | null
          valor_total: number
        }
        Update: {
          agendamento_id?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome?: string
          codigo_verificacao?: string | null
          created_at?: string | null
          data_competencia?: string | null
          data_emissao?: string | null
          descricao_servico?: string
          emitida_por?: string | null
          id?: string
          numero_nota?: string | null
          observacoes?: string | null
          resposta_api?: Json | null
          serie?: string | null
          status?: string | null
          tenant_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          url_pdf?: string | null
          url_xml?: string | null
          valor_impostos?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_cidade: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_nome: string
          cliente_telefone: string | null
          condicoes_pagamento: string | null
          created_at: string | null
          created_by: string | null
          data_validade: string | null
          desconto_tipo: string | null
          desconto_valor: number | null
          empresa_nome: string | null
          enviado_em: string | null
          id: string
          itens: Json
          numero: number
          observacoes: string | null
          respondido_em: string | null
          status: string | null
          subtotal: number
          tenant_id: string | null
          updated_at: string | null
          url_pdf: string | null
          validade_dias: number | null
          valor_total: number
        }
        Insert: {
          cliente_cidade?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          condicoes_pagamento?: string | null
          created_at?: string | null
          created_by?: string | null
          data_validade?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          empresa_nome?: string | null
          enviado_em?: string | null
          id?: string
          itens?: Json
          numero?: number
          observacoes?: string | null
          respondido_em?: string | null
          status?: string | null
          subtotal?: number
          tenant_id?: string | null
          updated_at?: string | null
          url_pdf?: string | null
          validade_dias?: number | null
          valor_total?: number
        }
        Update: {
          cliente_cidade?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          condicoes_pagamento?: string | null
          created_at?: string | null
          created_by?: string | null
          data_validade?: string | null
          desconto_tipo?: string | null
          desconto_valor?: number | null
          empresa_nome?: string | null
          enviado_em?: string | null
          id?: string
          itens?: Json
          numero?: number
          observacoes?: string | null
          respondido_em?: string | null
          status?: string | null
          subtotal?: number
          tenant_id?: string | null
          updated_at?: string | null
          url_pdf?: string | null
          validade_dias?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_agendamentos: {
        Row: {
          agendamento_id: string
          comprovante_url: string | null
          created_at: string
          data_pagamento: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          valor_pago: number | null
        }
        Insert: {
          agendamento_id: string
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          valor_pago?: number | null
        }
        Update: {
          agendamento_id?: string
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_agendamentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_agendamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiro_conversoes: {
        Row: {
          agendamento_id: string
          aprovada_em: string | null
          comissao_percentual: number
          created_at: string | null
          id: string
          link_id: string | null
          paga_em: string | null
          parceiro_id: string
          status: string
          tenant_id: string | null
          valor_agendamento: number
          valor_comissao: number
        }
        Insert: {
          agendamento_id: string
          aprovada_em?: string | null
          comissao_percentual: number
          created_at?: string | null
          id?: string
          link_id?: string | null
          paga_em?: string | null
          parceiro_id: string
          status?: string
          tenant_id?: string | null
          valor_agendamento: number
          valor_comissao: number
        }
        Update: {
          agendamento_id?: string
          aprovada_em?: string | null
          comissao_percentual?: number
          created_at?: string | null
          id?: string
          link_id?: string | null
          paga_em?: string | null
          parceiro_id?: string
          status?: string
          tenant_id?: string | null
          valor_agendamento?: number
          valor_comissao?: number
        }
        Relationships: [
          {
            foreignKeyName: "parceiro_conversoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: true
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parceiro_conversoes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "parceiro_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parceiro_conversoes_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parceiro_conversoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiro_links: {
        Row: {
          cliques: number
          codigo: string
          conversoes: number
          created_at: string | null
          cupom_vinculado: string | null
          id: string
          nome_campanha: string | null
          parceiro_id: string
          receita_gerada: number
          status: string
          tenant_id: string | null
          updated_at: string | null
          url_destino: string
          validade: string | null
        }
        Insert: {
          cliques?: number
          codigo: string
          conversoes?: number
          created_at?: string | null
          cupom_vinculado?: string | null
          id?: string
          nome_campanha?: string | null
          parceiro_id: string
          receita_gerada?: number
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          url_destino?: string
          validade?: string | null
        }
        Update: {
          cliques?: number
          codigo?: string
          conversoes?: number
          created_at?: string | null
          cupom_vinculado?: string | null
          id?: string
          nome_campanha?: string | null
          parceiro_id?: string
          receita_gerada?: number
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          url_destino?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parceiro_links_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parceiro_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiro_saques: {
        Row: {
          comprovante_url: string | null
          created_at: string | null
          dados_pagamento: Json | null
          id: string
          metodo: string
          motivo_rejeicao: string | null
          parceiro_id: string
          processado_em: string | null
          processado_por: string | null
          status: string
          tenant_id: string | null
          valor: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string | null
          dados_pagamento?: Json | null
          id?: string
          metodo: string
          motivo_rejeicao?: string | null
          parceiro_id: string
          processado_em?: string | null
          processado_por?: string | null
          status?: string
          tenant_id?: string | null
          valor: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string | null
          dados_pagamento?: Json | null
          id?: string
          metodo?: string
          motivo_rejeicao?: string | null
          parceiro_id?: string
          processado_em?: string | null
          processado_por?: string | null
          status?: string
          tenant_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "parceiro_saques_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parceiro_saques_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          codigo_referencia: string
          comissao_percentual: number
          created_at: string | null
          dados_bancarios: Json | null
          documento: string | null
          email: string
          id: string
          nome: string
          nome_exibicao: string | null
          redes_sociais: Json | null
          saldo_disponivel: number
          status: string
          telefone: string
          tenant_id: string | null
          tipo: string
          total_cliques: number | null
          total_ganhos: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo_referencia: string
          comissao_percentual?: number
          created_at?: string | null
          dados_bancarios?: Json | null
          documento?: string | null
          email: string
          id?: string
          nome: string
          nome_exibicao?: string | null
          redes_sociais?: Json | null
          saldo_disponivel?: number
          status?: string
          telefone: string
          tenant_id?: string | null
          tipo?: string
          total_cliques?: number | null
          total_ganhos?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo_referencia?: string
          comissao_percentual?: number
          created_at?: string | null
          dados_bancarios?: Json | null
          documento?: string | null
          email?: string
          id?: string
          nome?: string
          nome_exibicao?: string | null
          redes_sociais?: Json | null
          saldo_disponivel?: number
          status?: string
          telefone?: string
          tenant_id?: string | null
          tipo?: string
          total_cliques?: number | null
          total_ganhos?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_events: {
        Row: {
          browser: string | null
          content_name: string | null
          content_type: string | null
          contents: Json | null
          created_at: string | null
          currency: string | null
          device_type: string | null
          event_time: string
          event_type: string
          fbclid: string | null
          gclid: string | null
          id: string
          ip_address: string | null
          landing_page: string | null
          num_items: number | null
          order_id: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          tenant_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          value: number | null
        }
        Insert: {
          browser?: string | null
          content_name?: string | null
          content_type?: string | null
          contents?: Json | null
          created_at?: string | null
          currency?: string | null
          device_type?: string | null
          event_time?: string
          event_type: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          num_items?: number | null
          order_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Update: {
          browser?: string | null
          content_name?: string | null
          content_type?: string | null
          contents?: Json | null
          created_at?: string | null
          currency?: string | null
          device_type?: string | null
          event_time?: string
          event_type?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          num_items?: number | null
          order_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_modulos_default: {
        Row: {
          created_at: string | null
          id: string
          modulo_id: string
          plano: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          modulo_id: string
          plano: string
        }
        Update: {
          created_at?: string | null
          id?: string
          modulo_id?: string
          plano?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_modulos_default_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "saas_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          cidade: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome_completo: string
          telefone: string | null
          telefone_whatsapp: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          nome_completo: string
          telefone?: string | null
          telefone_whatsapp?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_completo?: string
          telefone?: string | null
          telefone_whatsapp?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_logs: {
        Row: {
          agendamento_id: string | null
          created_at: string | null
          dispositivos: Json | null
          falha: number | null
          id: string
          sucesso: number | null
          tipo: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string | null
          dispositivos?: Json | null
          falha?: number | null
          id?: string
          sucesso?: number | null
          tipo: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string | null
          dispositivos?: Json | null
          falha?: number | null
          id?: string
          sucesso?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_logs_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_preferences: {
        Row: {
          agendamento_concluido: boolean | null
          agendamento_confirmado: boolean | null
          carrinho_abandonado: boolean | null
          created_at: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          meta_atingida: boolean | null
          novo_agendamento: boolean | null
          pagamento_recebido: boolean | null
          permitir_final_semana: boolean | null
          problema_reportado: boolean | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agendamento_concluido?: boolean | null
          agendamento_confirmado?: boolean | null
          carrinho_abandonado?: boolean | null
          created_at?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          meta_atingida?: boolean | null
          novo_agendamento?: boolean | null
          pagamento_recebido?: boolean | null
          permitir_final_semana?: boolean | null
          problema_reportado?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agendamento_concluido?: boolean | null
          agendamento_confirmado?: boolean | null
          carrinho_abandonado?: boolean | null
          created_at?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          meta_atingida?: boolean | null
          novo_agendamento?: boolean | null
          pagamento_recebido?: boolean | null
          permitir_final_semana?: boolean | null
          problema_reportado?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notifications_log: {
        Row: {
          agendamento_id: string | null
          created_at: string | null
          enviados_android: number | null
          enviados_desktop: number | null
          enviados_falha: number
          enviados_ios: number | null
          enviados_sucesso: number
          falhas_android: number | null
          falhas_desktop: number | null
          falhas_ios: number | null
          id: string
          mensagem: string
          payload: Json | null
          tipo_evento: string
          titulo: string
          total_destinatarios: number
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string | null
          enviados_android?: number | null
          enviados_desktop?: number | null
          enviados_falha?: number
          enviados_ios?: number | null
          enviados_sucesso?: number
          falhas_android?: number | null
          falhas_desktop?: number | null
          falhas_ios?: number | null
          id?: string
          mensagem: string
          payload?: Json | null
          tipo_evento: string
          titulo: string
          total_destinatarios?: number
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string | null
          enviados_android?: number | null
          enviados_desktop?: number | null
          enviados_falha?: number
          enviados_ios?: number | null
          enviados_sucesso?: number
          falhas_android?: number | null
          falhas_desktop?: number | null
          falhas_ios?: number | null
          id?: string
          mensagem?: string
          payload?: Json | null
          tipo_evento?: string
          titulo?: string
          total_destinatarios?: number
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_log_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          ativo: boolean | null
          auth: string
          created_at: string | null
          dispositivo: string | null
          endpoint: string
          id: string
          p256dh: string
          permission_denied_count: number | null
          permission_requested_at: string | null
          permission_status: string | null
          tenant_id: string | null
          ultimo_uso: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          auth: string
          created_at?: string | null
          dispositivo?: string | null
          endpoint: string
          id?: string
          p256dh: string
          permission_denied_count?: number | null
          permission_requested_at?: string | null
          permission_status?: string | null
          tenant_id?: string | null
          ultimo_uso?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          auth?: string
          created_at?: string | null
          dispositivo?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          permission_denied_count?: number | null
          permission_requested_at?: string | null
          permission_status?: string | null
          tenant_id?: string | null
          ultimo_uso?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reembolsos: {
        Row: {
          agendamento_id: string
          comprovante_url: string | null
          created_at: string | null
          data_reembolso: string | null
          id: string
          metodo_reembolso: string | null
          motivo: string
          observacoes: string | null
          pagamento_id: string | null
          processado_por: string | null
          tenant_id: string | null
          updated_at: string | null
          valor_reembolsado: number
        }
        Insert: {
          agendamento_id: string
          comprovante_url?: string | null
          created_at?: string | null
          data_reembolso?: string | null
          id?: string
          metodo_reembolso?: string | null
          motivo: string
          observacoes?: string | null
          pagamento_id?: string | null
          processado_por?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valor_reembolsado: number
        }
        Update: {
          agendamento_id?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_reembolso?: string | null
          id?: string
          metodo_reembolso?: string | null
          motivo?: string
          observacoes?: string | null
          pagamento_id?: string | null
          processado_por?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valor_reembolsado?: number
        }
        Relationships: [
          {
            foreignKeyName: "reembolsos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos_agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_access_log: {
        Row: {
          access_granted: boolean
          created_at: string | null
          id: string
          ip_address: string | null
          role_checked: Database["public"]["Enums"]["app_role"]
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_granted: boolean
          created_at?: string | null
          id?: string
          ip_address?: string | null
          role_checked: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean
          created_at?: string | null
          id?: string
          ip_address?: string | null
          role_checked?: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saas_modulos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string
          created_at: string | null
          dependencias: string[] | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          preco_base: number
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          preco_base: number
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          preco_base?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_plan_limits: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_agendamentos_mes: number | null
          max_cupons: number | null
          max_funcionarios_bot: number | null
          max_membros_dashboard: number | null
          max_storage_mb: number | null
          max_tecnicos: number | null
          max_templates_whatsapp: number | null
          plano: Database["public"]["Enums"]["saas_plano"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_agendamentos_mes?: number | null
          max_cupons?: number | null
          max_funcionarios_bot?: number | null
          max_membros_dashboard?: number | null
          max_storage_mb?: number | null
          max_tecnicos?: number | null
          max_templates_whatsapp?: number | null
          plano: Database["public"]["Enums"]["saas_plano"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_agendamentos_mes?: number | null
          max_cupons?: number | null
          max_funcionarios_bot?: number | null
          max_membros_dashboard?: number | null
          max_storage_mb?: number | null
          max_tecnicos?: number | null
          max_templates_whatsapp?: number | null
          plano?: Database["public"]["Enums"]["saas_plano"]
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_subscriptions: {
        Row: {
          atualizado_em: string | null
          comprovante_url: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          desconto: number | null
          forma_pagamento: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          status: Database["public"]["Enums"]["saas_payment_status"]
          tenant_id: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          atualizado_em?: string | null
          comprovante_url?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["saas_payment_status"]
          tenant_id: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          atualizado_em?: string | null
          comprovante_url?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["saas_payment_status"]
          tenant_id?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_tenants: {
        Row: {
          ativado_em: string | null
          atualizado_em: string | null
          cancelado_em: string | null
          cnpj: string | null
          configuracoes: Json | null
          cores_personalizadas: Json | null
          criado_em: string | null
          criado_por: string | null
          dia_vencimento: number | null
          dominio_customizado: string | null
          email_contato: string
          franquia_tipo: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          nome_fantasia: string | null
          parent_tenant_id: string | null
          plano: Database["public"]["Enums"]["saas_plano"]
          responsavel_email: string
          responsavel_nome: string
          responsavel_user_id: string | null
          status: Database["public"]["Enums"]["saas_tenant_status"]
          telefone: string | null
          trial_termina_em: string | null
          ultimo_pagamento_em: string | null
          valor_mensal: number
        }
        Insert: {
          ativado_em?: string | null
          atualizado_em?: string | null
          cancelado_em?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          cores_personalizadas?: Json | null
          criado_em?: string | null
          criado_por?: string | null
          dia_vencimento?: number | null
          dominio_customizado?: string | null
          email_contato: string
          franquia_tipo?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa: string
          nome_fantasia?: string | null
          parent_tenant_id?: string | null
          plano?: Database["public"]["Enums"]["saas_plano"]
          responsavel_email: string
          responsavel_nome: string
          responsavel_user_id?: string | null
          status?: Database["public"]["Enums"]["saas_tenant_status"]
          telefone?: string | null
          trial_termina_em?: string | null
          ultimo_pagamento_em?: string | null
          valor_mensal?: number
        }
        Update: {
          ativado_em?: string | null
          atualizado_em?: string | null
          cancelado_em?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          cores_personalizadas?: Json | null
          criado_em?: string | null
          criado_por?: string | null
          dia_vencimento?: number | null
          dominio_customizado?: string | null
          email_contato?: string
          franquia_tipo?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          nome_fantasia?: string | null
          parent_tenant_id?: string | null
          plano?: Database["public"]["Enums"]["saas_plano"]
          responsavel_email?: string
          responsavel_nome?: string
          responsavel_user_id?: string | null
          status?: Database["public"]["Enums"]["saas_tenant_status"]
          telefone?: string | null
          trial_termina_em?: string | null
          ultimo_pagamento_em?: string | null
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "saas_tenants_parent_tenant_id_fkey"
            columns: ["parent_tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_usage_metrics: {
        Row: {
          agendamentos_concluidos: number | null
          agendamentos_criados: number | null
          calculado_em: string | null
          id: string
          mensagens_whatsapp_enviadas: number | null
          mensagens_whatsapp_recebidas: number | null
          mes_referencia: string
          receita_cliente: number | null
          storage_usado_mb: number | null
          tecnicos_ativos: number | null
          tenant_id: string
          ticket_medio: number | null
          usuarios_ativos: number | null
        }
        Insert: {
          agendamentos_concluidos?: number | null
          agendamentos_criados?: number | null
          calculado_em?: string | null
          id?: string
          mensagens_whatsapp_enviadas?: number | null
          mensagens_whatsapp_recebidas?: number | null
          mes_referencia: string
          receita_cliente?: number | null
          storage_usado_mb?: number | null
          tecnicos_ativos?: number | null
          tenant_id: string
          ticket_medio?: number | null
          usuarios_ativos?: number | null
        }
        Update: {
          agendamentos_concluidos?: number | null
          agendamentos_criados?: number | null
          calculado_em?: string | null
          id?: string
          mensagens_whatsapp_enviadas?: number | null
          mensagens_whatsapp_recebidas?: number | null
          mes_referencia?: string
          receita_cliente?: number | null
          storage_usado_mb?: number | null
          tecnicos_ativos?: number | null
          tenant_id?: string
          ticket_medio?: number | null
          usuarios_ativos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_usage_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts_atendimento: {
        Row: {
          ab_grupo: string | null
          ativo: boolean | null
          categoria: string
          conteudo: string
          contexto: string | null
          conversoes: number | null
          created_at: string | null
          etapa: string
          id: string
          nome: string
          updated_at: string | null
          uso_count: number | null
          variante: string
          variaveis: string[] | null
        }
        Insert: {
          ab_grupo?: string | null
          ativo?: boolean | null
          categoria?: string
          conteudo: string
          contexto?: string | null
          conversoes?: number | null
          created_at?: string | null
          etapa?: string
          id?: string
          nome: string
          updated_at?: string | null
          uso_count?: number | null
          variante?: string
          variaveis?: string[] | null
        }
        Update: {
          ab_grupo?: string | null
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          contexto?: string | null
          conversoes?: number | null
          created_at?: string | null
          etapa?: string
          id?: string
          nome?: string
          updated_at?: string | null
          uso_count?: number | null
          variante?: string
          variaveis?: string[] | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          item: string
          preco_impermeabilizacao: number | null
          preco_limpeza: number | null
          preco_limpeza_impermeabilizacao: number | null
          subcategoria: string
          tamanho: string | null
          tenant_id: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          item: string
          preco_impermeabilizacao?: number | null
          preco_limpeza?: number | null
          preco_limpeza_impermeabilizacao?: number | null
          subcategoria: string
          tamanho?: string | null
          tenant_id?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          item?: string
          preco_impermeabilizacao?: number | null
          preco_limpeza?: number | null
          preco_limpeza_impermeabilizacao?: number | null
          subcategoria?: string
          tamanho?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      soft_launch_clientes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_inclusao: string | null
          feedback_coletado: boolean | null
          id: string
          motivo_inclusao: string | null
          nome_cliente: string
          observacoes: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_inclusao?: string | null
          feedback_coletado?: boolean | null
          id?: string
          motivo_inclusao?: string | null
          nome_cliente: string
          observacoes?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_inclusao?: string | null
          feedback_coletado?: boolean | null
          id?: string
          motivo_inclusao?: string | null
          nome_cliente?: string
          observacoes?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      soft_launch_feedback: {
        Row: {
          agendamento_id: string | null
          clareza_informacoes: number | null
          comentario_negativo: string | null
          comentario_positivo: string | null
          conversa_id: string | null
          created_at: string | null
          facilidade_uso: number | null
          id: string
          nome_cliente: string | null
          nota_geral: number | null
          prefere_humano: boolean | null
          sugestao_melhoria: string | null
          telefone: string
          updated_at: string | null
          velocidade_resposta: number | null
          voltaria_usar: boolean | null
        }
        Insert: {
          agendamento_id?: string | null
          clareza_informacoes?: number | null
          comentario_negativo?: string | null
          comentario_positivo?: string | null
          conversa_id?: string | null
          created_at?: string | null
          facilidade_uso?: number | null
          id?: string
          nome_cliente?: string | null
          nota_geral?: number | null
          prefere_humano?: boolean | null
          sugestao_melhoria?: string | null
          telefone: string
          updated_at?: string | null
          velocidade_resposta?: number | null
          voltaria_usar?: boolean | null
        }
        Update: {
          agendamento_id?: string | null
          clareza_informacoes?: number | null
          comentario_negativo?: string | null
          comentario_positivo?: string | null
          conversa_id?: string | null
          created_at?: string | null
          facilidade_uso?: number | null
          id?: string
          nome_cliente?: string | null
          nota_geral?: number | null
          prefere_humano?: boolean | null
          sugestao_melhoria?: string | null
          telefone?: string
          updated_at?: string | null
          velocidade_resposta?: number | null
          voltaria_usar?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "soft_launch_feedback_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soft_launch_feedback_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_mensagens: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          id: string
          nome: string
          tenant_id: string | null
          titulo: string
          updated_at: string | null
          uso_count: number | null
          variaveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
          titulo: string
          updated_at?: string | null
          uso_count?: number | null
          variaveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
          titulo?: string
          updated_at?: string | null
          uso_count?: number | null
          variaveis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_mensagens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_activity_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          created_at: string
          enabled: boolean
          expires_at: string | null
          feature_key: string
          granted_by: string | null
          id: string
          reason: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          expires_at?: string | null
          feature_key: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          expires_at?: string | null
          feature_key?: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_modulos: {
        Row: {
          ativado_em: string | null
          created_at: string | null
          desativado_em: string | null
          id: string
          modulo_id: string
          preco_negociado: number | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          ativado_em?: string | null
          created_at?: string | null
          desativado_em?: string | null
          id?: string
          modulo_id: string
          preco_negociado?: number | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          ativado_em?: string | null
          created_at?: string | null
          desativado_em?: string | null
          id?: string
          modulo_id?: string
          preco_negociado?: number | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "saas_modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_modulos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_usage_metrics: {
        Row: {
          created_at: string
          id: string
          last_calculated_at: string
          metric_key: string
          metric_value: number
          period_end: string | null
          period_start: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_calculated_at?: string
          metric_key: string
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_calculated_at?: string
          metric_key?: string
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_acesso_tecnico: {
        Row: {
          created_at: string | null
          data_rota: string
          expires_at: string
          id: string
          tecnico_id: string
          token: string
          usado: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_rota: string
          expires_at: string
          id?: string
          tecnico_id: string
          token: string
          usado?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_rota?: string
          expires_at?: string
          id?: string
          tecnico_id?: string
          token?: string
          usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_acesso_tecnico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_acesso_tecnico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_positions: {
        Row: {
          created_at: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          precisao: number | null
          tracking_session_id: string
          velocidade: number | null
        }
        Insert: {
          created_at?: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          precisao?: number | null
          tracking_session_id: string
          velocidade?: number | null
        }
        Update: {
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          precisao?: number | null
          tracking_session_id?: string
          velocidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_positions_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: false
            referencedRelation: "tracking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_sessions: {
        Row: {
          agendamento_id: string
          chegou_em: string | null
          concluido_em: string | null
          created_at: string
          destino_latitude: number | null
          destino_longitude: number | null
          distancia_metros: number | null
          eta_minutos: number | null
          id: string
          iniciado_em: string
          origem_latitude: number | null
          origem_longitude: number | null
          status: string
          tecnico_id: string
          tecnico_nome: string | null
          token_publico: string
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          chegou_em?: string | null
          concluido_em?: string | null
          created_at?: string
          destino_latitude?: number | null
          destino_longitude?: number | null
          distancia_metros?: number | null
          eta_minutos?: number | null
          id?: string
          iniciado_em?: string
          origem_latitude?: number | null
          origem_longitude?: number | null
          status?: string
          tecnico_id: string
          tecnico_nome?: string | null
          token_publico?: string
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          chegou_em?: string | null
          concluido_em?: string | null
          created_at?: string
          destino_latitude?: number | null
          destino_longitude?: number | null
          distancia_metros?: number | null
          eta_minutos?: number | null
          id?: string
          iniciado_em?: string
          origem_latitude?: number | null
          origem_longitude?: number | null
          status?: string
          tecnico_id?: string
          tecnico_nome?: string | null
          token_publico?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      upsells: {
        Row: {
          aplicavel_a: string[] | null
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          aplicavel_a?: string[] | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          aplicavel_a?: string[] | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upsells_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_campanhas_resumo: {
        Row: {
          campanha: string
          cpa: number | null
          created_at: string | null
          custo_ads: number | null
          id: string
          periodo: string
          roas: number | null
          tenant_id: string | null
          total_reembolsos: number | null
          total_valor: number | null
          total_vendas: number | null
          updated_at: string | null
          valor_reembolsos: number | null
        }
        Insert: {
          campanha: string
          cpa?: number | null
          created_at?: string | null
          custo_ads?: number | null
          id?: string
          periodo: string
          roas?: number | null
          tenant_id?: string | null
          total_reembolsos?: number | null
          total_valor?: number | null
          total_vendas?: number | null
          updated_at?: string | null
          valor_reembolsos?: number | null
        }
        Update: {
          campanha?: string
          cpa?: number | null
          created_at?: string | null
          custo_ads?: number | null
          id?: string
          periodo?: string
          roas?: number | null
          tenant_id?: string | null
          total_reembolsos?: number | null
          total_valor?: number | null
          total_vendas?: number | null
          updated_at?: string | null
          valor_reembolsos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "utmify_campanhas_resumo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_envios: {
        Row: {
          agendamento_id: string
          created_at: string | null
          erro_mensagem: string | null
          id: string
          status_enviado: string
          sucesso: boolean | null
          tenant_id: string | null
          utmify_response: Json | null
        }
        Insert: {
          agendamento_id: string
          created_at?: string | null
          erro_mensagem?: string | null
          id?: string
          status_enviado: string
          sucesso?: boolean | null
          tenant_id?: string | null
          utmify_response?: Json | null
        }
        Update: {
          agendamento_id?: string
          created_at?: string | null
          erro_mensagem?: string | null
          id?: string
          status_enviado?: string
          sucesso?: boolean | null
          tenant_id?: string | null
          utmify_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "utmify_envios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utmify_envios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_events: {
        Row: {
          ad_name: string | null
          ad_set: string | null
          campanha: string | null
          created_at: string | null
          custo_campanha: number | null
          id: string
          order_id: string | null
          payload_raw: Json | null
          plataforma: string | null
          status: string
          tenant_id: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          valor: number | null
        }
        Insert: {
          ad_name?: string | null
          ad_set?: string | null
          campanha?: string | null
          created_at?: string | null
          custo_campanha?: number | null
          id?: string
          order_id?: string | null
          payload_raw?: Json | null
          plataforma?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor?: number | null
        }
        Update: {
          ad_name?: string | null
          ad_set?: string | null
          campanha?: string | null
          created_at?: string | null
          custo_campanha?: number | null
          id?: string
          order_id?: string | null
          payload_raw?: Json | null
          plataforma?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "utmify_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          criado_em: string | null
          evento: string
          id: string
          payload: Json
          resposta_body: string | null
          resposta_status: number | null
          sucesso: boolean | null
          webhook_id: string | null
        }
        Insert: {
          criado_em?: string | null
          evento: string
          id?: string
          payload: Json
          resposta_body?: string | null
          resposta_status?: number | null
          sucesso?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          criado_em?: string | null
          evento?: string
          id?: string
          payload?: Json
          resposta_body?: string | null
          resposta_status?: number | null
          sucesso?: boolean | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "integracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversas: {
        Row: {
          contexto: Json | null
          criado_em: string | null
          estado_atual: string
          finalizado: boolean | null
          id: string
          nome_cliente: string | null
          telefone: string
          tenant_id: string | null
          ultima_mensagem: string | null
        }
        Insert: {
          contexto?: Json | null
          criado_em?: string | null
          estado_atual?: string
          finalizado?: boolean | null
          id?: string
          nome_cliente?: string | null
          telefone: string
          tenant_id?: string | null
          ultima_mensagem?: string | null
        }
        Update: {
          contexto?: Json | null
          criado_em?: string | null
          estado_atual?: string
          finalizado?: boolean | null
          id?: string
          nome_cliente?: string | null
          telefone?: string
          tenant_id?: string | null
          ultima_mensagem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversas_backup_20251124: {
        Row: {
          contexto: Json | null
          criado_em: string | null
          estado_atual: string | null
          finalizado: boolean | null
          id: string | null
          nome_cliente: string | null
          telefone: string | null
          ultima_mensagem: string | null
        }
        Insert: {
          contexto?: Json | null
          criado_em?: string | null
          estado_atual?: string | null
          finalizado?: boolean | null
          id?: string | null
          nome_cliente?: string | null
          telefone?: string | null
          ultima_mensagem?: string | null
        }
        Update: {
          contexto?: Json | null
          criado_em?: string | null
          estado_atual?: string | null
          finalizado?: boolean | null
          id?: string | null
          nome_cliente?: string | null
          telefone?: string | null
          ultima_mensagem?: string | null
        }
        Relationships: []
      }
      whatsapp_envios_log: {
        Row: {
          conversa_id: string | null
          created_at: string | null
          erro_detalhes: Json | null
          id: string
          mensagem: string
          status_code: number | null
          sucesso: boolean | null
          telefone: string
          tentativas: number | null
        }
        Insert: {
          conversa_id?: string | null
          created_at?: string | null
          erro_detalhes?: Json | null
          id?: string
          mensagem: string
          status_code?: number | null
          sucesso?: boolean | null
          telefone: string
          tentativas?: number | null
        }
        Update: {
          conversa_id?: string | null
          created_at?: string | null
          erro_detalhes?: Json | null
          id?: string
          mensagem?: string
          status_code?: number | null
          sucesso?: boolean | null
          telefone?: string
          tentativas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_envios_log_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_financeiro_log: {
        Row: {
          analise_ia: Json | null
          arquivo_url: string | null
          conteudo_original: string | null
          created_at: string
          despesa_id: string | null
          erro_mensagem: string | null
          funcionario_bot_id: string | null
          id: string
          lancamento_id: string | null
          processamento_status: string
          tabela_origem: string | null
          telefone_remetente: string
          tipo_lancamento: string | null
          tipo_mensagem: string
          transcricao_ia: string | null
          updated_at: string
        }
        Insert: {
          analise_ia?: Json | null
          arquivo_url?: string | null
          conteudo_original?: string | null
          created_at?: string
          despesa_id?: string | null
          erro_mensagem?: string | null
          funcionario_bot_id?: string | null
          id?: string
          lancamento_id?: string | null
          processamento_status?: string
          tabela_origem?: string | null
          telefone_remetente: string
          tipo_lancamento?: string | null
          tipo_mensagem: string
          transcricao_ia?: string | null
          updated_at?: string
        }
        Update: {
          analise_ia?: Json | null
          arquivo_url?: string | null
          conteudo_original?: string | null
          created_at?: string
          despesa_id?: string | null
          erro_mensagem?: string | null
          funcionario_bot_id?: string | null
          id?: string
          lancamento_id?: string | null
          processamento_status?: string
          tabela_origem?: string | null
          telefone_remetente?: string
          tipo_lancamento?: string | null
          tipo_mensagem?: string
          transcricao_ia?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_despesas_log_despesa_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_financeiro_log_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_financeiro_log_funcionario_bot_id_fkey"
            columns: ["funcionario_bot_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_bot"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_health_checks: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          instance_id: string | null
          instance_type: string
          is_healthy: boolean
          latency_ms: number | null
          status: string
          substatus: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          instance_id?: string | null
          instance_type?: string
          is_healthy?: boolean
          latency_ms?: number | null
          status?: string
          substatus?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          instance_id?: string | null
          instance_type?: string
          is_healthy?: boolean
          latency_ms?: number | null
          status?: string
          substatus?: string | null
        }
        Relationships: []
      }
      whatsapp_lembretes: {
        Row: {
          agendado_para: string
          agendamento_id: string | null
          criado_em: string | null
          enviado: boolean | null
          enviado_em: string | null
          erro: string | null
          id: string
          mensagem: string | null
          tipo: string
        }
        Insert: {
          agendado_para: string
          agendamento_id?: string | null
          criado_em?: string | null
          enviado?: boolean | null
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem?: string | null
          tipo: string
        }
        Update: {
          agendado_para?: string
          agendamento_id?: string | null
          criado_em?: string | null
          enviado?: boolean | null
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_lembretes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensagens: {
        Row: {
          conteudo: string | null
          conversa_id: string | null
          criado_em: string | null
          direcao: string
          id: string
          imagem_url: string | null
          metadata: Json | null
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          conteudo?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          direcao: string
          id?: string
          imagem_url?: string | null
          metadata?: Json | null
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          conteudo?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          direcao?: string
          id?: string
          imagem_url?: string | null
          metadata?: Json | null
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_mensagens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensagens_backup_20251124: {
        Row: {
          conteudo: string | null
          conversa_id: string | null
          criado_em: string | null
          direcao: string | null
          id: string | null
          imagem_url: string | null
          metadata: Json | null
          tipo: string | null
        }
        Insert: {
          conteudo?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          direcao?: string | null
          id?: string | null
          imagem_url?: string | null
          metadata?: Json | null
          tipo?: string | null
        }
        Update: {
          conteudo?: string | null
          conversa_id?: string | null
          criado_em?: string | null
          direcao?: string | null
          id?: string | null
          imagem_url?: string | null
          metadata?: Json | null
          tipo?: string | null
        }
        Relationships: []
      }
      whatsapp_mensagens_processadas: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          processado_em: string | null
          telefone: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          processado_em?: string | null
          telefone: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          processado_em?: string | null
          telefone?: string
        }
        Relationships: []
      }
      whatsapp_numeros: {
        Row: {
          criado_em: string | null
          id: string
          nome_negocio: string | null
          numero: string
          qr_code: string | null
          session_data: Json | null
          status: string | null
          ultimo_uso: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nome_negocio?: string | null
          numero: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string | null
          ultimo_uso?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          nome_negocio?: string | null
          numero?: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string | null
          ultimo_uso?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      profiles_safe: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          id: string | null
          nome_completo: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id?: string | null
          nome_completo?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id?: string | null
          nome_completo?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_cashflow_daily: {
        Row: {
          data: string | null
          entradas: number | null
          saidas: number | null
          saldo: number | null
          saldo_acumulado: number | null
        }
        Relationships: []
      }
      vw_expenses_by_category: {
        Row: {
          categoria: string | null
          quantidade: number | null
          total: number | null
        }
        Relationships: []
      }
      vw_finance_summary: {
        Row: {
          data: string | null
          despesas_pagas: number | null
          receita_realizada: number | null
          reembolsos: number | null
          saldo_dia: number | null
        }
        Relationships: []
      }
      vw_receipts_by_method: {
        Row: {
          forma: string | null
          quantidade: number | null
          total: number | null
        }
        Relationships: []
      }
      vw_saas_dashboard: {
        Row: {
          churn_mes: number | null
          clientes_ativos: number | null
          clientes_inadimplentes: number | null
          clientes_trial: number | null
          mrr: number | null
          mrr_enterprise: number | null
          mrr_professional: number | null
          mrr_starter: number | null
          total_tenants: number | null
          trials_expirando: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      atualizar_metricas_crm_cliente: {
        Args: { p_telefone: string }
        Returns: undefined
      }
      can_use_feature: {
        Args: { p_feature_key: string; p_tenant_id?: string }
        Returns: Json
      }
      can_use_feature_simple: {
        Args: { p_feature_key: string; p_tenant_id?: string }
        Returns: boolean
      }
      check_resource_limit: {
        Args: {
          p_increment?: number
          p_resource_key: string
          p_tenant_id?: string
        }
        Returns: Json
      }
      check_tenant_limit: {
        Args: { p_resource: string; p_tenant_id: string }
        Returns: boolean
      }
      cleanup_mensagens_antigas: { Args: never; Returns: undefined }
      cleanup_old_data: { Args: never; Returns: undefined }
      cleanup_old_data_scheduled: { Args: never; Returns: undefined }
      clear_impersonation_tenant: { Args: never; Returns: boolean }
      detect_suspicious_activity: { Args: never; Returns: undefined }
      finalizar_conversas_orfas: { Args: never; Returns: number }
      get_master_tenant_id: { Args: never; Returns: string }
      get_parceiro_id: { Args: { _user_id: string }; Returns: string }
      get_tenant_filiais: {
        Args: { p_tenant_id: string }
        Returns: {
          id: string
          nome_empresa: string
          nome_fantasia: string
          plano: Database["public"]["Enums"]["saas_plano"]
          status: Database["public"]["Enums"]["saas_tenant_status"]
        }[]
      }
      get_tenant_modules: {
        Args: { p_tenant_id: string }
        Returns: {
          ativado_em: string
          codigo: string
          modulo_id: string
          nome: string
          preco_base: number
          preco_negociado: number
        }[]
      }
      get_tenant_usage: { Args: { p_tenant_id: string }; Returns: Json }
      get_user_tenant_id: { Args: { _user_id?: string }; Returns: string }
      has_module: {
        Args: { p_modulo_codigo: string; p_tenant_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_for_tenant: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_in_tenant: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tenant_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      identificar_genero: { Args: { nome: string }; Returns: string }
      increment_canal_cliques: {
        Args: { canal_codigo: string }
        Returns: undefined
      }
      increment_cupom_uso: { Args: { cupom_id: string }; Returns: undefined }
      increment_link_cliques: {
        Args: { link_codigo: string }
        Returns: undefined
      }
      is_franqueador: { Args: { p_tenant_id: string }; Returns: boolean }
      is_master_user: { Args: { _user_id: string }; Returns: boolean }
      is_parceiro: { Args: { _user_id: string }; Returns: boolean }
      is_parceiro_ativo: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_tenant_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: string
      }
      refresh_tenant_usage_metrics: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      require_tenant_context: { Args: never; Returns: boolean }
      set_impersonation_tenant: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      verificar_consistencia_ledger: {
        Args: never
        Returns: {
          inconsistencias_in: number
          inconsistencias_out: number
          inconsistencias_reembolso: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "operador"
        | "visualizador"
        | "tecnico"
        | "parceiro"
        | "super_admin"
      saas_payment_status: "pago" | "pendente" | "atrasado" | "cancelado"
      saas_plano: "starter" | "professional" | "enterprise"
      saas_tenant_status:
        | "trial"
        | "ativo"
        | "inadimplente"
        | "cancelado"
        | "pausado"
      tipo_aplicacao_cupom: "todos" | "servicos_limpeza" | "combos" | "alugueis"
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
      app_role: [
        "admin",
        "operador",
        "visualizador",
        "tecnico",
        "parceiro",
        "super_admin",
      ],
      saas_payment_status: ["pago", "pendente", "atrasado", "cancelado"],
      saas_plano: ["starter", "professional", "enterprise"],
      saas_tenant_status: [
        "trial",
        "ativo",
        "inadimplente",
        "cancelado",
        "pausado",
      ],
      tipo_aplicacao_cupom: ["todos", "servicos_limpeza", "combos", "alugueis"],
    },
  },
} as const
