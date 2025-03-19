import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
interface User {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
// AWS configuration
const sesClient = new SESClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ""
  }
});

// Email types for different user operations
type EmailType = 'created' | 'updated' | 'deleted';

// AWS SES agent for sending emails
export const AWSEmailAgent = {
  // Send notification email
  sendUserNotification: async (user: User, emailType: EmailType): Promise<{success: boolean; message: string}> => {
    try {
      // Configure email content based on operation type
      const subject = `User ${emailType}: ${user.name}`;
      let body = "";
      
      switch (emailType) {
        case 'created':
          body = `A new user has been created:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\n\nTime: ${new Date().toLocaleString()}`;
          break;
        case 'updated':
          body = `A user has been updated:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\n\nTime: ${new Date().toLocaleString()}`;
          break;
        case 'deleted':
          body = `A user has been deleted:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\n\nTime: ${new Date().toLocaleString()}`;
          break;
      }

      // Email parameters
      const params = {
        Source: process.env.NEXT_PUBLIC_AWS_SES_SENDER_EMAIL || "notifications@yourdomain.com",
        Destination: {
          ToAddresses: [
            process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@yourdomain.com"
          ]
        },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: body
            }
          }
        }
      };

      // Send email
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      
      return {
        success: true,
        message: `Email notification sent successfully for ${emailType} user: ${user.name}`
      };
    } catch (error) {
      console.error("Error sending email notification:", error);
      return {
        success: false,
        message: `Failed to send email notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}; 