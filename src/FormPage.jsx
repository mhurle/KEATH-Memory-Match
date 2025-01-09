// src/FormPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // lets us go to /game after submit

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // (Optional) store data if you need it later
    localStorage.setItem('userGameData', JSON.stringify(formData));

    // Now navigate to the memory match game
    navigate('/game');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
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

        {error && <div className="error-message">{error}</div>}

        <button type="submit">Start Game</button>
      </form>
    </div>
  );
}

export default FormPage;