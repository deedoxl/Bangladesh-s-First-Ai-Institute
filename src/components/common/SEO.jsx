import React from 'react';
import { Helmet } from 'react-helmet-async';

// SEO Hidden Keywords Bank
const HIDDEN_KEYWORDS = "Badar Munir, Bangladesh AI startup institute, AI learning platform Bangladesh, DEEDOX AI tools, AI innovation hub Bangladesh, AI mentorship program, Learn AI in Bangladesh, AI courses online, Deep learning institute Bangladesh, AI technology training, Machine learning courses Bangladesh, Artificial intelligence programs, AI education platform, AI workshops Bangladesh, AI research institute, AI startup training, AI development courses, AI career guidance, Future AI leaders Bangladesh, AI online academy, AI innovation lab, AI skill development, AI coding tools, AI community Bangladesh, AI bootcamp, AI industry insights, AI tools for students, AI projects Bangladesh, AI startup support, AIh tutorials online, AI professional courses, Best AI institute for students in Bangladesh, Online AI courses for beginners, AI startup incubation Bangladesh, Learn AI and ML online Bangladesh, Advanced AI programs Bangladesh, AI workshops for students, AI innovation and research hub, AI coding challenges Bangladesh, Deep learning tutorials online, AI tools for entrepreneurs, AI training for professionals, AI startup mentorship program, Bangladesh AI education platform, Artificial intelligence tools online, AI career development Bangladesh, AI and machine learning online course, Future-ready AI skills, AI community projects Bangladesh, AI for business solutions, DEEDOX AI education platform, AI tutorials for startups, AI project guidance Bangladesh, AI tech education hub, AI leadership program, AI innovation challenges, Machine learning academy Bangladesh, AI professional mentorship, AI online learning platform, AI startup tools, AI knowledge sharing Bangladesh";

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
        "@id": `${siteUrl}/#organization`,
        "name": "DEEDOX",
        "url": siteUrl,
        "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`,
            "width": 512,
            "height": 512
        },
        "description": "Bangladesh’s First AI Startup Institute creating a thriving AI ecosystem for aspiring entrepreneurs, providing AI tools, courses, mentorship, and startup support.",
        "founder": {
            "@type": "Person",
            "name": "Badar Munir"
        },
        "foundingDate": "2026-01-01",
        "sameAs": [
            "https://www.facebook.com/deedox",
            "https://www.linkedin.com/company/deedox"
        ]
    };

    // 2. WebSite Schema
    const websiteSchema = {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "DEEDOX | Bangladesh’s First AI Startup Institute",
        "description": "Bangladesh’s First AI Startup Institute and AI Innovation Hub",
        "publisher": {
            "@id": `${siteUrl}/#organization`
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };

    // 3. Page Schema (WebPage or NewsArticle)
    const pageSchema = {
        "@type": type === 'article' ? 'NewsArticle' : 'WebPage',
        "@id": fullUrl,
        "url": fullUrl,
        "name": title || "DEEDOX | Bangladesh’s First AI Startup Institute & AI Innovation Hub",
        "headline": title || "DEEDOX | Bangladesh’s First AI Startup Institute",
        "description": description || "Join DEEDOX, Bangladesh’s First AI startup ecosystem. Empowering aspiring entrepreneurs with AI tools, mentorship, and innovative resources to build successful startups. Access AI courses, practical guidance, and a thriving AI community. Start your AI journey today and shape the future of technology in Bangladesh.",
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
            <title>{title ? `${title} | DEEDOX` : 'DEEDOX | Bangladesh’s First AI Startup Institute & AI Innovation Hub'}</title>
            <meta name="description" content={description || "Join DEEDOX, Bangladesh’s First AI startup ecosystem. Empowering aspiring entrepreneurs with AI tools, mentorship, and innovative resources to build successful startups. Access AI courses, practical guidance, and a thriving AI community. Start your AI journey today and shape the future of technology in Bangladesh."} />
            <meta name="keywords" content={metaKeywords} />
            <meta name="author" content={author || "DEEDOX"} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            {/* Open Graph / Facebook */}
            <meta property="og:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh’s First AI Startup Institute & AI Innovation Hub"} />
            <meta property="og:description" content={description || "Join DEEDOX, Bangladesh’s First AI startup ecosystem. Empowering aspiring entrepreneurs with AI tools, mentorship, and innovative resources to build successful startups."} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content="DEEDOX" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            {/* Twitter */}
            <meta name="twitter:title" content={title ? `${title} | DEEDOX` : "DEEDOX | Bangladesh’s First AI Startup Institute & AI Innovation Hub"} />
            <meta name="twitter:description" content={description || "Join DEEDOX, Bangladesh’s First AI startup ecosystem. Empowering aspiring entrepreneurs with AI tools, mentorship, and innovative resources to build successful startups."} />
            <meta name="twitter:image" content={metaImage} />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
