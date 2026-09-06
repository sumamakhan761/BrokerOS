export const SITE_VISIT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIP Site Visit Invitation</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 999px; color: #6ee7b7; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ✦ Concierge Experience ✦
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                You Are Invited to {{project.name}}
              </h1>
              <p style="color: #a7f3d0; font-size: 14px; margin: 0;">
                Private walkthrough of our designer show residence at {{project.location}}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                Pictures only reveal part of the story. We would love to host you and your family for a private, guided walkthrough of <strong>{{project.name}}</strong> to experience the panoramic natural light, expansive layouts, and completed club amenities firsthand.
              </p>

              <!-- 3-Step Experience -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                      Your VIP Tour Includes:
                    </div>
                    <div style="font-size: 13px; color: #14532d; line-height: 1.6;">
                      1. <strong>Chauffeur Pick-Up & Drop:</strong> Complimentary private car service from your residence.<br>
                      2. <strong>Designer Sample Flat:</strong> Walkthrough of furnished 2, 3 & 4 BHK layouts.<br>
                      3. <strong>Bespoke Pricing Consultation:</strong> 1-on-1 discussion on payment plans and custom unit alterations.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/schedule-visit" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);">
                      Schedule Your Private VIP Site Tour →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Your Dedicated Concierge Manager:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • Direct Hotline: <strong style="color: #059669;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">
                All site visits adhere to safety and security standards. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
