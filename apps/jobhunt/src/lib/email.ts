import { Resend } from 'resend';

// Lazy initialization to avoid build errors
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface JobAlert {
  title: string;
  company: string;
  fitScore: number;
  explanation: string;
  url: string;
}

interface SendJobAlertEmailParams {
  to: string;
  userName: string;
  jobs: JobAlert[];
}

export async function sendJobAlertEmail({ to, userName, jobs }: SendJobAlertEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return;
  }

  const resend = getResend();

  const jobsList = jobs
    .map(
      (job) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${job.title}</div>
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${job.company}</div>
          <div style="display: inline-block; background: ${job.fitScore >= 80 ? '#dcfce7' : '#dbeafe'}; color: ${job.fitScore >= 80 ? '#166534' : '#1e40af'}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
            ${job.fitScore}% Match
          </div>
          <p style="color: #4b5563; font-size: 14px; margin: 12px 0;">${job.explanation}</p>
          <a href="${job.url}" style="display: inline-block; background: #4f46e5; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            View Job
          </a>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #4f46e5; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 24px; margin-bottom: 16px;">
              ⚡
            </div>
            <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">
              New Job Matches for You!
            </h1>
          </div>

          <!-- Greeting -->
          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; margin: 0;">
              Hey ${userName}! 👋
            </p>
            <p style="color: #4b5563; font-size: 14px; margin: 12px 0 0 0;">
              We found <strong>${jobs.length} new job${jobs.length > 1 ? 's' : ''}</strong> that match your profile. Check them out!
            </p>
          </div>

          <!-- Jobs List -->
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              ${jobsList}
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jobhunt.app'}/dashboard"
               style="display: inline-block; background: #111827; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              View All Matches
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">
              You're receiving this because you signed up for JobHunt alerts.
            </p>
            <p style="margin: 8px 0 0 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jobhunt.app'}/settings" style="color: #6b7280;">
                Manage your notification preferences
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'JobHunt <alerts@jobhunt.app>',
      to: [to],
      subject: `🎯 ${jobs.length} New Job Match${jobs.length > 1 ? 'es' : ''} Found!`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
