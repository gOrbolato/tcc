import React, { useState } from 'react';

const RATING_LABELS = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

const Question = ({ title, onAnswerChange }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [observation, setObservation] = useState('');

  const handleRatingChange = (rate) => {
    setRating(rate);
    onAnswerChange({ nota: rate, obs: observation });
  };

  const handleObservationChange = (e) => {
    const obsText = e.target.value;
    setObservation(obsText);
    onAnswerChange({ nota: rating, obs: obsText });
  };

  const currentLabel = RATING_LABELS[hover] || RATING_LABELS[rating] || '';

  return (
    <div className="pergunta-card" style={{marginBottom: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)'}}>
      <h3>{title}</h3>
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <button
              type="button"
              key={ratingValue}
              className={ratingValue <= (hover || rating) ? "star-filled" : "star-empty"}
              onClick={() => handleRatingChange(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              &#9733;
            </button>
          );
        })}
        {currentLabel && <span className="rating-label">{currentLabel}</span>}
      </div>
      <label style={{fontWeight: 600, fontSize: '0.9rem', color: '#333', marginTop: '1rem', display: 'block'}}>
        Sua opinião descritiva é fundamental para a melhoria contínua:
      </label>
      <textarea 
        placeholder="Descreva os pontos positivos e/ou negativos..."
        onChange={handleObservationChange}
        required
        maxLength={3000} // Limite de caracteres
        style={{width: '100%', marginTop: '0.5rem', minHeight: '100px', boxSizing: 'border-box', padding: '8px'}}
      />
    </div>
  );
};

export default Question;