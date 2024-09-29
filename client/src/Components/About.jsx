// About.js
import React, { useState } from 'react';
import './About.css';
import 'font-awesome/css/font-awesome.min.css';
import { FaLinkedin, FaInstagram , FaEnvelope} from 'react-icons/fa';

const About = () => {
  const currentYear = new Date().getFullYear();
  const [comment, setComment] = useState('');

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement your email sending logic here (e.g., using EmailJS or a backend service)
    console.log('Comment submitted:', comment);
    setComment(''); // Clear the comment box after submission
  };

  return (
    <footer className="footer text-light">
      <div className="container">
        <div className="creator">
          <p>A product by</p>
          <h3>KeerthiKeswaran</h3>
          <p>Hope you find it useful!</p>
        </div>

        <form onSubmit={handleSubmit} className="comment-form">
          <h3 style={{ fontSize: '16px' }} className="text-center">Leave a Comment</h3>
          <textarea
            value={comment}
            onChange={handleCommentChange}
            rows="4"
            placeholder="Your comment here..."
            required
            className="comment-box"
          />
          <button type="submit" className="submit-button">Send</button>
        </form>

        <div className="contact">
          <h3 className="bold">Contact Us</h3>
          <div className="social-link">
            <FaEnvelope className="icon" style={{ marginRight: '8px' }}/>
            <a href="mailto:keshwarankeerthi@gmail.com" target="_blank" rel="noopener noreferrer">
              Mail
            </a>
          </div>
          <div className="social-link">
            <FaLinkedin className="icon" style={{ marginRight: '8px' }}/>
            <a href="https://www.linkedin.com/in/keerthikeswaran-k-s/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
          <div style={{marginTop : '10px'}} className="social-link">
            <FaInstagram className="icon" style={{ marginRight: '8px' }} />
            <a href="https://www.instagram.com/keerthioffl_2329" target="_blank" rel="noopener noreferrer">
               Instagram
            </a>
          </div>
        </div>

      </div>

      <p className="text-left mb-0 copyright">©{currentYear} Probe2Cure.</p>
    </footer>
  );
};

export default About;
