import { Exercise } from '../types';

// SuperMemo-2 Algorithm Parameters
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const EASE_BONUS = 0.15;
const EASE_PENALTY = 0.2;

interface ReviewData {
  interval: number;  // in days
  ease: number;
  consecutiveCorrect: number;
}

export class SpacedRepetitionSystem {
  private reviewData: Map<string, ReviewData> = new Map();

  constructor() {
    // Load saved review data from localStorage
    const savedData = localStorage.getItem('reviewData');
    if (savedData) {
      this.reviewData = new Map(JSON.parse(savedData));
    }
  }

  private save() {
    localStorage.setItem('reviewData', 
      JSON.stringify(Array.from(this.reviewData.entries()))
    );
  }

  calculateNextReview(exerciseId: string, wasCorrect: boolean): Date {
    let data = this.reviewData.get(exerciseId) || {
      interval: 1,
      ease: DEFAULT_EASE,
      consecutiveCorrect: 0,
    };

    if (wasCorrect) {
      // Increase interval and ease for correct answers
      data.consecutiveCorrect++;
      if (data.consecutiveCorrect === 1) {
        data.interval = 1;
      } else if (data.consecutiveCorrect === 2) {
        data.interval = 6;
      } else {
        data.interval = Math.round(data.interval * data.ease);
      }
      data.ease = Math.min(data.ease + EASE_BONUS, 2.5);
    } else {
      // Reset interval and decrease ease for incorrect answers
      data.consecutiveCorrect = 0;
      data.interval = 1;
      data.ease = Math.max(data.ease - EASE_PENALTY, MIN_EASE);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + data.interval);

    this.reviewData.set(exerciseId, data);
    this.save();

    return nextReview;
  }

  getDueExercises(exercises: Exercise[]): Exercise[] {
    const now = new Date();
    return exercises.filter(exercise => {
      if (!exercise.nextReview) return true;
      return new Date(exercise.nextReview) <= now;
    });
  }
}