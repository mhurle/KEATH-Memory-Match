// src/SurveyForm.jsx

import { useState } from 'react';

const SurveyForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic email validation
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

      // Send form data to Zapier Webhook
      const zapierWebhookUrl = import.meta.env.VITE_ZAPIER_WEBHOOK_URL;
      if (!zapierWebhookUrl) {
        console.warn('Zapier Webhook URL not found. Please set VITE_ZAPIER_WEBHOOK_URL in your environment variables.');
      } else {
        await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        console.log('Form data successfully sent to Zapier!');
      }

      // Notify parent (App) that form is complete
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
    setFormData((prev) => ({
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

export default SurveyForm;