export interface EventSEOConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  startDate?: string;
  locationName?: string;
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ScanUtsav",
    "legalName": "ScanUtsav EventTech Solutions Private Limited",
    "url": "https://scanutsav.com",
    "logo": "https://scanutsav.com/images/logo-icon.webp",
    "sameAs": [
      "https://instagram.com/scanutsav",
      "https://facebook.com/scanutsav",
      "https://twitter.com/scanutsav"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9876543210",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Gujarati", "Marathi"]
    }
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ScanUtsav",
    "url": "https://scanutsav.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://scanutsav.com/e/{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateEventSchema(config: EventSEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": config.title,
    "description": config.description,
    "startDate": config.startDate || new Date().toISOString(),
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": config.locationName || "ScanUtsav Live Memory Wall",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      }
    },
    "image": [
      config.image || "https://scanutsav.com/images/royal-wedding.webp"
    ],
    "organizer": {
      "@type": "Organization",
      "name": "ScanUtsav",
      "url": "https://scanutsav.com"
    }
  };
}

export function generatePlatformSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ScanUtsav - QR Event Memory & Live Photo Stream",
    "operatingSystem": "All (Web, iOS, Android)",
    "applicationCategory": "EventApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1280",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "description": "India's #1 QR code photo sharing app for Weddings, Navratri Garba, Sangeet, Corporate Events & Festivals. Guests scan QR standees to instantly upload 4K photos & videos to live venue screens."
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
