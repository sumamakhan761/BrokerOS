export const PROJECT_LAUNCH_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Project Launch</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Hero Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 32px; text-align: center;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; padding: 6px 14px; background-color: rgba(217, 119, 6, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 999px; color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">
                      ✦ Private Pre-Launch Preview ✦
                    </span>
                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.25; margin: 0 0 10px 0; letter-spacing: -0.02em;">
                      {{project.name}}
                    </h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                      Prime Luxury Residences at <strong style="color: #e2e8f0;">{{project.location}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                As a valued prospective homeowner, we are privileged to extend you priority access to the official pre-launch of <strong>{{project.name}}</strong>. Before public opening, you are invited to select premier inventory with panoramic horizon views and exclusive early-allotment pricing.
              </p>

              <!-- Highlight Box / Key Specs Grid -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Starting Price</div>
                          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">{{project.startingPrice}}</div>
                        </td>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Prime Location</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">{{project.location}}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Configurations</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">2, 3 & 4 BHK Luxury Suites</div>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Exclusive Club</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">30+ World-Class Amenities</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project Bullet Points -->
              <p style="margin: 0 0 12px 0; font-weight: 700; color: #0f172a;">
                What sets {{project.name}} apart:
              </p>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Unmatched Connectivity:</strong> Seamless access to key business hubs, airports & top international schools.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Resort-Style Architecture:</strong> Sky lounge, Olympic-length infinity pool, and 70% open green landscapes.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Pre-Launch Guarantee:</strong> Zero price escalation and locked spot-booking advantages.
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/brochure" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35); letter-spacing: 0.02em;">
                      Download Official Brochure & Price Sheet →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Agent Signature Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Direct Project Representative:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      <strong style="color: #334155;">{{agent.name}}</strong> | Direct Line: <strong style="color: #7c3aed;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                RERA Registered Development. All renderings and specifications are indicative.
              </p>
              <p style="margin: 0;">
                You received this email because you expressed interest in premium properties. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> anytime.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
