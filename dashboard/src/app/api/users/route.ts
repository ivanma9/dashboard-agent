import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return Response.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    // Create a user in the database using Prisma
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        // Add other fields from your schema as needed
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully', 
      user 
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userData = await request.json();
    
    if (!userData.id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.update({
      where: { id: userData.id },
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        updatedAt: new Date()
        // Add other fields from your schema as needed
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userData = await request.json();
    
    if (!userData.id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.user.update({
      where: { id: userData.id },
      data: { deletedAt: new Date() }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 