import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Gerçek uygulamada burada form verileri bir API'ye gönderilirdi
    console.log('Form verileri:', formData);
    setSubmitted(true);
    
    // Form gönderildikten sonra formu sıfırla
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };
  
  return (
    <div className="contact-form-container">
      <h2>İletişim</h2>
      
      {submitted ? (
        <div className="success-message">
          <p>Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">İsim</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Mesaj</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-btn">Gönder</button>
        </form>
      )}
    </div>
  );
};

export default ContactForm; 