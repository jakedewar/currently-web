import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface InvitationEmailData {
  to: string
  organizationName: string
  inviterName: string
  role: string
  invitationLink: string
  expiresAt: string
}

export async function sendInvitationEmail(data: InvitationEmailData) {
  try {
    const { to, organizationName, inviterName, role, invitationLink, expiresAt } = data
    
    const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const { data: emailData, error } = await resend.emails.send({
      from: 'Currently <invitations@info.currently.team>',
      to: [to],
      subject: `You're invited to join ${organizationName} on Currently`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're invited to join ${organizationName} on Currently</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .email-wrapper {
              padding: 40px 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 0;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 600px;
              width: 100%;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
              letter-spacing: -0.5px;
            }
            .logo::after {
              content: '⚡';
              margin-left: 8px;
              font-size: 24px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin: 0;
              position: relative;
              z-index: 1;
              line-height: 1.3;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
              margin-top: 8px;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #374151;
            }
            .invitation-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              position: relative;
            }
            .invitation-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #2563eb, #1d4ed8, #7c3aed);
              border-radius: 12px 12px 0 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
              padding: 8px 0;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-label {
              font-weight: 600;
              color: #64748b;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-value {
              color: #1e293b;
              font-weight: 600;
              font-size: 15px;
            }
            .role-badge {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 12px;
              font-weight: 700;
              font-size: 16px;
              text-align: center;
              box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .cta-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            .cta-button:hover::before {
              left: 100%;
            }
            .security-note {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              position: relative;
            }
            .security-note::before {
              content: '🔒';
              position: absolute;
              top: 16px;
              left: 16px;
              font-size: 18px;
            }
            .security-note-content {
              margin-left: 32px;
            }
            .security-title {
              font-weight: 700;
              color: #92400e;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .security-text {
              color: #92400e;
              font-size: 14px;
              line-height: 1.5;
            }
            .fallback-link {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              word-break: break-all;
              color: #64748b;
              font-size: 13px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-text {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .footer-link {
              color: #2563eb;
              text-decoration: none;
            }
            .footer-link:hover {
              text-decoration: underline;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
              margin: 24px 0;
            }
            @media (max-width: 600px) {
              .email-wrapper {
                padding: 20px 10px;
              }
              .container {
                border-radius: 12px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .footer {
                padding: 20px;
              }
              .title {
                font-size: 20px;
              }
              .logo {
                font-size: 28px;
              }
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">Currently</div>
                <h1 class="title">You're Invited!</h1>
                <p class="subtitle">Join ${organizationName} and start collaborating</p>
              </div>
              
              <div class="content">
                <div class="greeting">
                  Hello there! 👋
                </div>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Currently as a <span class="role-badge">${role}</span>.
                </p>
                
                <div class="invitation-card">
                  <div class="detail-row">
                    <span class="detail-label">Organization</span>
                    <span class="detail-value">${organizationName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Your Role</span>
                    <span class="detail-value">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Invited By</span>
                    <span class="detail-value">${inviterName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Expires</span>
                    <span class="detail-value">${expiresDate}</span>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="${invitationLink}" class="cta-button">
                    Accept Invitation →
                  </a>
                </div>
                
                <div class="divider"></div>
                
                <div class="security-note">
                  <div class="security-note-content">
                    <div class="security-title">Security Notice</div>
                    <div class="security-text">
                      This invitation is personal and secure. If you didn't expect this invitation, you can safely ignore this email. Never share invitation links with others.
                    </div>
                  </div>
                </div>
                
                <p style="font-size: 14px; color: #64748b; margin: 20px 0 8px 0;">
                  If the button doesn't work, copy and paste this link:
                </p>
                <div class="fallback-link">${invitationLink}</div>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  This invitation was sent by <a href="https://currently.team" class="footer-link">Currently</a>
                </p>
                <p class="footer-text">
                  Questions? Contact your organization administrator or reply to this email.
                </p>
                <p class="footer-text" style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Currently. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      return { success: false, error: error.message }
    }

    console.log('Invitation email sent successfully:', emailData?.id)
    return { success: true, emailId: emailData?.id }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendInvitationReminderEmail(data: InvitationEmailData) {
  try {
    const { to, organizationName, inviterName, role, invitationLink, expiresAt } = data
    
    const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const { data: emailData, error } = await resend.emails.send({
      from: 'Currently <invitations@info.currently.team>',
      to: [to],
      subject: `Reminder: Join ${organizationName} on Currently`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder: Join ${organizationName} on Currently</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              min-height: 100vh;
            }
            .email-wrapper {
              padding: 40px 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 0;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 600px;
              width: 100%;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
              letter-spacing: -0.5px;
            }
            .logo::after {
              content: '⚡';
              margin-left: 8px;
              font-size: 24px;
            }
            .reminder-badge {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              display: inline-block;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              position: relative;
              z-index: 1;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin: 0;
              position: relative;
              z-index: 1;
              line-height: 1.3;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
              margin-top: 8px;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #374151;
            }
            .invitation-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              position: relative;
            }
            .invitation-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #f59e0b, #d97706, #b45309);
              border-radius: 12px 12px 0 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
              padding: 8px 0;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-label {
              font-weight: 600;
              color: #64748b;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-value {
              color: #1e293b;
              font-weight: 600;
              font-size: 15px;
            }
            .role-badge {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 12px;
              font-weight: 700;
              font-size: 16px;
              text-align: center;
              box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .cta-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            .cta-button:hover::before {
              left: 100%;
            }
            .expiry-warning {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border: 1px solid #fca5a5;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              position: relative;
            }
            .expiry-warning::before {
              content: '⏰';
              position: absolute;
              top: 16px;
              left: 16px;
              font-size: 18px;
            }
            .expiry-warning-content {
              margin-left: 32px;
            }
            .expiry-title {
              font-weight: 700;
              color: #dc2626;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .expiry-text {
              color: #dc2626;
              font-size: 14px;
              line-height: 1.5;
            }
            .fallback-link {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              word-break: break-all;
              color: #64748b;
              font-size: 13px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-text {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .footer-link {
              color: #f59e0b;
              text-decoration: none;
            }
            .footer-link:hover {
              text-decoration: underline;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
              margin: 24px 0;
            }
            @media (max-width: 600px) {
              .email-wrapper {
                padding: 20px 10px;
              }
              .container {
                border-radius: 12px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .footer {
                padding: 20px;
              }
              .title {
                font-size: 20px;
              }
              .logo {
                font-size: 28px;
              }
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">Currently</div>
                <div class="reminder-badge">Reminder</div>
                <h1 class="title">Don't Miss Out!</h1>
                <p class="subtitle">Your invitation to ${organizationName} expires soon</p>
              </div>
              
              <div class="content">
                <div class="greeting">
                  Hello again! 👋
                </div>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  This is a friendly reminder that <strong>${inviterName}</strong> invited you to join <strong>${organizationName}</strong> on Currently as a <span class="role-badge">${role}</span>.
                </p>
                
                <div class="invitation-card">
                  <div class="detail-row">
                    <span class="detail-label">Organization</span>
                    <span class="detail-value">${organizationName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Your Role</span>
                    <span class="detail-value">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Invited By</span>
                    <span class="detail-value">${inviterName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Expires</span>
                    <span class="detail-value">${expiresDate}</span>
                  </div>
                </div>
                
                <div class="expiry-warning">
                  <div class="expiry-warning-content">
                    <div class="expiry-title">Time Sensitive</div>
                    <div class="expiry-text">
                      This invitation will expire on ${expiresDate}. Don't miss out on joining your team!
                    </div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="${invitationLink}" class="cta-button">
                    Accept Invitation Now →
                  </a>
                </div>
                
                <div class="divider"></div>
                
                <p style="font-size: 14px; color: #64748b; margin: 20px 0 8px 0;">
                  If the button doesn't work, copy and paste this link:
                </p>
                <div class="fallback-link">${invitationLink}</div>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  This reminder was sent by <a href="https://currently.team" class="footer-link">Currently</a>.
                </p>
                <p class="footer-text">
                  Questions? Contact your organization administrator or reply to this email.
                </p>
                <p class="footer-text" style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Currently. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send invitation reminder email:', error)
      return { success: false, error: error.message }
    }

    console.log('Invitation reminder email sent successfully:', emailData?.id)
    return { success: true, emailId: emailData?.id }
  } catch (error) {
    console.error('Error sending invitation reminder email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
