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
        this.fetchJSON('./data/books.json', 'books')
      ];

      await Promise.all(promises);
      await this.loadBlogsFromMarkdownFolder();
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load data:', error);
      return false;
    }
  }

  async fetchJSON(url, key) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
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
    // Prefer the live directory listing so local dev servers pick up new posts instantly.
    const directoryFiles = await this.listBlogFilesFromDirectory();
    if (directoryFiles) {
      return this.setBlogsFromFiles(directoryFiles);
    }

    // Static hosts (e.g. GitHub Pages) don't serve directory listings, so fall back to the manifest.
    const manifestFiles = await this.listBlogFilesFromManifest();
    if (manifestFiles) {
      return this.setBlogsFromFiles(manifestFiles);
    }

    console.warn('No blog listing available (neither directory index nor manifest).');
    this.cache.set('blogs', { blogs: [] });
    return [];
  }

  async listBlogFilesFromDirectory() {
    try {
      const response = await fetch('./data/blogs/', { cache: 'no-store' });
      if (!response.ok) return null;

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const files = [...doc.querySelectorAll('a[href]')]
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && /\.md$/i.test(href))
        .map((href) => decodeURIComponent(href).split('/').pop());

      const uniqueFiles = [...new Set(files)];
      return uniqueFiles.length ? uniqueFiles : null;
    } catch (error) {
      console.warn('Directory listing not available, will try manifest instead.', error);
      return null;
    }
  }

  async listBlogFilesFromManifest() {
    try {
      const response = await fetch('./data/blogs/index.json', { cache: 'no-store' });
      if (!response.ok) return null;

      const manifest = await response.json();
      const files = Array.isArray(manifest) ? manifest : manifest.blogs || [];
      return files.length ? files : null;
    } catch (error) {
      console.warn('Blog manifest not available.', error);
      return null;
    }
  }

  async setBlogsFromFiles(fileNames) {
    const blogs = await Promise.all(fileNames.map((fileName) => this.loadMarkdownBlog(fileName)));
    const validBlogs = blogs.filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
    this.cache.set('blogs', { blogs: validBlogs });
    return validBlogs;
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
    // Strip the title line before pulling a description, otherwise the first paragraph (the title itself) gets reused as both
    content = this.stripDuplicateTitle(content, title);
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

  // The modal already shows the title in its header, so drop a leading line that just repeats it
  stripDuplicateTitle(content, title) {
    const lines = content.split('\n');
    let index = 0;
    while (index < lines.length && !lines[index].trim()) index += 1;
    if (index >= lines.length) return content;

    const firstLine = lines[index].trim().replace(/^#+\s*/, '').replace(/[*_`]/g, '').trim();
    if (firstLine.toLowerCase() !== title.trim().toLowerCase()) return content;

    lines.splice(index, 1);
    return lines.join('\n').trim();
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

  getBlogs() {
    return this.get('blogs')?.blogs || [];
  }

  getBooks() {
    return this.get('books')?.books || [];
  }
}

// Global data manager instance
window.dataManager = new DataManager();