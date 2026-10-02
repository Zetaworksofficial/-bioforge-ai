"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

const NAV_LINKS = [
  { href: '#research', label: 'Research' },
  { href: '#engine', label: 'Models' },
  { href: '#engine', label: 'Agents' },
  { href: '#engine', label: 'Forge' },
  { href: '#engine', label: 'API' },
  { href: '#about', label: 'About' },
];

export default function BioforgeNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out font-sans ${
          isScrolled 
            ? 'bg-background/85 backdrop-blur-md border-b border-soft-graphite py-4' 
            : 'bg-transparent border-b border-transparent py-6'
        }`}
      >
        <Container className="flex items-center justify-between">
          {/* Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bio-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm z-50"
            aria-label="BioForge AI Home"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="font-bold text-lg tracking-tight text-off-white">
              BIOFORGE
            </span>
            <span className="font-normal text-lg tracking-tight text-muted-white">
              AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link 
                key={`${link.label}-${link.href}`} 
                href={link.href}
                className="text-xs font-medium text-muted-white hover:text-off-white transition-colors tracking-widest uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bio-cyan rounded-sm px-1 py-0.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 z-50">
            <div className="hidden lg:block">
              <Link href="#engine" tabIndex={-1}>
                <Button variant="primary">ENTER FORGE</Button>
              </Link>
            </div>
            
            <button
              type="button"
              className="lg:hidden p-2 -mr-2 text-muted-white hover:text-off-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bio-cyan rounded-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        ref={menuRef}
        className={`fixed inset-0 z-40 bg-background flex flex-col pt-24 pb-8 lg:hidden transition-opacity duration-200 ease-out overflow-y-auto ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <Container className="flex flex-col flex-1">
          <nav className="flex flex-col gap-6 items-start mt-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={`mobile-${link.label}-${link.href}`}
                href={link.href}
                className="text-2xl font-bold tracking-tight text-off-white hover:text-bio-cyan transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bio-cyan rounded-sm uppercase"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-8 border-t border-soft-graphite">
            <Link href="#engine" tabIndex={-1} onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center py-4 text-base">
                ENTER FORGE
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}
