// src/FormPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormPage() {
  // Track which tab is active: "play" or "interest"
  const [activeTab, setActiveTab] = useState('play');

  // Hold form data in state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    institutionType: ''
  });

  // Error and success states
  const [error, setError] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  // Router navigation
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Prepare data for Netlify
    const data = new FormData();
    data.append('form-name', 'user-info');
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('institution', formData.institution);
    data.append('institutionType', formData.institutionType);
    data.append('submissionType', activeTab); // Distinguish submissions

    // Submit to Netlify
    fetch('/', {
      method: 'POST',
      body: data
    })
      .then(() => {
        console.log('Form submitted to Netlify!');
        if (activeTab === 'play') {
          // Store data & go to game
          localStorage.setItem('userGameData', JSON.stringify(formData));
          navigate('/game');
        } else {
          // Interest submission success
          setInterestSubmitted(true);
        }
      })
      .catch((err) => {
        console.error('Netlify form submission error:', err);
        setError('Error submitting the form. Please try again.');
      });
  };

  // If someone just submitted interest, show success page
  if (activeTab === 'interest' && interestSubmitted) {
    return (
      <div className="survey-container">
        <h2>Success!</h2>
        <p>Your interest has been submitted. Thank you!</p>
        <button
          type="button"
          onClick={() => {
            // Clear old data and re-show interest form empty
            setInterestSubmitted(false);
            setFormData({
              name: '',
              email: '',
              institution: '',
              institutionType: ''
            });
          }}
          style={{ marginTop: '20px' }}
        >
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <div
      className="survey-container"
      style={{ position: 'relative', paddingTop: '80px' }}
    >
      {/* 
        Tab toggle buttons - top-right corner, absolutely positioned
      */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('play');
            setError('');
            setInterestSubmitted(false);
          }}
          style={{
            border: '1px solid white',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '6px 10px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            opacity: activeTab === 'play' ? 0.8 : 0.6
          }}
        >
          Play the Game
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('interest');
            setError('');
            setInterestSubmitted(false);
          }}
          style={{
            border: '1px solid white',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '6px 10px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            opacity: activeTab === 'interest' ? 0.8 : 0.6
          }}
        >
          Register Interest
        </button>
      </div>

      {/* Heading and description */}
      {activeTab === 'play' ? (
        <>
          <h2>Before You Play</h2>
          <p>
            Ready to dive in? By playing this game, you consent to us signing you up
            for KEATH.ai and occasional email updates. We promise to keep it friendly,
            fun and never spam you!
          </p>
        </>
      ) : (
        <>
          <h2>Register Interest</h2>
          <p>
            Please fill out the form below to register your interest in KEATH.ai.
            By doing so, you consent to us signing you up
            for KEATH.ai and occasional email updates. We promise to keep it friendly,
            fun and never spam you!
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
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
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            required
            placeholder="Enter your institution"
          />
        </div>

        <div className="form-group">
          <label>Are you from a:</label>
          <label>
            <input
              type="radio"
              name="institutionType"
              value="University"
              checked={formData.institutionType === 'University'}
              onChange={handleChange}
              required
            />
            University
          </label>
          <label>
            <input
              type="radio"
              name="institutionType"
              value="School"
              checked={formData.institutionType === 'School'}
              onChange={handleChange}
              required
            />
            School
          </label>
          <label>
            <input
              type="radio"
              name="institutionType"
              value="Other"
              checked={formData.institutionType === 'Other'}
              onChange={handleChange}
              required
            />
            Other
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit">
          {activeTab === 'play' ? 'Start Game' : 'Submit Interest'}
        </button>
      </form>

      {/* Secret button to skip straight to /game with N/A details */}
      <button
        type="button"
        onClick={() => {
          // Store default N/A user data
          localStorage.setItem('userGameData', JSON.stringify({
            name: 'N/A',
            email: 'N/A',
            institution: 'N/A',
            institutionType: 'Other',
          }));
          // Go directly to the game
          navigate('/game');
        }}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '20px',
          height: '20px',
          opacity: 0.1,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default FormPage;