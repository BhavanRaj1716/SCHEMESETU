import { NextResponse } from 'next/server';
import { RECOGNIZED_COURSES } from '@/services/mockData/courses';

export async function GET() {
  return NextResponse.json(RECOGNIZED_COURSES);
}
