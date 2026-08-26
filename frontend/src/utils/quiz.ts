import { Question } from '../types/quiz';

export function emptyQuestion(): Question {
  return {
    type: 'boolean',
    text: '',
    answer: 'true',
    options: ['', ''],
    correctOptions: [],
  };
}