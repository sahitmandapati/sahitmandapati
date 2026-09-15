// Component Rendering
class ComponentRenderer {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  // Generate optimized placeholder image
  generatePlaceholderImage(title, type = 'project') {
    const colors = {
      'project': '#3b82f6',
      'insurance': '#059669', 
      'jobs': '#7c3aed',
      'default': '#6b7280'
    };
    
    const getColorForProject = (title) => {
      if (title.toLowerCase().includes('fatum') || title.toLowerCase().includes('c360')) return colors.insurance;
      if (title.toLowerCase().includes('phenom') || title.toLowerCase().includes('jobs')) return colors.jobs;
      return colors.project;
    };
    
    const color = getColorForProject(title);
    const firstLetter = title.charAt(0).toUpperCase();
    
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect width='400' height='200' fill='${color.replace('#', '%23')}'/><text x='50%' y='50%' text-anchor='middle' dy='.1em' font-family='Inter, Arial, sans-serif' font-size='48' font-weight='600' fill='white'>${firstLetter}</text><text x='50%' y='75%' text-anchor='middle' dy='.1em' font-family='Inter, Arial, sans-serif' font-size='16' fill='white' opacity='0.9'>${title}</text></svg>`;
  }

  // Helper function to create image with error handling
  createImageWithErrorHandling(src, alt, className = '') {
    const img = document.createElement('img');
    // Use placeholder image first for instant loading
    img.src = this.generatePlaceholderImage(alt);
    img.alt = alt;
    img.loading = 'lazy';
    img.className = className;
    
    // Load actual image in background if available
    if (src && src.startsWith('http')) {
      const actualImg = new Image();
      actualImg.onload = () => {
        img.src = src;
      };
      actualImg.onerror = () => {
        // Keep placeholder image on error
        console.log(`Failed to load image: ${src}`);
      };
      actualImg.src = src;
    }
    
    return img;
  }

  // Helper function to format date
  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Helper function to create icon element
  createIcon(iconName, className = 'icon') {
    const iconContainer = document.createElement('div');
    iconContainer.className = className;
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '1.25rem';
    iconContainer.style.height = '1.25rem';
    iconContainer.style.pointerEvents = 'none'; // Prevent icon from blocking clicks
    
    // Use SVG directly for better compatibility
    const svgContent = this.getIconFallback(iconName);
    if (svgContent) {
      iconContainer.innerHTML = svgContent;
      const svg = iconContainer.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        svg.style.pointerEvents = 'none'; // Prevent SVG from blocking clicks
      }
    }
    
