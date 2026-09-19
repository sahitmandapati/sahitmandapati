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
        this.fetchJSON('./data/certifications.json', 'certifications'),
        this.fetchJSON('./data/books.json', 'books')
      ];

      await Promise.all(promises);
      await this.loadBlogsFromMarkdownFolder();
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

  async loadBlogsFromMarkdownFolder() {
    try {
      const manifestResponse = await fetch('./data/blogs/index.json', { cache: 'no-store' });
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        const blogFiles = Array.isArray(manifest) ? manifest : manifest.blogs || [];
        const blogs = await Promise.all(
          blogFiles.map((fileName) => this.loadMarkdownBlog(fileName))
        );
        const validBlogs = blogs.filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
        this.cache.set('blogs', { blogs: validBlogs });
        return validBlogs;
      }
    } catch (error) {
      console.warn('Blog manifest not available, falling back to directory listing.', error);
    }

    try {
      const response = await fetch('./data/blogs/', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to list blog directory: ${response.status}`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const links = [...doc.querySelectorAll('a[href]')]
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && /\.md$/i.test(href))
        .map((href) => decodeURIComponent(href).replace(/^\//, ''));

      if (!links.length) {
        this.cache.set('blogs', { blogs: [] });
        return [];
      }

      const blogs = await Promise.all(
        [...new Set(links)].map((fileName) => this.loadMarkdownBlog(fileName))
      );

      const validBlogs = blogs
        .filter(Boolean)
        .sort((a, b) => a.title.localeCompare(b.title));

      this.cache.set('blogs', { blogs: validBlogs });
      return validBlogs;
    } catch (error) {
      console.warn('Markdown blog discovery failed, falling back to empty blog list.', error);
      this.cache.set('blogs', { blogs: [] });
      return [];
    }
  }

  async loadMarkdownBlog(fileName) {
    try {
      const response = await fetch(`./data/blogs/${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      return this.parseMarkdownBlog(markdown, fileName);
    } catch (error) {
      console.error(`Failed to load blog file: ${fileName}`, error);
      return null;
    }
  }

  parseMarkdownBlog(markdown, fileName) {
    const normalized = markdown.trim();
    let frontMatter = {};
    let content = normalized;

    if (normalized.startsWith('---')) {
      const end = normalized.indexOf('\n---', 4);
      if (end !== -1) {
        const frontMatterBlock = normalized.slice(4, end).trim();
        frontMatterBlock.split('\n').forEach((line) => {
          const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
          if (match) {
            const [, key, value] = match;
            frontMatter[key.trim()] = value.trim();
          }
        });
        content = normalized.slice(end + 4).trim();
      }
    }

    const fallbackTitle = fileName.replace(/\.md$/i, '').replace(/[_-]+/g, ' ');
    const title = frontMatter.title || this.extractMarkdownTitle(content) || fallbackTitle;
    const description = frontMatter.description || this.extractMarkdownDescription(content) || 'Read the full note.';
    const category = frontMatter.category || 'Notes';
    const date = frontMatter.date || 'Updated recently';

    return {
      id: `${fileName}`,
      file: fileName,
      title,
      description,
      category,
      date,
      url: `./data/blogs/${encodeURIComponent(fileName)}`,
      content
    };
  }

  extractMarkdownTitle(markdown) {
    const heading = markdown.match(/^#\s+(.+)$/m);
    if (heading) return heading[1].trim();

    const firstLine = markdown.split('\n').find((line) => line.trim() && !line.startsWith('!['));
    return firstLine ? firstLine.replace(/[#>*_`\[\]()]/g, '').trim() : '';
  }

  extractMarkdownDescription(markdown) {
    const contentWithoutFrontMatter = markdown.replace(/^---[\s\S]*?---\s*/, '').replace(/^#.*\n+/m, '');
    const lines = contentWithoutFrontMatter
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('![') && !line.startsWith('```') && !line.startsWith('#') && !line.startsWith('- ') && !line.startsWith('* '));

    const firstParagraph = lines.find((line) => line.length > 20);
    if (!firstParagraph) return 'Read the full note.';

    const cleaned = firstParagraph.replace(/[*_`]/g, '').trim();
    return cleaned.length > 170 ? `${cleaned.slice(0, 170)}...` : cleaned;
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

    this.cache.set('blogs', { blogs: [] });
    this.cache.set('books', { books: [] });

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

  getBlogs() {
    return this.get('blogs')?.blogs || [];
  }

  getBooks() {
    return this.get('books')?.books || [];
  }
}

// Global data manager instance
window.dataManager = new DataManager();