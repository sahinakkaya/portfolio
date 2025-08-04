import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Static site metadata
const siteMetadata = {
  defaultTitle: 'Şahin Akkaya',
  defaultDescription: 'Şahin Akkaya is a fullstack software developer passionate about free software and building tools that make people\'s lives easier.',
  siteUrl: 'https://sahinakkaya.dev',
  defaultImage: '/og.png',
  twitterUsername: '@sahinakkayadev',
};

const SEOHead = ({ title = null, description = null, image = null }) => {
  const router = useRouter();
  const pathname = router.asPath;

  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    defaultImage,
    twitterUsername,
  } = siteMetadata;

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${pathname}`,
  };

  return (
    <Head>
      <title>{title ? `${title} | ${defaultTitle}` : seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

    </Head>
  );
};

export default SEOHead;

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
};
