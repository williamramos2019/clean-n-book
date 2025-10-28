import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppNotification {
  phone: string;
  date: string;
  time: string;
  location: string;
  observations?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, date, time, location, observations }: WhatsAppNotification = await req.json();

    console.log('Sending WhatsApp notification:', { phone, date, time, location });

    // Format the message
    const message = `🧼 *Novo Agendamento de Limpeza*

📅 Data: ${date}
⏰ Horário: ${time}
📍 Local: ${location}
${observations ? `📝 Observações: ${observations}` : ''}

Contato do cliente: ${phone || 'Não informado'}`;

    // WhatsApp number to send to (your business number)
    const businessPhone = '5531980252821'; // Format: country code + number without spaces
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp Web URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessPhone}&text=${encodedMessage}`;

    console.log('WhatsApp URL generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification prepared',
        whatsappUrl 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-whatsapp-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
