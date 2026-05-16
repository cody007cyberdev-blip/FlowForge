import nodemailer from 'nodemailer';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  toEmail: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export async function sendEmail(config: EmailConfig) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });

    const mailOptions = {
      from: config.fromEmail,
      to: Array.isArray(config.toEmail) ? config.toEmail.join(',') : config.toEmail,
      subject: config.subject,
      html: config.htmlContent,
      text: config.textContent,
      attachments: config.attachments || [],
      cc: config.cc?.join(','),
      bcc: config.bcc?.join(','),
      replyTo: config.replyTo,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function executeEmailNode(input: any, config: any) {
  const emailConfig: EmailConfig = {
    smtpHost: config?.smtpHost || process.env.SMTP_HOST || 'localhost',
    smtpPort: config?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: config?.smtpUser || process.env.SMTP_USER || '',
    smtpPassword: config?.smtpPassword || process.env.SMTP_PASSWORD || '',
    fromEmail: config?.fromEmail || process.env.SMTP_FROM || 'noreply@flowforge.local',
    toEmail: config?.toEmail || input?.toEmail || [],
    subject: config?.subject || input?.subject || 'FlowForge Notification',
    htmlContent: config?.htmlContent || input?.htmlContent,
    textContent: config?.textContent || input?.textContent,
    attachments: config?.attachments || input?.attachments,
    cc: config?.cc || input?.cc,
    bcc: config?.bcc || input?.bcc,
    replyTo: config?.replyTo || input?.replyTo,
  };

  if (!emailConfig.toEmail || (Array.isArray(emailConfig.toEmail) && emailConfig.toEmail.length === 0)) {
    return {
      success: false,
      error: 'Recipient email is required',
    };
  }

  return await sendEmail(emailConfig);
}

// Gmail OAuth2 support
export async function sendEmailViaGmail(config: {
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  toEmail: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER || '',
        accessToken: config.accessToken,
        refreshToken: config.refreshToken,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || '',
      to: Array.isArray(config.toEmail) ? config.toEmail.join(',') : config.toEmail,
      subject: config.subject,
      html: config.htmlContent,
      text: config.textContent,
      attachments: config.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gmail sending failed',
    };
  }
}
