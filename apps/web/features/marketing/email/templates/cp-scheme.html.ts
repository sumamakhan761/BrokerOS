export const CP_SCHEME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Channel Partner Commission Scheme</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e0e7ff; box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1e1b4b; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: rgba(99, 102, 241, 0.25); border: 1px solid rgba(99, 102, 241, 0.5); border-radius: 999px; color: #c7d2fe; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ✦ Channel Partner Network ✦
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                3.5% Spot Brokerage on {{project.name}}
              </h1>
              <p style="color: #c7d2fe; font-size: 14px; margin: 0;">
                Exclusive Partner Incentive Structure • Valid for Active Registrations
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear Partner Broker,
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                We are thrilled to roll out our enhanced Channel Partner Commission Matrix for <strong>{{project.name}}</strong>. Help your high-net-worth buyers secure prime inventory while you earn guaranteed spot payouts within 7 working days.
              </p>

              <!-- Commission Structure Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #3730a3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                      Commission Highlights & Fast Payouts:
                    </div>
                    <div style="font-size: 13px; color: #312e81; line-height: 1.6;">
                      ✦ <strong>3.5% Spot Payout:</strong> Released upon 10% payment milestone & Agreement.<br>
                      ✦ <strong>₹50,000 Milestone Bonus:</strong> On closing 3 or more bookings this month.<br>
                      ✦ <strong>90-Day Lead Protection:</strong> Register your client on the portal with full tag protection.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/partner-portal" target="_blank" style="display: inline-block; background-color: #4338ca; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(67, 56, 202, 0.35);">
                      Register Your Client on Partner Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sourcing Manager Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Dedicated Sourcing Manager:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • Direct Hotline: <strong style="color: #4338ca;">{{agent.phone}}</strong>
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
                Confidential to registered Channel Partners. 
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
