// src/app/contact/ContactClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to send message.');
      } else {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#111625] rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <nav className="text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:underline">Home</Link> / <span>Contact Support</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Support &amp; Feedback
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Have a question, feedback, or a document format request? Get in touch with our team.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm">
            <h3 className="font-bold text-base mb-1">Message Received!</h3>
            <p>Thank you for reaching out. We have logged your feedback and will review it promptly.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="hp_company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Message or Tool Request <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue, feature request, or feedback..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54] resize-none"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-500 font-semibold">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}