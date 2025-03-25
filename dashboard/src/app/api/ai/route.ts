import { User } from "@/utils/awsService";
import { NextResponse } from "next/server";
import { AWSEmailAgent } from "@/utils/awsService";
import prisma from '@/lib/PrismaInstance';

// export const runtime = 'edge';

// Function to parse LLM response and extract actions
const parseResponse = (text: string) => {
  try {
    // Check if the response contains a JSON action block
    const actionMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    
    if (actionMatch && actionMatch[1]) {
      // Extract and parse the JSON
      const actionData = JSON.parse(actionMatch[1]);
      return {
        action: actionData,
        text: text.replace(/```json\s*{[\s\S]*?}\s*```/, '').trim()
      };
    }
    
    // No action found, just return the text
    return { text, action: null };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    return { text, action: null };
  }
};

// Execute AWS actions based on LLM response
const executeAction = async (action: any, userData?: User[]) => {
  if (!action) return null;
  
  try {
    switch (action.action) {
      case 'sendEmail':
        return await AWSEmailAgent.sendCustomEmail(
          action.recipient,
          action.subject || "Message from AWS Agent",
          action.body || "No content provided"
        );
      
      case 'listUsers':
        return { success: true, users: userData };
      
      case 'createUser':
        if (!action.parameters?.email ) {
          return { success: false, error: 'Email is required' };
        }
        if (!action.parameters?.name) {
          return { success: false, error: 'Name is required' };
        }
        if (!action.parameters?.phone) {
          return { success: false, error: 'Phone is required' };
        }
        const user = await prisma.user.create({
          data: action.parameters || {}
        });
        return { success: true, message: 'User created successfully', user };
        
      case 'updateUser':
        if (!action.parameters?.id) {
          return { success: false, error: 'User ID is required' };
        }
        const updatedUser = await prisma.user.update({
          where: { id: action.parameters.id },
          data: action.parameters
        });
        return { success: true, message: 'User updated successfully', user: updatedUser };
        
      case 'deleteUser':
        if (!action.parameters?.id) {
          return { success: false, error: 'User ID is required' };
        }
        await prisma.user.update({
          where: { id: action.parameters.id },
          data: { deletedAt: new Date() }
        });
        return { success: true, message: 'User deleted successfully' };
        
      case 'getUser':
        if (!action.parameters?.id) {
          return { success: false, message: 'User ID is required' };
        }
        const foundUser = await prisma.user.findUnique({
          where: { id: action.parameters.id }
        });
        return foundUser ? 
          { success: true, user: foundUser } : 
          { success: false, message: 'User not found' };
        
      default:
        return { success: false, message: 'Unknown action type' };
    }
  } catch (error) {
    console.error("Error executing action:", error);
    return { success: false, error: String(error) };
  }
};

const fetchChatCompletion = async (sample: string, userData?: User[], pastUserMessages?: string[]) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemini-2.0-flash-thinking-exp:free",
      "messages": [
        {
          "role": "system",
          "content": `You are a helpful assistant that specializes with the user management and integrates AWS tools to help with tasks.
          Use the following user data to help with the task: ${JSON.stringify(userData)}. 
          The user data is an array of objects, each object represents a user.
          
          When the user asks to perform an AWS action, respond with a markdown JSON code block containing the action details.
          
          For emails:
          \`\`\`json
          {
            "action": "sendEmail",
            "recipient": "user@example.com",
            "subject": "Email subject",
            "body": "Email body content"
          }
          \`\`\`
          
          For user management:
          \`\`\`json
          {
            "action": "createUser"|"updateUser"|"deleteUser"|"listUsers",
            "parameters": { ... relevant parameters ... }
          }
          \`\`\`
          
          Always include a conversational response outside the JSON block to explain what you're doing. The JSON is for the system to process. Try your best to answer the user's new message. 
          You will be given the user's previous messages as context and you should use it to answer the user's new message. The main goal is to answer the user's new message.
          `
        },
        {
          "role": "user",
          "content": "User's previous messages: " + pastUserMessages?.join("\n") + "\n\n" + "User's new message: " + sample
        }
      ]
    })
  });
  return response.json();
};

export async function POST(request: Request) {
  try {
    const { sample, userData, pastUserMessages } = await request.json();
    
    if (!sample) {
      return NextResponse.json({ error: 'Sample text is required' }, { status: 400 });
    }

    // Get the raw LLM response
    const completion = await fetchChatCompletion(sample, userData, pastUserMessages);
    
    // Extract the text content from the completion
    const content = completion.choices[0].message.content;
    
    // Parse the response to extract actions and text
    const { text, action } = parseResponse(content);
    
    // Execute any actions if present
    const actionResult = await executeAction(action, userData);
    
    // Return both the conversation text and action results
    return NextResponse.json({
      completion,
      parsed: {
        text,
        action,
        actionResult
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}