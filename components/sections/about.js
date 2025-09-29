import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { srConfig } from '../../lib/config';
import sr from '../../src/utils/sr';
import { usePrefersReducedMotion } from '../../src/hooks';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;
const StyledText = styled.div`
  ul.skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    grid-gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`;
const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);

      &:after {
        transform: translate(8px, 8px);
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 14px;
      left: 14px;
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const skills = ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React', 'TypeScript', 'Linux', 'Git'];

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              Hello! My name is Şahin and I'm a fullstack software developer who loves building
              practical solutions. My journey into programming started when I was 6th grade. I
              was using Excel to manage my grades and I was fascinated by how I could use formulas
              and make computer do the math for me.
            </p>

            <p>
              This early exposure to programming led me to pursue Computer Engineering at{' '}
              <a href="https://www.itu.edu.tr/en" target="_blank" rel="noreferrer">Istanbul Technical University</a>.
              During my studies, I fell in love with Python and its simplicity. Later, various job opportunities
              naturally led me to focus more on backend development, API design, and building robust infrastructure
              that powers applications behind the scenes.
            </p>

            <p>
              I enjoy sharing my experiences and discoveries through my{' '}
              <a href="https://blog.sahinakkaya.dev" target="_blank" rel="noreferrer">personal blog</a>,
              where I write about technical challenges and solutions I encounter. When I'm not coding,
              you may find me playing chess ♟️, working out 💪, or watching movies 🍿.
            </p>

            <p>Here are a few technologies I've been working with recently:</p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <Image
              className="img"
              src="/images/me.jpg"
              width={500}
              height={500}
              quality={95}
              alt="Headshot"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
