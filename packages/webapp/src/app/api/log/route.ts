import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message, level = 'log' } = await request.json();
  
  // Log to server console
  switch (level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    default:
      console.log(message);
  }
  
  return NextResponse.json({ success: true });
}
