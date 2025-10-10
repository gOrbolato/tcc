import React, { useState } from 'react';
import '../assets/styles/Question.css'; // Importa o CSS específico

interface Answer {
  nota: number;
  obs: string;
}

interface QuestionProps {
  title: string;
  onAnswerChange: (answer: Answer) => void;
}

const RATING_LABELS: { [key: number]: string } = {
  1: 'Péssimo 😠',
  2: 'Ruim 🙁',
  3: 'Regular 😐',
  4: 'Bom 🙂',
  5: 'Excelente 😀',
};

const Question: React.FC<QuestionProps> = ({ title, onAnswerChange }) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [observation, setObservation] = useState<string>('');

  const handleRatingChange = (rate: number) => {
    setRating(rate);
    onAnswerChange({ nota: rate, obs: observation });
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const obsText = e.target.value;
    setObservation(obsText);
    onAnswerChange({ nota: rating, obs: obsText });
  };

  const currentLabel = RATING_LABELS[hover] || RATING_LABELS[rating] || '';

  const getFaceEmoji = (value: number) => {
    switch (value) {
      case 1: return '😠';
      case 2: return '🙁';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😀';
      default: return '😐';
    }
  };

  return (
    <div className="question-card">
      <h3>{title}</h3>
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <button
              type="button"
              key={ratingValue}
              className={ratingValue <= (hover || rating) ? "face-filled" : "face-empty"}
              onClick={() => handleRatingChange(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              {getFaceEmoji(ratingValue)}
            </button>
          );
        })}
        {currentLabel && <span className="rating-label">{currentLabel}</span>}
      </div>
      <label className="question-textarea-label">
        Sua opinião descritiva é fundamental para a melhoria contínua:
      </label>
      <textarea 
        placeholder="Descreva os pontos positivos e/ou negativos..."
        onChange={handleObservationChange}
        required
        maxLength={3000} // Limite de caracteres
        className="question-textarea"
      />
    </div>
  );
};

export default Question;
