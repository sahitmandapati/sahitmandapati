"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import social from "@/data/social.json";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/95 z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 z-10 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Sahit Mandapati
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Software Engineer
        </p>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
          Building exceptional digital experiences with modern web technologies.
          Focused on creating scalable and performant applications.
        </p>
        
        <div className="flex justify-center space-x-6">
          <SocialLink href={social.social.github} icon={Github} label="GitHub" />
          <SocialLink href={social.social.linkedin} icon={Linkedin} label="LinkedIn" />
          <SocialLink href={social.social.twitter} icon={Twitter} label="Twitter" />
          <SocialLink href={`mailto:${social.social.email}`} icon={Mail} label="Email" />
        </div>
      </motion.div>
    </section>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </a>
  );
}