/**
 * Course Service
 *
 * Provides recognized courses for the NSFDC Educational Loan Scheme (ELS).
 *
 * Rules:
 * - Frontend components must never hardcode or bundle the course list.
 * - Call courseService.getRecognizedCourses() dynamically.
 * - In API mode: calls GET /api/courses.
 * - In mock mode: reads from mockData/courses with simulated network delay.
 */

import { apiRequest, IS_MOCK_MODE } from './apiClient';
import { RECOGNIZED_COURSES, type RecognizedCourse } from './mockData/courses';

export type { RecognizedCourse };

const MOCK_DELAY_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getRecognizedCourses(): Promise<RecognizedCourse[]> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_DELAY_MS);
    return RECOGNIZED_COURSES;
  }
  return apiRequest<RecognizedCourse[]>('/api/courses');
}
