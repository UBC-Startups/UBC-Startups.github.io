import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Card = styled.div`
    box-sizing: border-box;
    display: flex;
    align-items: stretch;
    background: #fff;
    padding: 8px;
    border-radius: 20px;
    width: 100%;

    @media (max-width: 800px) {
        flex-direction: column;
    }
`;

const Visual = styled.div`
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    width: 360px;
    flex-shrink: 0;
    padding: 28px;
    border-radius: 16px;
    background: ${(props) =>
        props.$image
            ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.65)), url(${props.$image})`
            : `linear-gradient(to bottom, ${props.$from}, ${props.$to})`};
    background-size: cover;
    background-position: center;
    filter: ${(props) => (props.$past ? "grayscale(0.7)" : "none")};
    opacity: ${(props) => (props.$past ? 0.75 : 1)};

    @media (max-width: 800px) {
        width: 100%;
    }
`;

const BigNumber = styled.p`
    position: absolute;
    top: 12px;
    right: 0;
    transform: translateX(100%);
    margin: 0;
    font-weight: 600;
    font-size: 120px;
    line-height: 1;
    color: rgba(255, 255, 255, 0.14);
    white-space: nowrap;
`;

const Tags = styled.div`
    position: relative;
    display: flex;
    gap: 6px;
`;

const Tag = styled.div`
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
    background: ${(props) => (props.$light ? "#fff" : "#cc4414")};
    color: ${(props) => (props.$light ? "#0a0a0a" : "#fff")};
`;

const DateBlock = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
`;

const DateText = styled.p`
    margin: 0;
    font-weight: 600;
    font-size: 52px;
    line-height: 1.1;
    color: #fff;
`;

const YearText = styled.p`
    margin: 0;
    font-size: 17px;
    color: rgba(255, 255, 255, 0.7);
`;

const Content = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 32px 40px;

    @media (max-width: 800px) {
        padding: 24px 16px;
    }
`;

const Title = styled.p`
    margin: 0;
    font-weight: 600;
    font-size: 34px;
    line-height: 1.15;
    color: #0a0a0a;

    @media (max-width: 500px) {
        font-size: 26px;
    }
`;

const Description = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.45;
    color: #6b6b6b;
`;

const Highlight = styled.div`
    padding: 14px 18px;
    border-radius: 12px;
    background: #efefec;
    font-size: 15px;
    line-height: 1.45;
    color: #0a0a0a;
`;

const Details = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px 32px;
`;

const DetailBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 200px;
    flex: 1 1 260px;
`;

const DetailLabel = styled.p`
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.72px;
    color: #6b6b6b;
`;

const DetailValue = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
    color: #0a0a0a;
`;

const signUpButtonStyle = `
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    padding: 12px 24px;
    border-radius: 999px;
    background: #0a0a0a;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.03);
    }
`;

const SignUpButton = styled.a`${signUpButtonStyle}`;
const SignUpRouterLink = styled(Link)`${signUpButtonStyle}`;

const ComingSoonPill = styled.p`
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    margin: 0;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid #d8d8d4;
    color: #6b6b6b;
    font-size: 14px;
    font-weight: 500;
`;

const DetailsLink = styled.a`
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 6px;
    color: #0a0a0a;
    font-size: 14px;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.6;
    }
`;

const PhotoStrip = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const Photo = styled.img`
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 10px;
`;

const EventCard = ({
    number,
    termTag,
    extraTags = [],
    date,
    year,
    gradientFrom,
    gradientTo,
    title,
    description,
    highlight,
    duration,
    expected,
    format,
    venue,
    whoFor,
    status,
    signUpLink,
    detailsLink,
    photos = [],
    image,
}) => {
    return (
        <Card>
            <Visual $from={gradientFrom} $to={gradientTo} $image={image} $past={status === "past"}>
                <BigNumber>{number}</BigNumber>
                <Tags>
                    <Tag>{termTag}</Tag>
                    {extraTags.map((tag) => (
                        <Tag key={tag} $light>{tag}</Tag>
                    ))}
                </Tags>
                <DateBlock>
                    <DateText>{date}</DateText>
                    <YearText>{year}</YearText>
                </DateBlock>
            </Visual>

            <Content>
                <Title>{title}</Title>
                <Description>{description}</Description>

                {highlight && <Highlight>{highlight}</Highlight>}

                <Details>
                    <DetailBlock>
                        <DetailLabel>DURATION</DetailLabel>
                        <DetailValue>{duration}</DetailValue>
                    </DetailBlock>
                    <DetailBlock>
                        <DetailLabel>EXPECTED</DetailLabel>
                        <DetailValue>{expected}</DetailValue>
                    </DetailBlock>
                    <DetailBlock>
                        <DetailLabel>FORMAT</DetailLabel>
                        <DetailValue>{format}</DetailValue>
                    </DetailBlock>
                    {venue && (
                        <DetailBlock>
                            <DetailLabel>VENUE</DetailLabel>
                            <DetailValue>{venue}</DetailValue>
                        </DetailBlock>
                    )}
                    <DetailBlock>
                        <DetailLabel>WHO IT'S FOR</DetailLabel>
                        <DetailValue>{whoFor}</DetailValue>
                    </DetailBlock>
                </Details>

                {photos.length > 0 && (
                    <PhotoStrip>
                        {photos.map((photo, i) => (
                            <Photo key={i} src={photo} alt={`${title} photo ${i + 1}`} />
                        ))}
                    </PhotoStrip>
                )}

                {status === "next" && <ComingSoonPill>Sign up details coming soon</ComingSoonPill>}
                {status === "default" && signUpLink && (
                    signUpLink.startsWith("/") ? (
                        <SignUpRouterLink to={signUpLink}>Sign up</SignUpRouterLink>
                    ) : (
                        <SignUpButton href={signUpLink} target="_blank" rel="noreferrer">Sign up</SignUpButton>
                    )
                )}
                {status === "past" && detailsLink && (
                    <DetailsLink href={detailsLink} target="_blank" rel="noreferrer">See more details →</DetailsLink>
                )}
            </Content>
        </Card>
    );
};

export default EventCard;
