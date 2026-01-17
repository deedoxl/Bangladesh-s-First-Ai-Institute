import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website', datePublished, dateModified, author }) => {
    const siteUrl = 'https://deedox.site'; // Updated domain
    const defaultImage = 'https://deedox.site/your-social-image.jpg'; // Updated default image
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const metaImage = image || defaultImage;

    // JSON-LD Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": type === 'article' ? 'NewsArticle' : 'WebPage',
        "name": title || "DEEDOX | Bangladesh’s First AI Startup Institute",
        "description": description || "Discover AI tools, programs, and latest AI news at DEEDOX, Bangladesh’s first AI startup institute.",
        "url": fullUrl,
        "publisher": {
            "@type": "Organization",
            "name": "DEEDOX",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        }
    };

    if (type === 'article') {
        structuredData["headline"] = title;
        structuredData["image"] = [metaImage];
        if (datePublished) structuredData["datePublished"] = datePublished;
        if (dateModified) structuredData["dateModified"] = dateModified;
        if (author) {
            structuredData["author"] = {
                "@type": "Person",
                "name": author || "DEEDOX"
            };
        }
    }

    return (
        <Helmet>
            {/* Standard Metadata */}
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title ? `${title} | DEEDOX` : 'DEEDOX | Bangladesh’s First AI Startup Institute'}</title>
            <meta name="description" content={description || "DEEDOX | Bangladesh’s First AI Startup Institute. Discover AI tools, programs, and latest AI news."} />
            <meta name="keywords" content={keywords || "Bangladesh AI startup, AI institute, AI tools, AI programs, AI news, DEEDOX"} />
            <meta name="author" content={author || "DEEDOX"} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh’s First AI Startup Institute"} />
            <meta property="og:description" content={description || "Discover AI tools, programs, and latest AI news at DEEDOX, Bangladesh’s first AI startup institute."} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh’s First AI Startup Institute"} />
            <meta name="twitter:description" content={description || "Discover AI tools, programs, and latest AI news at DEEDOX, Bangladesh’s first AI startup institute."} />
            <meta name="twitter:image" content={metaImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
