import React from "react";
import styled, { keyframes } from "styled-components";

import teadot from "../images/partnerPhotos/teadot.png";
import bonMacaron from "../images/partnerPhotos/bonMacaron.png";
import rumble from "../images/partnerPhotos/rumble.png";
import kernels from "../images/partnerPhotos/kernels.png";
import formationStudio from "../images/partnerPhotos/formationStudio.png";
import tamam from "../images/partnerPhotos/tamam.png";
import stevesPoke from "../images/partnerPhotos/stevesPoke.png";
import redBull from "../images/partnerPhotos/redBull.png";
import poppi from "../images/partnerPhotos/poppi.png";
import goldsGym from "../images/partnerPhotos/goldsGym.png";
import jolt from "../images/partnerPhotos/jolt.png";
import dominos from "../images/partnerPhotos/dominos.png";
import bakd from "../images/partnerPhotos/bakd.png";
import oakBerry from "../images/partnerPhotos/oakBerry.png";

const OurPartners = () => {
  const partners = [
    teadot,
    bonMacaron,
    rumble,
    kernels,
    formationStudio,
    tamam,
    stevesPoke,
    redBull,
    poppi,
    goldsGym,
    jolt,
    dominos,
    bakd,
    oakBerry
  ];

  const scrollingPartners = [...partners, ...partners, ...partners];

  return (
    <OurPartnersContainer>
      <OurPartnersTitle>Our Partners</OurPartnersTitle>
      <ScrollWrapper>
        <PartnerScrollTrack>
          {scrollingPartners.map((logo, i) => (
            <PartnerItem key={i}>
              <img src={logo} alt={`Partner ${(i % partners.length) + 1}`} />
            </PartnerItem>
          ))}
        </PartnerScrollTrack>
      </ScrollWrapper>
    </OurPartnersContainer>
  );
};

export default OurPartners;

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); } 
`;

const OurPartnersContainer = styled.section`
  margin: 2rem;
  text-align: center;
  background: #fff;
`;

const OurPartnersTitle = styled.h2`
  font-family: "Roboto Slab";
  text-align: center;
  font-size: 3em;
  margin-bottom: 2rem;
`;

const ScrollWrapper = styled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
  padding: 20px 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 100px;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, #fff 0%, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, #fff 0%, transparent 100%);
  }
`;

const PartnerScrollTrack = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: nowrap;
  width: max-content;
  height: max-content;
  animation: ${scroll} 20s linear infinite; 
  background: #fff;
  box-shadow: 0 -10px 10px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.1);
`;

const PartnerItem = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 150px;
  height: 90px;
  border-radius: 12px;
  padding: 1rem;

  img {
    max-width: 150px;
    max-height: 100%;
    object-fit: contain;
    transition: filter 0.3s ease;
  }
`;