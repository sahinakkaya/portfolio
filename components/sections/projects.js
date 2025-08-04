import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '../../lib/config';
import sr from '../../src/utils/sr';
import { Icon } from '../icons';
import { usePrefersReducedMotion } from '../../src/hooks';

const StyledProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .archive-link {
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    &:after {
      bottom: 0.1em;
    }
  }

  .projects-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;
    list-style: none;
    padding: 0;
    margin-left: 0;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    /* Make last item span remaining columns if it's alone in the row */
    li:last-child:nth-child(3n+1) {
      grid-column: 1 / -1;
    }
    
    /* Make last two items span half width each if they're alone in the row */
    li:nth-last-child(2):nth-child(3n+2),
    li:last-child:nth-child(3n) {
      grid-column: span 1;
    }
    
    @media (max-width: 1080px) {
      /* Reset for tablet - make last item span full width if alone */
      li:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }
      
      /* Override the desktop rules */
      li:last-child:nth-child(3n+1),
      li:nth-last-child(2):nth-child(3n+2),
      li:last-child:nth-child(3n) {
        grid-column: auto;
      }
    }
    
    @media (max-width: 768px) {
      /* Reset all grid-column rules for mobile */
      li:last-child:nth-child(3n+1),
      li:nth-last-child(2):nth-child(3n+2),
      li:last-child:nth-child(3n),
      li:last-child:nth-child(odd) {
        grid-column: auto;
      }
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const StyledProject = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  &:hover,
  &:focus-within {
    .project-inner {
      transform: translateY(-7px);
    }
  }
  
  @media (prefers-reduced-motion: preference) {
    &:hover,
    &:focus-within {
      .project-inner {
        transform: none;
      }
    }
  }

  a {
    position: relative;
  }

  .project-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: hidden;
  }

  .project-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .project-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      a {
        ${({ theme }) => theme.mixins.flexCenter};
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .project-title {
    margin: 0;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
    flex: 1;

    a {
      position: static;

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .project-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .project-tech-list {
    display: flex;
    align-items: flex-end;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;

    li {
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
  
  .project-header {
    position: relative;
  }
  
  .project-content {
    position: relative;
    flex: 1;
    
    &:hover {
      ~ .project-image {
        transform: translateX(0);
      }
    }
  }
  
  .project-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
    z-index: 15;
    transition: all 0.4s ease;
    transform: translateX(100%);
    background: rgba(10, 25, 47, 0.8);
    pointer-events: none;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
`;

const Projects = ({ projects }) => {
  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealArchiveLink = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealArchiveLink.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const firstSix = projects.slice(0, GRID_LIMIT);
  const projectsToShow = showMore ? projects : firstSix;

  const projectInner = (node, index) => {
    const { frontmatter, html } = node;
    const { github, external, title, tech, image } = frontmatter;

    return (
      <div className="project-inner">
        <div className="project-header">
          <div className="project-top">
            <h3 className="project-title">
              <a href={external || github} target="_blank" rel="noreferrer">
                {title}
              </a>
            </h3>
            
            <div className="project-links">
              {github && (
                <a href={github} aria-label="GitHub Link" target="_blank" rel="noreferrer">
                  <Icon name="GitHub" />
                </a>
              )}
              {external && (
                <a
                  href={external}
                  aria-label="External Link"
                  className="external"
                  target="_blank"
                  rel="noreferrer">
                  <Icon name="External" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="project-content">
          <div className="project-description" dangerouslySetInnerHTML={{ __html: html }} />

          {tech && (
            <ul className="project-tech-list">
              {tech.map((tech, i) => (
                <li key={i}>{tech}</li>
              ))}
            </ul>
          )}
        </div>
        
        {image && (
          <div className="project-image">
            <img src={image} alt={`${title} screenshot`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <StyledProjectsSection>
      <h2 ref={revealTitle}>Other Noteworthy Projects</h2>

      <Link className="inline-link archive-link" href="/archive" ref={revealArchiveLink}>
        view the archive
      </Link>

      <ul className="projects-grid">
        {prefersReducedMotion ? (
          <>
            {projectsToShow &&
              projectsToShow.map(({ node }, i) => (
                <StyledProject key={i}>{projectInner(node, i)}</StyledProject>
              ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {projectsToShow &&
              projectsToShow.map(({ node }, i) => (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <StyledProject
                    key={i}
                    ref={el => (revealProjects.current[i] = el)}
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    {projectInner(node, i)}
                  </StyledProject>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </ul>

      <button className="more-button" onClick={() => setShowMore(!showMore)}>
        Show {showMore ? 'Less' : 'More'}
      </button>
    </StyledProjectsSection>
  );
};

export default Projects;
