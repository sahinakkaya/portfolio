import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const projectsDirectory = path.join(process.cwd(), 'content/projects');

export async function getProjects() {
  // Get all markdown files in the projects directory
  const fileNames = fs.readdirSync(projectsDirectory)
    .filter(name => name.endsWith('.md'));

  const projects = await Promise.all(
    fileNames.map(async fileName => {
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      console.log(content)

      // Skip if content is null or empty
      if (!content) {
        console.warn(`Warning: Empty content in ${fullPath}`);
        return null;
      }

      // Only include projects where showInProjects is true
      if (!data.showInProjects) {
        return null;
      }

      // Process markdown content to HTML
      const processedContent = await remark()
        .use(html)
        .process(content);
      const htmlContent = processedContent.toString();

      return {
        node: {
          frontmatter: data,
          html: htmlContent,
        },
      };
    })
  );

  // Filter out null values and sort by date (oldest first)
  return projects
    .filter(project => project !== null)
    .sort((a, b) => new Date(a.node.frontmatter.date) - new Date(b.node.frontmatter.date));
}
