import React, { useState } from 'react';
import styled from 'styled-components';

const SubscriptionContainer = styled.div`
  background: #2b2b2b16;
  padding: 100px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Title = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-size: 2.8em;
  color: #000000;
  margin-bottom: 20px;
  font-weight: 500;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2.2em;
  }
`;

const Subtitle = styled.p`
  color: #656464;
  font-size: 1.1em;
  margin-bottom: 50px;
  line-height: 1.7;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 15px;
  max-width: 550px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 16px 24px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 50px;
  font-size: 1em;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #333333;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: #999;
  }

  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
  }
`;

const SubmitButton = styled.button`
  background: #000000;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 36px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #333333;
  }

  &:disabled {
    background: #999;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Message = styled.p`
  color: #333333;
  margin-top: 20px;
  font-size: 0.95em;
  font-weight: 500;
`;

const HiddenField = styled.div`
  position: absolute;
  left: -5000px;
`;

const Subscription = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const MAILCHIMP_URL = "https://gmail.us9.list-manage.com/subscribe/post";
  const MAILCHIMP_U = "5495e05e501e02aa2cf3acb24"; 
  const MAILCHIMP_ID = "689c28c49a"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData();
    formData.append('u', MAILCHIMP_U);
    formData.append('id', MAILCHIMP_ID);
    formData.append('EMAIL', email);

    try {
      // Use JSONP method for Mailchimp
      const script = document.createElement('script');
      const callback = 'callback_' + Date.now();
      
      window[callback] = (data) => {
        delete window[callback];
        document.body.removeChild(script);
        
        if (data.result === 'success') {
          setStatus('success');
          setMessage('Thanks for subscribing!');
          setEmail('');
        } else {
          setStatus('error');
          setMessage(data.msg || 'Something went wrong. Please try again.');
        }
      };

      script.src = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&EMAIL=${encodeURIComponent(email)}&c=${callback}`;
      document.body.appendChild(script);
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <SubscriptionContainer id="subscription">
      <Content>
        <Title>Stay in the Loop</Title>
        <Subtitle>
          Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <EmailInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'sending'}
          />
          <SubmitButton type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Subscribing...' : 'Subscribe'}
          </SubmitButton>
          
          {/* Honeypot field for bot protection */}
          <HiddenField>
            <input type="text" name="b_mailchimp_bot" tabIndex="-1" />
          </HiddenField>
        </Form>

        {message && (
          <Message>{message}</Message>
        )}
      </Content>
    </SubscriptionContainer>
  );
};

export default Subscription;

