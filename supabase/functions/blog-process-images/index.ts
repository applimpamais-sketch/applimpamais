 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 interface ImageData {
   prompt: string;
   url?: string;
   wp_media_id?: number;
 }
 
 interface ImagesResult {
   hero: ImageData | null;
   inline: ImageData[];
 }
 
 // Helper function to delay execution
 const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 
 // Generate image using Lovable AI
 async function generateImage(prompt: string, LOVABLE_API_KEY: string): Promise<string | null> {
   console.log('[blog-process-images] Generating image for:', prompt.substring(0, 100));
   
   try {
     const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: 'google/gemini-2.5-flash-image',
         messages: [{
           role: 'user',
           content: `Gere uma imagem fotorrealista de alta qualidade para um blog sobre limpeza de estofados e casa:
 
 ${prompt}
 
 Estilo: fotografia profissional, cores naturais e vibrantes, boa iluminação ambiente, ambiente limpo e aconchegante, alta resolução.
 IMPORTANTE: NÃO inclua nenhum texto, letras, palavras ou números na imagem.`
         }],
         modalities: ['image', 'text']
       })
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         console.log('[blog-process-images] Rate limited, waiting 10s...');
         await delay(10000);
         return generateImage(prompt, LOVABLE_API_KEY); // Retry once
       }
       console.error('[blog-process-images] AI API error:', response.status);
       return null;
     }
 
     const data = await response.json();
     const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
     
     if (!imageUrl) {
       console.error('[blog-process-images] No image in response');
       return null;
     }
 
     return imageUrl;
   } catch (error) {
     console.error('[blog-process-images] Error generating image:', error);
     return null;
   }
 }
 
 // Upload image to WordPress Media Library
 async function uploadToWordPress(
   base64DataUrl: string, 
   filename: string,
   wpUrl: string, 
   credentials: string,
   altText: string
 ): Promise<{ id: number; url: string } | null> {
   console.log('[blog-process-images] Uploading to WordPress:', filename);
   
   try {
     // Extract base64 data and mime type
     const matches = base64DataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
     if (!matches) {
       console.error('[blog-process-images] Invalid base64 data URL');
       return null;
     }
     
     const [, imageType, base64Data] = matches;
     const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
     
     // Determine content type
     const contentType = `image/${imageType === 'jpg' ? 'jpeg' : imageType}`;
     const fileExtension = imageType === 'jpeg' ? 'jpg' : imageType;
     const finalFilename = `${filename}.${fileExtension}`;
     
     // Upload directly as binary
     const uploadResponse = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
       method: 'POST',
       headers: {
         'Authorization': `Basic ${credentials}`,
         'Content-Type': contentType,
         'Content-Disposition': `attachment; filename="${finalFilename}"`,
       },
       body: binaryData
     });
 
     if (!uploadResponse.ok) {
       const errorText = await uploadResponse.text();
       console.error('[blog-process-images] WordPress upload error:', uploadResponse.status, errorText);
       return null;
     }
 
     const mediaData = await uploadResponse.json();
     console.log('[blog-process-images] Upload successful, media ID:', mediaData.id);
     
     // Update alt text
     if (mediaData.id) {
       await fetch(`${wpUrl}/wp-json/wp/v2/media/${mediaData.id}`, {
         method: 'POST',
         headers: {
           'Authorization': `Basic ${credentials}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ alt_text: altText })
       });
     }
 
     return {
       id: mediaData.id,
       url: mediaData.source_url
     };
   } catch (error) {
     console.error('[blog-process-images] Upload error:', error);
     return null;
   }
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { post_id } = await req.json();
     console.log('[blog-process-images] Processing images for post:', post_id);
 
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
     );
 
     const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
     if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
 
     // Get post data
     const { data: post, error: postError } = await supabase
       .from('blog_posts_queue')
       .select('*')
       .eq('id', post_id)
       .single();
 
     if (postError || !post) {
       throw new Error('Post not found');
     }
 
     // Check if images already processed
     const existingImages = post.images as ImagesResult | string[] | null;
     if (existingImages && typeof existingImages === 'object' && 'hero' in existingImages && existingImages.hero?.url) {
       console.log('[blog-process-images] Images already processed');
       return new Response(JSON.stringify({ 
         success: true, 
         message: 'Images already processed',
         images: existingImages 
       }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
     }
 
     // Get WordPress config
     const { data: configs } = await supabase
       .from('blog_config')
       .select('key, value');
 
     const configMap: Record<string, any> = {};
     configs?.forEach((c: any) => { configMap[c.key] = c.value; });
 
     const wpUrl = configMap.wordpress_url;
     const wpUsername = configMap.wordpress_username;
     const wpPassword = Deno.env.get('WP_APP_PASSWORD');
 
     if (!wpUrl || !wpUsername || !wpPassword) {
       throw new Error('WordPress configuration incomplete');
     }
 
     const credentials = btoa(`${wpUsername}:${wpPassword}`);
 
     // Extract image prompts from content or stored prompts
     let imagePrompts: string[] = [];
     
     // Check if images field contains prompts (array of strings)
     if (Array.isArray(existingImages)) {
       imagePrompts = existingImages.filter(p => typeof p === 'string');
     }
     
     // Also extract from content_html placeholders
     const content = post.content_html || '';
     const heroMatch = content.match(/\[IMAGEM_HERO:\s*([^\]]+)\]/);
     const inlineMatches = [...content.matchAll(/\[IMAGEM:\s*([^\]]+)\]/g)];
 
     // Build prompts list
     const heroPrompt = heroMatch?.[1] || imagePrompts[0] || `Imagem hero para artigo sobre ${post.chosen_keyword}`;
     const inlinePrompts: string[] = [];
     
     // Use placeholders from content or stored prompts
     for (let i = 0; i < 2; i++) {
       if (inlineMatches[i]) {
         inlinePrompts.push(inlineMatches[i][1]);
       } else if (imagePrompts[i + 1]) {
         inlinePrompts.push(imagePrompts[i + 1]);
       }
     }
 
     // If no inline prompts found, generate generic ones
     if (inlinePrompts.length === 0) {
       inlinePrompts.push(`Processo de limpeza profissional de ${post.chosen_keyword}`);
       inlinePrompts.push(`Resultado final de limpeza de estofado, ambiente limpo e aconchegante`);
     }
 
     console.log('[blog-process-images] Prompts:', { hero: heroPrompt, inline: inlinePrompts });
 
     // Update status
     await supabase.from('blog_posts_queue')
       .update({ status: 'processing_images' })
       .eq('id', post_id);
 
     const result: ImagesResult = {
       hero: null,
       inline: []
     };
 
     let updatedContent = content;
     const postSlug = post.slug || 'post';
 
     // Generate and upload hero image
     console.log('[blog-process-images] Generating hero image...');
     const heroImageBase64 = await generateImage(heroPrompt, LOVABLE_API_KEY);
     
     if (heroImageBase64) {
       const heroUpload = await uploadToWordPress(
         heroImageBase64,
         `${postSlug}-hero`,
         wpUrl,
         credentials,
         heroPrompt
       );
       
       if (heroUpload) {
         result.hero = {
           prompt: heroPrompt,
           url: heroUpload.url,
           wp_media_id: heroUpload.id
         };
         
         // Replace placeholder with actual image
         const heroImgTag = `<figure style="margin: 20px 0; text-align: center;">
   <img src="${heroUpload.url}" alt="${heroPrompt}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
 </figure>`;
         
         if (heroMatch) {
           updatedContent = updatedContent.replace(heroMatch[0], heroImgTag);
         } else {
           // Insert after first paragraph if no placeholder
           const firstPEnd = updatedContent.indexOf('</p>');
           if (firstPEnd > 0) {
             updatedContent = updatedContent.slice(0, firstPEnd + 4) + heroImgTag + updatedContent.slice(firstPEnd + 4);
           }
         }
       }
     }
 
     // Delay between image generations
     await delay(3000);
 
     // Generate and upload inline images
     for (let i = 0; i < inlinePrompts.length; i++) {
       console.log(`[blog-process-images] Generating inline image ${i + 1}...`);
       
       const inlineImageBase64 = await generateImage(inlinePrompts[i], LOVABLE_API_KEY);
       
       if (inlineImageBase64) {
         const inlineUpload = await uploadToWordPress(
           inlineImageBase64,
           `${postSlug}-img-${i + 1}`,
           wpUrl,
           credentials,
           inlinePrompts[i]
         );
         
         if (inlineUpload) {
           result.inline.push({
             prompt: inlinePrompts[i],
             url: inlineUpload.url,
             wp_media_id: inlineUpload.id
           });
           
           // Replace placeholder
           const inlineImgTag = `<figure style="margin: 25px 0; text-align: center;">
   <img src="${inlineUpload.url}" alt="${inlinePrompts[i]}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);" />
 </figure>`;
           
           if (inlineMatches[i]) {
             updatedContent = updatedContent.replace(inlineMatches[i][0], inlineImgTag);
           }
         }
       }
       
       // Delay between images
       if (i < inlinePrompts.length - 1) {
         await delay(3000);
       }
     }
 
     // Remove any remaining placeholders
     updatedContent = updatedContent.replace(/\[IMAGEM_HERO:[^\]]+\]/g, '');
     updatedContent = updatedContent.replace(/\[IMAGEM:[^\]]+\]/g, '');
 
     // Update post with processed images and content
     await supabase.from('blog_posts_queue')
       .update({
         images: result,
         content_html: updatedContent,
         status: 'ready'
       })
       .eq('id', post_id);
 
     console.log('[blog-process-images] Processing complete:', {
       hero: !!result.hero,
       inlineCount: result.inline.length
     });
 
     return new Response(JSON.stringify({
       success: true,
       images: result,
       hero_media_id: result.hero?.wp_media_id || null
     }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
     });
 
   } catch (error) {
     console.error('[blog-process-images] Error:', error);
     return new Response(JSON.stringify({ 
       error: error instanceof Error ? error.message : 'Unknown error' 
     }), {
       status: 500,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
     });
   }
 });