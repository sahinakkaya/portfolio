import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const featuredDirectory = path.join(process.cwd(), 'content/featured');

export async function getFeaturedProjects() {
  // Get all directories in the featured folder
  const directories = fs.readdirSync(featuredDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const projects = await Promise.all(
    directories.map(async (dir) => {
      const fullPath = path.join(featuredDirectory, dir, 'index.md');

      // Check if index.md exists
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      console.log(content)

      // Skip if content is null or empty
      if (!content) {
        console.warn(`Warning: Empty content in ${fullPath}`);
        return null;
      }

      // Process markdown content to HTML
      const processedContent = await remark()
        .use(html)
        .process(content);
      const htmlContent = processedContent.toString();

      // Process image paths to be relative to public folder
      const processedData = { ...data };

      // Handle cover image path
      if (processedData.cover && processedData.cover.startsWith('./')) {
        processedData.cover = `/content/featured/${dir}/${processedData.cover.slice(2)}`;
      }

      // Handle images array paths
      if (processedData.images && Array.isArray(processedData.images)) {
        processedData.images = processedData.images.map((img) =>
          img.startsWith('./') ? `/content/featured/${dir}/${img.slice(2)}` : img,
        );
      }

      return {
        frontmatter: processedData,
        html: htmlContent,
        slug: dir,
      };
    })
  );

  // Filter out null values and sort by date
  return projects
    .filter(project => project !== null)
    .sort((a, b) => parseInt(a.frontmatter.date) - parseInt(b.frontmatter.date));
}
