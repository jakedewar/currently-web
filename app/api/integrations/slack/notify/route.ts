import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/integrations/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, stream, task, updateType } = body;

    if (type === 'stream_update' && stream && updateType) {
      await NotificationService.sendStreamUpdate(stream, updateType);
    } else if (type === 'task_update' && task && updateType) {
      await NotificationService.sendTaskUpdate(task, updateType);
    } else {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in Slack notification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
