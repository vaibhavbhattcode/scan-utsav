export interface EventSEOConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  startDate?: string;
  locationName?: string;
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
      config.image || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
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
    "name": "ScanUtsav",
    "operatingSystem": "All",
    "applicationCategory": "EventMemoryApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "India's most premium QR-based Event Memory Platform. Scan Once. Relive Forever."
  };
}
