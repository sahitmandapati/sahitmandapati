"use client";

import { motion } from "framer-motion";
import experience from "@/data/experience.json";

export default function Experience() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-12 text-center"
        >
          Work Experience
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          {experience.workExperience.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="mb-12 last:mb-0"
            >
              <div className="bg-card rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{job.position}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 md:mt-0">
                    <p>{job.period}</p>
                    <p>{job.location}</p>
                  </div>
                </div>

                <p className="text-card-foreground mb-4">{job.description}</p>

                <ul className="list-disc list-inside mb-4 space-y-2">
                  {job.achievements.map((achievement, i) => (
                    <li key={i} className="text-muted-foreground">{achievement}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {job.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-12 mt-20 text-center"
        >
          Freelance Projects
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          {experience.freelanceExperience.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="mb-12 last:mb-0"
            >
              <div className="bg-card rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{project.project}</h3>
                    <p className="text-muted-foreground">{project.client}</p>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 md:mt-0">
                    <p>{project.period}</p>
                  </div>
                </div>

                <p className="text-card-foreground mb-4">{project.description}</p>

                <ul className="list-disc list-inside mb-4 space-y-2">
                  {project.achievements.map((achievement, i) => (
                    <li key={i} className="text-muted-foreground">{achievement}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}