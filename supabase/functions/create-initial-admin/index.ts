import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando criação do admin inicial...');

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const ADMIN_EMAIL = Deno.env.get('INITIAL_ADMIN_EMAIL') ?? 'rclimpamais@gmail.com';
    const ADMIN_PASSWORD = Deno.env.get('INITIAL_ADMIN_PASSWORD') ?? crypto.randomUUID();

    // Check if admin already exists
    console.log('🔍 Verificando se admin já existe...');
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUser?.users?.some(user => user.email === ADMIN_EMAIL);

    if (adminExists) {
      console.log('✅ Admin já existe, nenhuma ação necessária');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin já existe',
          alreadyExists: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin user
    console.log('👤 Criando usuário admin...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        nome_completo: 'RC Limpa Mais Admin'
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError);
      throw createError;
    }

    console.log('✅ Usuário criado:', newUser.user.id);

    // Add admin role
    console.log('🔐 Adicionando role admin...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('❌ Erro ao adicionar role:', roleError);
      throw roleError;
    }

    console.log('✅ Role admin adicionada com sucesso!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin criado com sucesso!',
        userId: newUser.user.id,
        email: ADMIN_EMAIL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
