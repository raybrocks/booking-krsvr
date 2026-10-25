import React from "react";
import { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Share Your Feedback | KRS VR Arena Kristiansand",
  description:
    "Tell us about your visit to KRS VR Arena in Kristiansand or share a review on Google Maps and Tripadvisor.",
  alternates: {
    canonical: "https://www.krsvr.no/en/feedback",
    languages: {
      "nb-NO": "https://www.krsvr.no/feedback",
      en: "https://www.krsvr.no/en/feedback",
      "x-default": "https://www.krsvr.no/en/feedback",
    },
  },
};

export default function EnglishFeedbackPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light text-white text-center mb-12 tracking-tight">
          We Would Love to Hear From You
        </h1>
        <FeedbackForm locale="en" />
      </div>
    </div>
  );
}
