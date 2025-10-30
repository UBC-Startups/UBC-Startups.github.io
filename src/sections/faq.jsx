import React, { useState } from 'react';
import styled from 'styled-components';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is UBC Startups?",
      answer: "UBC Startups is a student-run organization that connects UBC students with startup opportunities, resources, and a supportive entrepreneurial community."
    },
    {
      question: "How can I join UBC Startups?",
      answer: "You can join by attending our events, signing up for our newsletter, or applying for our membership program. Check our website for upcoming recruitment periods."
    },
    {
      question: "Do I need to have a startup idea to join?",
      answer: "No! We welcome students at all stages of their entrepreneurial journey, whether you have an idea or are just curious about startups."
    },
    {
      question: "What kind of events do you host?",
      answer: "We host workshops, networking events, pitch competitions, speaker series with successful entrepreneurs, and social gatherings for our community."
    },
    {
      question: "Is there a membership fee?",
      answer: "All of our events are free for UBC students!"
    },
    {
      question: "Can I get funding for my startup idea?",
      answer: "Yes! We host pitch competitions including SOAR, our flagship event with a $10,000 prize pool. We also connect students with accelerators and investor networks to help secure additional funding opportunities."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FAQContainer id='faq'>
      <FAQTitle>Frequently Asked Questions</FAQTitle>
      <FAQList>
        {faqs.map((faq, index) => (
          <FAQItem key={index}>
            <FAQQuestion onClick={() => toggleFAQ(index)}>
              <QuestionText>{faq.question}</QuestionText>
              <Icon isOpen={openIndex === index}>▼</Icon>
            </FAQQuestion>
            <FAQAnswer isOpen={openIndex === index}>
                <div>{faq.answer}</div>
            </FAQAnswer>
          </FAQItem>
        ))}
      </FAQList>
    </FAQContainer>
  );
};

export default FAQ;

const FAQContainer = styled.section`
  padding: 5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const FAQTitle = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-weight: 500;
  text-align: center;
  font-size: 3em;
  margin-bottom: 3rem;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FAQItem = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: 'Sansation', sans-serif;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
`;

const QuestionText = styled.span`
  font-size: 1.1em;
  font-weight: 500;
  color: #1f2937;
`;

const Icon = styled.span`
  font-size: 0.8em;
  color: #6b7280;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.3s ease;
`;

const FAQAnswer = styled.div`
  display: grid;
  grid-template-rows: ${props => props.isOpen ? '1fr' : '0fr'};
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;

  > div {
    min-height: 0;
    padding: ${props => props.isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0 1.5rem'};
    color: #4b5563;
    line-height: 1.6;
    font-size: 1em;
  }
`;