import { NextResponse } from 'next/server';
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' }); // Replace with your region

const sendEmail = async (to: string, subject: string, body: string) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Text: { Data: body } },
      Subject: { Data: subject },
    },
    Source: 'verified-email@example.com', // Replace with your verified email
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();
    const result = await sendEmail(to, subject, body);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 