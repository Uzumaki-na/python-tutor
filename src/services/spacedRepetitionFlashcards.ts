import { FlashCard } from '../types';

const INITIAL_INTERVAL = 1; // 1 day
const EASY_BONUS = 1.3;
const HARD_PENALTY = 0.5;

export class FlashcardSpacedRepetition {
  private cards: Map<string, FlashCard> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.cards = new Map(Object.entries(parsed));
    }
  }

  private saveToStorage() {
    const obj = Object.fromEntries(this.cards);
    localStorage.setItem('flashcards', JSON.stringify(obj));
  }

  addCard(card: FlashCard) {
    if (!this.cards.has(card.id)) {
      this.cards.set(card.id, {
        ...card,
        interval: INITIAL_INTERVAL,
        nextReview: new Date().toISOString(),
        easeFactor: 2.5,
      });
      this.saveToStorage();
    }
  }

  updateCard(cardId: string, quality: 'easy' | 'medium' | 'hard') {
    const card = this.cards.get(cardId);
    if (!card) return;

    const multiplier = 
      quality === 'easy' ? EASY_BONUS :
      quality === 'hard' ? HARD_PENALTY : 1;

    const newInterval = Math.ceil(card.interval * card.easeFactor * multiplier);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    this.cards.set(cardId, {
      ...card,
      interval: newInterval,
      nextReview: nextReview.toISOString(),
      easeFactor: Math.max(1.3, card.easeFactor + (quality === 'easy' ? 0.1 : -0.1)),
    });

    this.saveToStorage();
  }

  getDueCards(): FlashCard[] {
    const now = new Date();
    return Array.from(this.cards.values()).filter(card => 
      new Date(card.nextReview) <= now
    );
  }

  getAllCards(): FlashCard[] {
    return Array.from(this.cards.values());
  }
}