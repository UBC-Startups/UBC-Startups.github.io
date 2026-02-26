import React from 'react';
import styled from 'styled-components';
import { useEffect } from 'react';

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
  margin-bottom: 25px;
  line-height: 1.7;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const Subscription = () => {

    useEffect(() => {
      window.ml = window.ml || function () {
        (window.ml.q = window.ml.q || []).push(arguments);
      };
      window.ml('account', '2125347');
  
      const script = document.createElement("script");
      script.src = "https://assets.mailerlite.com/js/universal.js";
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        document.body.removeChild(script);
      };
    }, []);
  
    return (
      <SubscriptionContainer id="subscription">
        <Content>
          <Title>Stay in the Loop</Title>
          <Subtitle>
            Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.
          </Subtitle>
  
          <div className="ml-embedded" data-form="OLHxhO"></div>
  
        </Content>
      </SubscriptionContainer>
    );
  };

export default Subscription;