// Data Loading and Management
class DataManager {
  constructor() {
    this.cache = new Map();
    this.isLoaded = false;
  }

  async loadData() {
    if (this.isLoaded) return true;

    try {
      const promises = [
        this.fetchJSON('./data/social.json', 'social'),
        this.fetchJSON('./data/experience.json', 'experience'),
        this.fetchJSON('./data/projects.json', 'projects'),
        this.fetchJSON('./data/certifications.json', 'certifications')
      ];

      await Promise.all(promises);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load data:', error);
      this.loadFallbackData();
      return false;
    }
  }

  async fetchJSON(url, key) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.cache.set(key, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${key}:`, error);
      throw error;
    }
  }

  loadFallbackData() {
    // Fallback data with current user information
    this.cache.set('social', {
      social: {
        github: 'https://github.com/sahitmandapati',
        linkedin: 'https://www.linkedin.com/in/sahit-mandapati/',
        x: 'https://x.com/sahitmandapati',
        email: 'sahitdev0@gmail.com',
        phone: '7735210829',
        location: 'Hyderabad, India',
        favicon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>"
      }
    });

    this.cache.set('experience', {
      workExperience: [
        {
          id: 1,
          company: 'Technovert',
          position: 'Software Engineer',
          period: 'November 2022 – Present',
          location: 'Hyderabad, India',
          description: 'Developing scalable insurance solutions with focus on quote generation, purchase flows, and secure payment integrations.',
          achievements: [
            'Delivered an end-to-end quote generation and purchase system, providing a seamless user journey',
            'Implemented client-side validation on dynamic forms and improved data accuracy by 15%',
            'Developed a document generation feature, improving document customization and adaptability by 30%'
          ],
          technologies: ['C#', '.NET 8', 'React', 'JavaScript', 'Material-UI']
        },
        {
          id: 2,
          company: 'Phenom',
          position: 'Software Engineer',
          period: 'June 2021 – July 2022',
          location: 'Hyderabad, India',
          description: 'Built responsive job portal solutions and recommendation systems.',
          achievements: [
            'Standardized skills and job ontologies with 40% improved precision',
            'Engineered responsive front end with 50% reduction in load times'
          ],
          technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Material-UI']
        }
      ]
    });

    this.cache.set('projects', {
      projects: [
        {
          id: 1,
          title: 'Fatum',
          description: 'Insurance Portal for the Kingdom of the Netherlands',
          image: '',
          technologies: ['C#', '.NET 8', 'React', 'JavaScript', 'Material-UI'],
          github: 'https://github.com/sahitmandapati',
          demo: '',
          featured: true
        },
        {
          id: 2,
          title: 'C360',
          description: 'Insurance Portal for the Caribbean',
          image: '',
          technologies: ['C#', '.NET 8', 'React', 'JavaScript', 'Material-UI'],
          github: 'https://github.com/sahitmandapati',
          demo: '',
          featured: true
        },
        {
          id: 3,
          title: 'Phenom Jobs Portal',
          description: 'Advanced job portal with intelligent job matching',
          image: '',
          technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Material-UI'],
          github: 'https://github.com/sahitmandapati',
          demo: '',
          featured: true
        }
      ]
    });

    this.cache.set('certifications', {
      certifications: [
        {
          id: 1,
          title: 'Bachelors in Computer Science',
          issuer: 'Gitam University',
          date: 'June 2021',
          icon: 'certificate'
        },
        {
          id: 2,
          title: 'Above and Beyond Award',
          issuer: 'Technovert',
          date: 'December 2023',
          icon: 'award'
        }
      ]
    });

    this.isLoaded = true;
  }

  get(key) {
    return this.cache.get(key);
  }

  getSocial() {
    return this.get('social')?.social || {};
  }

  getExperience() {
    return this.get('experience')?.workExperience || [];
  }

  getProjects() {
    return this.get('projects')?.projects || [];
  }

  getCertifications() {
    return this.get('certifications')?.certifications || [];
  }


}

// Global data manager instance
window.dataManager = new DataManager();