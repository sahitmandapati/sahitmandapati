"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Twitter, Briefcase } from "lucide-react";
import social from "@/data/social.json";

export default function Contact() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <p className="text-muted-foreground mb-4">
            I'm always interested in hearing about new projects and opportunities.
            Whether you have a question or just want to say hi, feel free to reach out!
          </p>
          <div className="bg-primary/10 p-4 rounded-lg mb-8">
            <Briefcase className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold mb-2">Open for Freelance Projects</p>
            <p className="text-sm text-muted-foreground">
              Currently accepting new freelance projects. Let's discuss how I can help bring your ideas to life.
            </p>
          </div>

          <div className="flex justify-center space-x-6 mb-8">
            <SocialLink
              href={`mailto:${social.social.email}`}
              icon={Mail}
              label="Email"
            />
            <SocialLink
              href={social.social.github}
              icon={Github}
              label="GitHub"
            />
            <SocialLink
              href={social.social.linkedin}
              icon={Linkedin}
              label="LinkedIn"
            />
            <SocialLink
              href={social.social.twitter}
              icon={Twitter}
              label="Twitter"
            />
          </div>

          <a
            href={social.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Download Resume
          </a>
        </motion.div>
      </div>
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