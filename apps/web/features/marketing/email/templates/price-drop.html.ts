export const PRICE_DROP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Limited Time Price Alert</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08);">
          
          <!-- Urgent Alert Header -->
          <tr>
            <td style="background-color: #881337; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: #be123c; border-radius: 999px; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ⚡ 48-Hour Spot Booking Window
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                Exclusive Price Advantage: {{project.name}}
              </h1>
              <p style="color: #fecdd3; font-size: 14px; margin: 0;">
                Save up to ₹5.0 Lakhs on select premium inventory
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Hello {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                For the next 48 hours, our developer partners have released a private allocation of high-floor residences at <strong>{{project.name}}</strong> with a guaranteed spot discount and flexible payment timeline.
              </p>

              <!-- Benefits Card -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9f1239;">Special Festive Price</div>
                          <div style="font-size: 20px; font-weight: 800; color: #881337; margin-top: 2px;">Starting from {{project.startingPrice}}*</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #4c0519; line-height: 1.5;">
                          🎁 <strong>Zero Stamp Duty</strong> for the first 10 confirmed spot bookings.<br>
                          🎁 <strong>Complimentary Modular Kitchen</strong> and Italian marble upgrades.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/discounts" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
                      Lock Your Festive Discount & Inventory Sheet →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Connect directly with our closing desk:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • <strong style="color: #e11d48;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6;">
              <p style="margin: 0;">
                *Prices subject to unit availability. Terms & conditions apply. 
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
