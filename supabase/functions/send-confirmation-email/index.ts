import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:3000'

serve(async (req) => {
  try {
    const { email, user_metadata } = await req.json()
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Generate confirmation URL using Supabase Auth
    const confirmationUrl = `${SITE_URL}/auth/confirm?email=${encodeURIComponent(email)}`
    
    const emailData = {
      from: 'noreply@yourdomain.com', // غير ده لـ domain بتاعك
      to: email,
      subject: 'تأكيد البريد الإلكتروني - منصة التعلم الرقمي',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تأكيد البريد الإلكتروني</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #49BBBD 0%, #136CB5 100%);
              margin: 0;
              padding: 20px;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              background: linear-gradient(135deg, #49BBBD, #136CB5);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
            }
            .title {
              color: #333;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .message {
              color: #666;
              line-height: 1.6;
              margin-bottom: 30px;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #49BBBD, #136CB5);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #999;
              font-size: 14px;
            }
            .user-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0;
              border-right: 4px solid #49BBBD;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">منصة التعلم الرقمي</div>
              <h1 class="title">مرحباً ${user_metadata?.name || 'عزيزي المستخدم'}!</h1>
            </div>
            
            <div class="message">
              شكراً لك على التسجيل في منصتنا! يرجى تأكيد بريدك الإلكتروني للمتابعة.
            </div>
            
            <div class="user-info">
              <strong>معلومات الحساب:</strong><br>
              الاسم: ${user_metadata?.name || 'غير محدد'}<br>
              البريد الإلكتروني: ${email}<br>
              نوع الحساب: ${user_metadata?.role === 'teacher' ? 'معلم' : 'طالب'}
            </div>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">
                تأكيد البريد الإلكتروني
              </a>
            </div>
            
            <div class="message" style="font-size: 14px; color: #888;">
              إذا لم يعمل الرابط أعلاه، يمكنك نسخ ولصق الرابط التالي في متصفحك:<br>
              <a href="${confirmationUrl}" style="color: #49BBBD; word-break: break-all;">${confirmationUrl}</a>
            </div>
            
            <div class="footer">
              <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
              <p>إذا لم تقم بالتسجيل، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال بريد التأكيد بنجاح',
        id: result.id 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'فشل في إرسال بريد التأكيد' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
