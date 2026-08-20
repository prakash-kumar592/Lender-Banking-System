const htmlContent =(name)=>{
    return (`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to BankingSystem</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    
                    <tr>
                        <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BankingSystem</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">Welcome aboard, ${name}!</h2>
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                                Hello ${name},
                                <br><br>
                                Thank you for opening an account with us. We are thrilled to have you here! Our platform is built to make managing your finances simple, secure, and smart.
                            </p>
                            
                            <div style="background-color: #f8fafc; border-left: 4px solid #2a5298; padding: 15px; margin-bottom: 30px; border-radius: 0 4px 4px 0;">
                                <h4 style="margin: 0 0 8px 0; color: #1e3c72; font-size: 16px;">What's next?</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.5;">
                                    <li>Explore your personalized dashboard</li>
                                    <li>Set up secure multi-factor authentication</li>
                                    <li>Initiate your first secure money transfer</li>
                                </ul>
                            </div>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="https://yourdomain.com/dashboard" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #2a5298; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none; border-radius: 5px; box-shadow: 0 3px 6px rgba(42,82,152,0.3);">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px; background-color: #f4f6f9; color: #888888; font-size: 12px; border-top: 1px solid #eef2f5;">
                            <p style="margin: 0 0 5px 0;">&copy; 2026 BankingSystem Inc. All rights reserved.</p>
                            <p style="margin: 0;">You received this email because you signed up for an account on our platform.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `)
} 

module.exports=htmlContent;