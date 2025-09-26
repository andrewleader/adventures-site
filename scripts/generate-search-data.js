const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// This script generates static JSON files for search functionality
// Run this during the build process to create the search data files
// This version reads content files directly without needing the TinaCMS server

function readContentFiles(contentDir) {
  const files = [];
  
  if (!fs.existsSync(contentDir)) {
    console.log(`Directory ${contentDir} does not exist, skipping...`);
    return files;
  }

  const items = fs.readdirSync(contentDir);
  
  for (const item of items) {
    const itemPath = path.join(contentDir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Recursively read subdirectories
      files.push(...readContentFiles(itemPath));
    } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
      try {
        const content = fs.readFileSync(itemPath, 'utf8');
        const parsed = matter(content);
        const relativePath = path.relative(path.join(process.cwd(), 'content'), itemPath);
        
        files.push({
          relativePath,
          data: parsed.data,
          content: parsed.content
        });
      } catch (error) {
        console.warn(`Error reading file ${itemPath}:`, error.message);
      }
    }
  }
  
  return files;
}

function generateSearchData() {
  try {
    console.log('Generating search data from content files...');

    const contentDir = path.join(process.cwd(), 'content');
    
    // Read all content files
    const areaFiles = readContentFiles(path.join(contentDir, 'areas'));
    const routeFiles = readContentFiles(path.join(contentDir, 'routes'));
    const tripPlanFiles = readContentFiles(path.join(contentDir, 'trip-plans'));
    const tripReportFiles = readContentFiles(path.join(contentDir, 'trip-reports'));

    // Process areas
    const areas = areaFiles.map(file => ({
      id: file.relativePath,
      title: file.data.title || '',
      slug: file.relativePath.replace('.mdx', '').replace('.md', ''),
      featuredImage: file.data.featuredImage || '',
      excerpt: file.data.excerpt || ''
    }));

    // Process routes
    const routes = routeFiles.map(file => ({
      id: file.relativePath,
      title: file.data.title || '',
      slug: file.relativePath.replace('.mdx', '').replace('.md', ''),
      featuredImage: file.data.featuredImage || '',
      excerpt: file.data.excerpt || ''
    }));

    // Process trip plans
    const tripPlans = tripPlanFiles.map(file => ({
      id: file.relativePath,
      title: file.data.title || '',
      slug: file.relativePath.replace('.mdx', '').replace('.md', ''),
      featuredImage: file.data.featuredImage || '',
      excerpt: file.data.excerpt || ''
    }));

    // Process trip reports
    const tripReports = tripReportFiles.map(file => ({
      id: file.relativePath,
      title: file.data.title || '',
      slug: file.relativePath.replace('.mdx', '').replace('.md', ''),
      featuredImage: file.data.featuredImage || '',
      excerpt: file.data.excerpt || ''
    }));

    // Ensure the public/api/search directories exist
    const searchDir = path.join(process.cwd(), 'public', 'api', 'search');
    if (!fs.existsSync(searchDir)) {
      fs.mkdirSync(searchDir, { recursive: true });
    }

    // Write the JSON files
    fs.writeFileSync(path.join(searchDir, 'areas.json'), JSON.stringify(areas, null, 2));
    fs.writeFileSync(path.join(searchDir, 'routes.json'), JSON.stringify(routes, null, 2));
    fs.writeFileSync(path.join(searchDir, 'trip-plans.json'), JSON.stringify(tripPlans, null, 2));
    fs.writeFileSync(path.join(searchDir, 'trip-reports.json'), JSON.stringify(tripReports, null, 2));

    console.log(`Generated search data:`);
    console.log(`- ${areas.length} areas`);
    console.log(`- ${routes.length} routes`);
    console.log(`- ${tripPlans.length} trip plans`);
    console.log(`- ${tripReports.length} trip reports`);

  } catch (error) {
    console.error('Error generating search data:', error);
    process.exit(1);
  }
}

generateSearchData();