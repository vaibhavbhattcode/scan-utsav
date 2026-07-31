"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, BookOpen, Calendar, Tag, TrendingUp } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Event Tech" | "Wedding Planning" | "Festival Guides" | "SaaS Architecture";
  readTime: string;
  author: string;
  date: string;
  coverImage: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-collect-uncompressed-4k-wedding-photos",
    title: "How to Collect Uncompressed 4K Wedding Photos From 500 Guests",
    excerpt: "Learn how QR-based memory portals eliminate WhatsApp photo compression and gather RAW camera photos from all wedding guests instantly without any app downloads.",
    category: "Wedding Planning",
    readTime: "5 min read",
    author: "Ananya Sharma",
    date: "July 24, 2026",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    featured: true,
  },
  {
    slug: "top-10-indian-festival-qr-standee-designs",
    title: "Top 10 Indian Festival QR Standee Designs for Ganesh Utsav & Navratri",
    excerpt: "Discover print-ready standee poster designs with marigold, modak line-art, and garba mirrorwork borders that delight devotees and wedding guests alike.",
    category: "Festival Guides",
    readTime: "7 min read",
    author: "Vikram Sethi",
    date: "July 20, 2026",
    coverImage: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
  },
  {
    slug: "setting-up-live-venue-tv-slideshows",
    title: "Setting Up Live Venue TV Slideshows for Reception Halls & Pandals",
    excerpt: "Step-by-step guide to projecting real-time guest photo uploads on venue big screens with 15-second auto-polling and Ken Burns pan/zoom transitions.",
    category: "Event Tech",
    readTime: "4 min read",
    author: "Rohan Verma",
    date: "July 15, 2026",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
  },
  {
    slug: "ai-photo-moderation-wedding-events",
    title: "Why AI Photo Moderation is Essential for Large Wedding Events",
    excerpt: "Understand how computer vision quality filters protect your event gallery from blurry shots, duplicate uploads, and inappropriate content in real time.",
    category: "Event Tech",
    readTime: "6 min read",
    author: "Priya Mehta",
    date: "July 10, 2026",
    coverImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
  },
  {
    slug: "gst-invoicing-corporate-events-india",
    title: "GST Invoicing for Corporate Events: A Complete Guide for Planners",
    excerpt: "Everything corporate event organizers need to know about 18% GST billing, CGST vs SGST breakdown, and how to generate compliant invoices instantly.",
    category: "SaaS Architecture",
    readTime: "8 min read",
    author: "Rajesh Kulkarni",
    date: "July 5, 2026",
    coverImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
  },
  {
    slug: "dpdp-act-2023-event-photo-privacy",
    title: "DPDP Act 2023 Compliance for Event Photo & Video Collection",
    excerpt: "How India's new Digital Personal Data Protection Act affects wedding and festival photo collection platforms and what guests must consent to.",
    category: "SaaS Architecture",
    readTime: "5 min read",
    author: "Ananya Sharma",
    date: "June 28, 2026",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Wedding Planning": "bg-rose-100 text-rose-800 border-rose-300",
  "Festival Guides": "bg-amber-100 text-amber-900 border-amber-300",
  "Event Tech": "bg-blue-100 text-blue-800 border-blue-300",
  "SaaS Architecture": "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function BlogHubPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Event Tech", "Wedding Planning", "Festival Guides", "SaaS Architecture"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find((p) => p.featured) || filteredPosts[0];
  const restPosts = filteredPosts.filter((p) => p.slug !== featuredPost?.slug);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 py-14 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-950 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
            <BookOpen className="w-3.5 h-3.5 text-[#F2810C]" />
            SCANUTSAV JOURNAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display leading-tight">
            Event Tech & <span className="text-[#F2810C]">Celebration Guides</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Insights on wedding photo collection, festival QR standees, live TV streaming, and SaaS event architecture — updated weekly.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-2 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#F2810C]" /> 6 Articles Published</span>
            <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-[#F2810C]" /> 4 Categories</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#F2810C]" /> Updated Weekly</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C] font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                  selectedCategory === cat
                    ? "bg-[#F2810C] text-white border border-[#F2810C]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (Large Card) */}
        {featuredPost && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F2810C] text-white border border-[#F2810C] shadow-md">
                  ⭐ Featured Article
                </span>
              </div>
              <div className="p-8 flex flex-col justify-center space-y-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${CATEGORY_COLORS[featuredPost.category]}`}>
                  {featuredPost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-snug group-hover:text-[#F2810C] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featuredPost.date}</span>
                  <span>By {featuredPost.author}</span>
                </div>
                <div className="pt-2">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F2810C] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-md transition-all border border-[#F2810C]">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of Posts Grid */}
        {restPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 font-display mb-6">
              More Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-amber-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${CATEGORY_COLORS[post.category]}`}>
                        {post.category}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1 space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>

                      <h3 className="font-black text-slate-900 text-base font-display leading-snug group-hover:text-[#F2810C] transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-xs leading-relaxed font-medium line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-bold">By {post.author}</span>
                        <span className="text-xs font-black text-[#F2810C] flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Search className="w-8 h-8 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">No articles found</h3>
            <p className="text-slate-600 text-sm font-medium">Try a different search term or category filter.</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="px-5 py-2.5 bg-[#F2810C] text-white font-black text-xs rounded-xl shadow-md">
              Clear Filters
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="bg-[#F2810C] rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-2xl">
          <span className="text-xs font-black uppercase tracking-widest bg-white text-slate-900 px-4 py-1.5 rounded-full">
            JOIN THE JOURNAL
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
            Get Weekly Event Tech Insights
          </h3>
          <p className="text-amber-50 text-sm font-medium max-w-md mx-auto">
            Festival templates, wedding checklists & live TV setup guides — delivered free every week.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="your.email@gmail.com"
              className="flex-1 w-full px-4 py-2.5 rounded-xl text-xs text-slate-900 font-medium bg-white border border-white focus:outline-none focus:border-amber-300 placeholder-slate-400"
            />
            <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md border border-slate-900 flex-shrink-0 transition-all">
              Subscribe Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
