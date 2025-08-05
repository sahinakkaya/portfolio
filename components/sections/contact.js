import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig, email } from '../../lib/config';
import sr from '../../src/utils/sr';
import { usePrefersReducedMotion } from '../../src/hooks';

const StyledContactSection = styled.section`
  max-width: 600px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .title {
    font-size: clamp(40px, 5vw, 60px);
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
    display: inline-block;
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">What's Next?</h2>

      <h2 className="title">Let's Work Together</h2>

      <p>
        I'm actively seeking new opportunities, particularly excited about transitioning into AI roles.
        My background in backend development gives me a strong foundation, and I'm confident in my ability
        to learn quickly and contribute meaningfully to AI projects. I'm also interested in companies
        that build developer tools.
      </p>

      <a className="email-link" href={`mailto:${email}`}>
        Get In Touch
      </a>
    </StyledContactSection>
  );
};

export default Contact;