    return iconContainer;
  }
  
  // Fallback SVG icons
  getIconFallback(iconName) {
    const fallbacks = {
      'github': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
      'linkedin': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      'twitter': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      'external-link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      'award': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>',
      'certificate': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
      'cloud': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
      'server': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="4" rx="1" ry="1"/><rect x="2" y="9" width="20" height="4" rx="1" ry="1"/><rect x="2" y="15" width="20" height="4" rx="1" ry="1"/><line x1="6" y1="5" x2="6" y2="5"/><line x1="6" y1="11" x2="6" y2="11"/><line x1="6" y1="17" x2="6" y2="17"/></svg>'
    };
    return fallbacks[iconName] || '';
  }

  // Render Social Links
  renderSocialLinks() {
    const container = document.getElementById('socialLinks');
    if (!container) return;

    const social = this.dataManager.getSocial();
    
    // Set favicon if available
    if (social.favicon) {
      const faviconLink = document.getElementById('favicon');
      if (faviconLink) {
        faviconLink.href = social.favicon;
      }
    }
    
    const links = [
      { href: social.github, icon: 'github', label: 'GitHub', external: true },
      { href: social.linkedin, icon: 'linkedin', label: 'LinkedIn', external: true },
      { href: social.x, icon: 'twitter', label: 'X', external: true },
      { href: `mailto:${social.email}`, icon: 'mail', label: 'Email', external: false }
    ];

    container.innerHTML = '';
    
    links.forEach(link => {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.className = 'social-link';
      anchor.setAttribute('aria-label', link.label);
      if (link.external) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      
      anchor.appendChild(this.createIcon(link.icon));
      const label = document.createElement('span');
      label.textContent = link.label;
      anchor.appendChild(label);
      container.appendChild(anchor);
    });
  }

  // Render Experience
  renderExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    const experience = this.dataManager.getExperience();
    container.innerHTML = '';

    experience.forEach((job, index) => {
      const item = document.createElement('div');
      item.className = 'experience-item';
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-delay', (index * 200).toString());

      item.innerHTML = `
        <div class="experience-card">
          <div class="experience-header">
            <div>
              <h3 class="experience-title">${job.position}</h3>
              <p class="experience-company">${job.company}</p>
            </div>
            <div class="experience-meta">
              <p>${job.period}</p>
              <p>${job.location}</p>
            </div>
          </div>
          
          <p class="experience-description">${job.description}</p>
          
          <ul class="experience-achievements">
            ${job.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
          
          <div class="experience-technologies">
            ${job.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
          </div>
        </div>
      `;

      container.appendChild(item);
    });
  }

  // Render Projects
  renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    const projects = this.dataManager.getProjects();
    container.innerHTML = '';

    projects.forEach((project, index) => {
      const item = document.createElement('div');
      item.className = 'project-card';
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-delay', (index * 200).toString());

      const githubIcon = this.createIcon('github');
      const externalIcon = this.createIcon('external-link');

      item.innerHTML = `
        <div class="project-image">
          <!-- Image will be added programmatically with error handling -->
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          
          <div class="project-technologies">
            ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
          </div>
          
          <div class="project-links">
            ${project.github ? `
              <a href="${project.github}" class="project-link" target="_blank" rel="noopener noreferrer">
                ${githubIcon.outerHTML}
                Code
              </a>
            ` : ''}
            ${project.demo ? `
              <a href="${project.demo}" class="project-link" target="_blank" rel="noopener noreferrer">
                ${externalIcon.outerHTML}
                Demo
              </a>
            ` : ''}
          </div>
        </div>
      `;
      
      // Add image with error handling
      const imageContainer = item.querySelector('.project-image');
      const img = this.createImageWithErrorHandling(project.image, project.title);
      imageContainer.appendChild(img);

      container.appendChild(item);
    });
  }

  // Render Certifications
  renderCertifications() {
    const container = document.getElementById('certificationsContainer');
    if (!container) return;

    const certifications = this.dataManager.getCertifications();
    container.innerHTML = '';

    certifications.forEach((cert, index) => {
      const item = document.createElement('div');
      item.className = 'certification-card';
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-delay', (index * 200).toString());

      // Create the main content structure
      item.innerHTML = `
        <div class="certification-icon">
          <!-- Icon will be added programmatically -->
        </div>
        <h3 class="certification-title">${cert.title}</h3>
        <p class="certification-issuer">${cert.issuer}</p>
        <p class="certification-date">${cert.date}</p>
      `;

      // Add icon after creating the HTML structure
      const iconContainer = item.querySelector('.certification-icon');
      
      // Fix icon mapping for certifications
      const iconMap = {
        'aws': 'cloud',
        'cloud': 'cloud', 
        'server': 'server',
        'certificate': 'certificate',
        'award': 'award'
      };
      
      const iconName = iconMap[cert.icon] || 'certificate';
      const icon = this.createIcon(iconName);
      iconContainer.appendChild(icon);

      container.appendChild(item);
    });
  }

  renderBlogs() {
    const container = document.getElementById('blogsContainer');
    if (!container) return;

    container.innerHTML = this.dataManager.getBlogs().map((blog, index) => `
      <article class="writing-card" data-aos="fade-up" data-aos-delay="${index * 120}">
        <div class="writing-card-top"><span>${blog.category}</span><span>${blog.date}</span></div>
        <h3>${blog.title}</h3>
        <p>${blog.description}</p>
        <a class="text-link" href="${blog.url}" target="_blank" rel="noopener noreferrer">Read the notes <span>↗</span></a>
      </article>
    `).join('');
  }

  renderBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;

    container.innerHTML = this.dataManager.getBooks().map((book, index) => `
      <a class="book-card" href="${book.url}" target="_blank" rel="noopener noreferrer" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="book-spine">0${index + 1}</div>
        <div class="book-content"><p class="book-status">${book.status}</p><h3>${book.title}</h3><p class="book-author">${book.author}</p><p class="book-description">${book.description}</p><span class="text-link">View book <span>↗</span></span></div>
      </a>
    `).join('');
  }

  // Render Contact Info
  renderContact() {
    const container = document.getElementById('contactInfo');
    if (!container) return;

    const social = this.dataManager.getSocial();
    
    container.innerHTML = '';
    
    // Create email link
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${social.email}`;
    emailLink.className = 'contact-link';
    emailLink.setAttribute('aria-label', 'Send Email');
    
    const emailIcon = this.createIcon('mail');
    emailLink.appendChild(emailIcon);
    
    const emailText = document.createElement('span');
    emailText.textContent = 'Send Email';
    emailLink.appendChild(emailText);
    
    // Create LinkedIn link
    const linkedinLink = document.createElement('a');
    linkedinLink.href = social.linkedin;
    linkedinLink.className = 'contact-link';
    linkedinLink.target = '_blank';
    linkedinLink.rel = 'noopener noreferrer';
    linkedinLink.setAttribute('aria-label', 'Connect on LinkedIn');
    
    const linkedinIcon = this.createIcon('linkedin');
    linkedinLink.appendChild(linkedinIcon);
    
    const linkedinText = document.createElement('span');
    linkedinText.textContent = 'Connect on LinkedIn';
    linkedinLink.appendChild(linkedinText);
    
    container.appendChild(emailLink);
    container.appendChild(linkedinLink);
  }

  // Render all components
  async renderAll() {
    try {
      await this.dataManager.loadData();
      
      this.renderSocialLinks();
      this.renderExperience();
      this.renderProjects();
      this.renderBlogs();
      this.renderBooks();
      this.renderCertifications();
      this.renderContact();
      
      // Initialize AOS animations after rendering
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 600,
          easing: 'ease-out-cubic',
          once: true,
          offset: 50
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to render components:', error);
      return false;
    }
  }
}

// Global component renderer instance
window.componentRenderer = null;

// Initialize when data manager is available
document.addEventListener('DOMContentLoaded', () => {
  if (window.dataManager) {
    window.componentRenderer = new ComponentRenderer(window.dataManager);
  }
});