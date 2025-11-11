import React from 'react';
import styled from 'styled-components';
import Layout from '../components/layout';
import Hero from '../components/sections/hero';
import Chat from '../components/sections/chat';
import About from '../components/sections/about';
import Jobs from '../components/sections/jobs';
import Featured from '../components/sections/featured';
import Projects from '../components/sections/projects';
import Contact from '../components/sections/contact';
import { getFeaturedProjects } from '../lib/featured';
import { getProjects } from '../lib/projects';

const StyledMainContainer = styled.main`
  counter-reset: section;
`;

const IndexPage = ({ featuredProjects, projects }) => (
  <Layout>
    <StyledMainContainer className="fillHeight">
      <Hero />
      <Chat />
      <About />
      <Jobs />
      <Featured featuredProjects={featuredProjects} />
      <Projects projects={projects} />
      <Contact />
    </StyledMainContainer>
  </Layout>
);

export async function getStaticProps() {
  try {
    const featuredProjects = await getFeaturedProjects();
    const projects = await getProjects();
    
    return {
      props: {
        featuredProjects: featuredProjects || [],
        projects: projects || [],
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        featuredProjects: [],
        projects: [],
      },
    };
  }
}

export default IndexPage;