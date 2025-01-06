import { useState, useEffect, useRef } from 'react';

const CARD_IMAGES = [
  '/game-image1.jpg',
  '/game-image2.jpg',
  '/game-image3.jpg',
  '/game-image4.jpg',
  '/game-image5.jpg',
  '/game-image6.jpg',
  '/game-image7.jpg',
  '/game-image8.jpg',
  '/game-image9.jpg'
];

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LeaderboardPage = ({ onBack }) => {
  const [scores, setScores] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const storedScores = localStorage.getItem('gameScores');
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        const sortedScores = parsedScores.sort((a, b) => a.time - b.time);
        setScores(sortedScores);
      }
    } catch (error) {
      console.error('Error loading scores:', error);
      setScores([]);
    }
  }, []);

  const handleDeleteScore = (index) => {
    const updatedScores = [...scores];
    updatedScores.splice(index, 1);
    setScores(updatedScores);
    localStorage.setItem('gameScores', JSON.stringify(updatedScores));
  };

  return (
    <div className="App">
      <div className="leaderboard-container">
        <h1>Leaderboard</h1>
        <div className="scores-container">
          {(!scores || scores.length === 0) ? (
            <p>No scores yet. Be the first to play!</p>
          ) : (
            <>
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Time</th>
                    <th>Result</th>
                    {editing && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => {
                    const resultClass = score.result ? score.result.toLowerCase() : '';
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{score.name}</td>
                        <td>{score.institution}</td>
                        <td>{formatTime(score.time)}</td>
                        <td className={`result ${resultClass}`}>
                          {score.result ? score.result.toUpperCase() : ''}
                        </td>
                        {editing && (
                          <td>
                            <button onClick={() => handleDeleteScore(index)}>X</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Edit button moved to bottom */}
              <button onClick={() => setEditing(!editing)} style={{ marginTop: '20px' }}>
                {editing ? 'Done' : 'Edit'}
              </button>
            </>
          )}
        </div>
        <button onClick={onBack} className="back-button">Back to Game</button>
      </div>
    </div>
  );
};

const SurveyForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid work email');
      setIsSubmitting(false);
      return;
    }

    try {
      // Store user data locally
      localStorage.setItem('userGameData', JSON.stringify(formData));
      console.log('Form submitted:', formData);
      onComplete(formData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="survey-container">
      <h2>Before You Play</h2>
      <p>Please provide your information to continue</p>
      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Work Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your work email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="institution">Institution</label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            required
            placeholder="Enter your institution"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Start Game'}
        </button>
      </form>
    </div>
  );
};

const preloadVideo = async (videoElement) => {
  if (videoElement) {
    try {
      videoElement.preload = "auto";
      videoElement.load();
      videoElement.currentTime = 0.1;
      await new Promise((resolve) => {
        videoElement.oncanplaythrough = resolve;
      });
      return true;
    } catch (err) {
      console.error('Video preload failed:', err);
      return false;
    }
  }
};

function App() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // ms
  const [gameResult, setGameResult] = useState(null);
  const [showSurvey, setShowSurvey] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [aiFinishedFirst, setAiFinishedFirst] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const videoEndTimeRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userGameData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      setShowSurvey(false);
    }
  }, []);

  const saveGameScore = (finalResult) => {
    if (!userData || !finalResult) return;

    try {
      let existingScores = JSON.parse(localStorage.getItem('gameScores') || '[]');

      const newScore = {
        name: userData.name,
        institution: userData.institution,
        email: userData.email,
        time: timeElapsed,
        result: finalResult,
        date: new Date().toISOString()
      };

      existingScores.push(newScore);
      existingScores.sort((a, b) => a.time - b.time);
      localStorage.setItem('gameScores', JSON.stringify(existingScores));
      console.log('Score saved successfully:', newScore);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const finalizeGameResult = () => {
    let result;
    if (aiFinishedFirst) {
      // If AI finished first, we always lose at the end
      result = 'lose';
      document.body.className = 'lose-bg';
    } else if (videoRef.current && videoEndTimeRef.current) {
      const timeRemaining = videoEndTimeRef.current - videoRef.current.currentTime;
      if (timeRemaining > 2) {
        result = 'win';
        document.body.className = 'win-bg';
      } else if (timeRemaining >= 0 && timeRemaining <= 2) {
        result = 'draw';
        document.body.className = 'draw-bg';
      } else {
        result = 'lose';
        document.body.className = 'lose-bg';
      }
    } else {
      // No video info scenario
      result = 'lose';
      document.body.className = 'lose-bg';
    }

    setGameResult(result);
    setGameOver(true);
    saveGameScore(result);
  };

  const handleVideoEnd = () => {
    // AI finished first, but don't finalize the game or save score
    // Just set background to red and allow player to continue
    if (!gameOver && !aiFinishedFirst) {
      document.body.className = 'lose-bg';
      setAiFinishedFirst(true);
    }
  };

  const initializeGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const cardPairs = [...CARD_IMAGES, ...CARD_IMAGES];
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5).map((image, index) => ({
      id: index,
      image,
      isFlipped: false
    }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setGameStarted(false);
    setGameOver(false);
    setTimeElapsed(0);
    setGameResult(null);
    setAiFinishedFirst(false);
    document.body.className = '';

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    setShowLeaderboard(false);
  };

  const startGame = async () => {
    if (!userData) {
      setShowSurvey(true);
      return;
    }
    if (gameStarted) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    gameStartTimeRef.current = Date.now();

    // Reveal cards briefly
    const revealedCards = cards.map(card => ({ ...card, isFlipped: true }));
    setCards(revealedCards);
    setGameStarted(true);

    if (videoRef.current) {
      try {
        if (!videoRef.current.readyState) {
          await preloadVideo(videoRef.current);
        }
        videoRef.current.currentTime = 0;
        videoEndTimeRef.current = videoRef.current.duration;
        await videoRef.current.play();
      } catch (error) {
        console.error('Video playback failed:', error);
      }
    }

    timerRef.current = setInterval(() => {
      setTimeElapsed(Date.now() - gameStartTimeRef.current);
    }, 100);

    setTimeout(() => {
      const hiddenCards = cards.map(card => ({ ...card, isFlipped: false }));
      setCards(hiddenCards);
    }, 3000);
  };

  const handleCardClick = (clickedCard) => {
    if (!gameStarted || clickedCard.isFlipped || matchedCards.some(card => card.id === clickedCard.id)) {
      return;
    }

    const updatedCards = cards.map(card =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].image === newFlipped[1].image) {
        const updatedMatched = [...matchedCards, ...newFlipped];
        setMatchedCards(updatedMatched);
        setFlippedCards([]);

        // Check if all matched
        if (updatedMatched.length === cards.length) {
          // Now game ends
          setGameOver(true);
          clearInterval(timerRef.current);
          setTimeElapsed(Date.now() - gameStartTimeRef.current);
          finalizeGameResult();
        }
      } else {
        // Not a match
        setTimeout(() => {
          const resetCards = cards.map(card =>
            newFlipped.some(flipped => flipped.id === card.id) ? { ...card, isFlipped: false } : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    const initVideoAndGame = async () => {
      initializeGame();
      if (videoRef.current) {
        await preloadVideo(videoRef.current);
      }
    };
    initVideoAndGame();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSurveyComplete = (formData) => {
    setUserData(formData);
    setShowSurvey(false);
  };

  useEffect(() => {
    if (gameOver && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameOver]);

  const handleNewUser = () => {
    localStorage.removeItem('userGameData');
    setUserData(null);
    setShowSurvey(true);
    initializeGame();
  };

  let statusMessage = null;
  if (!gameOver && aiFinishedFirst) {
    statusMessage = <div className="lose-message">The AI won, but you can keep playing!</div>;
  } else if (gameOver) {
    if (gameResult === 'win') {
      statusMessage = <div className="win-message">Congratulations! You beat the AI!</div>;
    } else if (gameResult === 'draw') {
      statusMessage = <div className="draw-message">It's a draw!</div>;
    } else if (gameResult === 'lose') {
      statusMessage = <div className="lose-message">Congratulations! You'll beat the AI next time.</div>;
    }
  }

  if (showLeaderboard) {
    return <LeaderboardPage onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="App">
      {showSurvey ? (
        <SurveyForm onComplete={handleSurveyComplete} />
      ) : (
        <>
          <h1>CAN YOU BEAT THE AI?</h1>
          <div className="top-bar">
            <div className="button-group-left">
              {!gameStarted && <button onClick={startGame}>Start Game</button>}
              <button onClick={initializeGame}>Reset Game</button>
            </div>
            <div className="button-group-right">
              {userData && (
                <button onClick={handleNewUser} style={{ backgroundColor: '#FF4500', marginRight: '10px' }}>
                  New User
                </button>
              )}
              <button onClick={() => setShowLeaderboard(true)} className="leaderboard-button">
                View Leaderboard
              </button>
            </div>
          </div>

          <div className="game-container">
            <div className="game-info">
              {gameStarted && <div className="timer">Time: {formatTime(timeElapsed)}</div>}
              {statusMessage}
            </div>

            <div className="game-layout">
              <div className="video-container">
                <video
                  ref={videoRef}
                  onEnded={handleVideoEnd}
                  className="game-video"
                  preload="auto"
                  playsInline
                  autoPlay={false}
                  muted
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  style={{
                    pointerEvents: 'none',
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000'
                  }}
                  poster="/video-thumbnail.png"
                >
                  <source src="/BeattheAIClip.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="promo-text">
                  KEATH.ai is an educational assessment platform. Above watch KEATH.ai showcase its power to assess 3000 words at speed. Can you match the speed of the AI? Play and win big prizes!
                </div>
              </div>

              <div className="card-grid">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className="card-container"
                  >
                    <div className={`card ${card.isFlipped || matchedCards.some(m => m.id === card.id) ? 'flipped' : ''}`}>
                      <div className="card-front">
                        <img src="/card-back.jpg" alt="card back" className="card-image" />
                      </div>
                      <div className="card-back">
                        <img src={card.image} alt="card front" className="card-image" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
