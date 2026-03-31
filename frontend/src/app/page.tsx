"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, List } from 'lucide-react';
import LocalItineraryBuilder from "@/components/LocalItineraryBuilder";

export default function PlannerPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="flex flex-col h-screen w-full font-sans bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-700 p-4 text-white shadow-md z-20 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold">Trip Planner Pro</h1>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          <Link
            href="/local"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
          >
            <List size={18} />
            Quản Lý Lịch Trình
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-indigo-600 rounded-lg transition"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-600 text-white shadow-md border-b border-indigo-500 shrink-0">
          <Link
            href="/local"
            className="flex px-6 py-3 hover:bg-indigo-700 transition items-center gap-2"
          >
            <List size={18} />
            Quản Lý Lịch Trình
          </Link>
        </div>
      )}

      {/* Main Content - Full Height */}
      <div className="flex-1 overflow-hidden">
        <LocalItineraryBuilder />
      </div>
    </main>
  );
}