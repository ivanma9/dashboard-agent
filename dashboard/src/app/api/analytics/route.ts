import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    console.log("from:", date.from);
    console.log("to:", date.to);
    const start = new Date(date.from);
    const end = new Date(date.to);
    
    start.setHours(0, 0, 0, 0); // Start of start date
    end.setHours(23, 59, 59, 999); // End of end date

    console.log(start, end);

    // Fetch counts for date range
    const created = await prisma.user.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
    });

    const modified = await prisma.user.count({
      where: {
        updatedAt: {
          gte: start,
          lte: end
        }
      },
    });

    const deleted = await prisma.user.count({
      where: {
        deletedAt: {
          gte: start,
          lte: end,
          not: null
        }
      },
    });

    return NextResponse.json({ created, modified, deleted });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}