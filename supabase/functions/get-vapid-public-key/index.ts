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
    console.log('📧 Getting VAPID public key...');
    
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    
    if (!vapidPublicKey) {
      console.error('❌ VAPID_PUBLIC_KEY not found in secrets');
      throw new Error('VAPID_PUBLIC_KEY not configured');
    }

    console.log('✅ VAPID public key retrieved successfully');

    return new Response(
      JSON.stringify({ publicKey: vapidPublicKey }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('❌ Error getting VAPID public key:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get VAPID public key';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
