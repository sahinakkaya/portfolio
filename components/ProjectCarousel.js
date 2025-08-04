import React, { useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
`;

const CarouselTrack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
`;

const CarouselSlide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 400px;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  .img {
    border-radius: var(--border-radius);
  }
`;

const CarouselNav = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 4;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavDot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$active ? 'var(--green)' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.$active ? 'var(--green)' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

const CarouselArrow = styled.button`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid var(--green);
  color: var(--green);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;

  &:hover {
    background: rgba(100, 255, 218, 0.2);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const CarouselWrapper = styled.div`
  &:hover {
    ${CarouselArrow} {
      opacity: 1;
    }
    ${CarouselTrack} {
      &:before {
        opacity: 0;
      }

      .img {
        filter: none;
      }
    }
  }
`;

const ProjectCarousel = ({ images, title, external, github }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }


  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <CarouselWrapper>
      <CarouselContainer>
        <CarouselTrack>
          {images.map((image, index) => (
            <CarouselSlide key={index} $active={index === currentIndex}>
              <Image
                src={image}
                alt={`${title} screenshot ${index + 1}`}
                className="img"
                width={700}
                height={438}
                style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
              />
            </CarouselSlide>
          ))}
        </CarouselTrack>

        {images.length > 1 && (
        <CarouselNav>
          <CarouselArrow onClick={goToPrevious}>
            ←
          </CarouselArrow>
          <DotsContainer>
            {images.map((_, index) => (
              <NavDot
                key={index}
                $active={index === currentIndex}
                onClick={() => goToSlide(index)}
              />
            ))}
          </DotsContainer>
          <CarouselArrow onClick={goToNext}>
            →
          </CarouselArrow>
        </CarouselNav>
        )}
      </CarouselContainer>
    </CarouselWrapper>
  );
};

export default ProjectCarousel;
