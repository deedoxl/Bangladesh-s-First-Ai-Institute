import React from 'react';
import { Helmet } from 'react-helmet-async';

// SEO Hidden Keywords Bank
const HIDDEN_KEYWORDS = "Bangladesh AI startup institute, Bangladesh first AI startup institute, AI ecosystem Bangladesh, AI startup ecosystem Bangladesh, DEEDOX AI institute, AI tools learning Bangladesh, AI for founders Bangladesh, AI for startups Bangladesh, AI adoption Bangladesh, AI innovation hub Bangladesh, AI education ecosystem, AI community Bangladesh, AI mentorship ecosystem, AI-powered startups Bangladesh, Future founders Bangladesh, AI tools for business Bangladesh, AI learning without coding, AI usage training Bangladesh, AI strategy for startups, AI-powered solutions Bangladesh, AI entrepreneurship Bangladesh, AI creators community, AI startup platform Bangladesh, AI innovation platform, AI future skills Bangladesh, AI growth ecosystem, AI tools education, AI founders platform, Bangladesh AI ecosystem platform, AI adoption institute Bangladesh, DEEDOX AI ecosystem";

const SEO = ({ title, description, keywords, image, url, type = 'website', datePublished, dateModified, author }) => {
    const siteUrl = 'https://deedox.site';
    const defaultImage = `${siteUrl}/logo.png`;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    // Ensure image has full URL
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;

    // Combine specific keywords with global hidden keywords
    const metaKeywords = keywords
        ? `${keywords}, ${HIDDEN_KEYWORDS}`
        : `DEEDOX, Badar Munir, ${HIDDEN_KEYWORDS}`;


    // --- JSON-LD Structured Data Schema ---

    // 1. Organization Schema
    const organizationSchema = {
        "@type": "Organization",
        "name": "DEEDOX",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`,
        "description": "Bangladesh’s First AI Startup Institute focused on AI usage, startup ecosystem building, and future-ready innovation.",
        "sameAs": [
            "https://www.facebook.com/deedox",
            "https://www.linkedin.com/company/deedox",
            "https://twitter.com/deedox"
        ]
    };

    // 2. WebSite Schema
    const websiteSchema = {
        "@type": "WebSite",
        "name": "DEEDOX",
        "url": siteUrl,
        "sitemap": "https://www.deedox.site/sitemap.xml"
    };

    // 3. Page Schema (WebPage or NewsArticle)
    const pageSchema = {
        "@type": type === 'article' ? 'NewsArticle' : 'WebPage',
        "@id": fullUrl,
        "url": fullUrl,
        "name": title || "Bangladesh’s First AI Startup Institute | DEEDOX",
        "headline": title || "Bangladesh’s First AI Startup Institute | DEEDOX",
        "description": description || "DEEDOX is Bangladesh’s first AI Startup Institute focused on practical AI usage, founder growth, and ecosystem building. We empower learners, creators, and startups to use AI tools effectively and build the future from Bangladesh.",
        "image": metaImage,
        "isPartOf": {
            "@id": `${siteUrl}/#website`
        },
        "publisher": {
            "@id": `${siteUrl}/#organization`
        },
        "inLanguage": "en-US"
    };

    if (type === 'article') {
        if (datePublished) pageSchema["datePublished"] = datePublished;
        if (dateModified) pageSchema["dateModified"] = dateModified;
        if (author) {
            pageSchema["author"] = {
                "@type": "Person",
                "name": author || "DEEDOX"
            };
        }
    }

    // Combine all into a Schema Graph
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            organizationSchema,
            websiteSchema,
            pageSchema
        ]
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh's First AI Institute"}</title>
            <meta name="description" content={description || "DEEDOX is Bangladesh’s first AI Startup Institute focused on practical AI usage, founder growth, and ecosystem building. We empower learners, creators, and startups to use AI tools effectively and build the future from Bangladesh."} />
            <meta name="keywords" content={metaKeywords} />
            <meta name="author" content={author || "DEEDOX"} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            {/* Open Graph / Facebook */}
            <meta property="og:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh's First AI Institute"} />
            <meta property="og:description" content={description || "DEEDOX is Bangladesh’s first AI Startup Institute focused on practical AI usage, founder growth, and ecosystem building."} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content="DEEDOX" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            {/* Twitter */}
            <meta name="twitter:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh's First AI Institute"} />
            <meta name="twitter:description" content={description || "DEEDOX is Bangladesh’s first AI Startup Institute focused on practical AI usage, founder growth, and ecosystem building."} />
            <meta name="twitter:image" content={metaImage} />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
