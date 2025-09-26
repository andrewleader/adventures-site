// Static build client that reads from filesystem instead of GraphQL server
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

export class StaticTinaClient {
  
  async area({ relativePath }: { relativePath: string }) {
    const filePath = path.join(contentDir, 'areas', relativePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Area not found: ${relativePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    return {
      data: {
        area: {
          id: relativePath,
          ...parsed.data,
          _sys: {
            relativePath,
            filename: path.basename(relativePath, '.mdx'),
          },
          body: parsed.content
        }
      }
    };
  }

  async route({ relativePath }: { relativePath: string }) {
    const filePath = path.join(contentDir, 'routes', relativePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Route not found: ${relativePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    return {
      data: {
        route: {
          id: relativePath,
          ...parsed.data,
          _sys: {
            relativePath,
            filename: path.basename(relativePath, '.mdx'),
          },
          body: parsed.content
        }
      }
    };
  }

  async routeConnection({ first = 50 }: { first?: number } = {}) {
    const routesDir = path.join(contentDir, 'routes');
    
    if (!fs.existsSync(routesDir)) {
      return {
        data: {
          routeConnection: {
            edges: [],
            totalCount: 0,
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: false,
              startCursor: '',
              endCursor: ''
            }
          }
        }
      };
    }

    const files = this.getAllMdxFiles(routesDir);
    const routes = files.slice(0, first).map(file => {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const parsed = matter(content);
      
      return {
        cursor: file.relativePath,
        node: {
          __typename: 'Route',
          id: file.relativePath,
          ...parsed.data,
          _sys: {
            relativePath: file.relativePath,
            filename: file.filename,
          },
          body: parsed.content
        }
      };
    });

    return {
      data: {
        routeConnection: {
          edges: routes,
          totalCount: files.length,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: files.length > first,
            startCursor: routes[0]?.cursor || '',
            endCursor: routes[routes.length - 1]?.cursor || ''
          }
        }
      }
    };
  }

  async areaConnection({ first = 50 }: { first?: number } = {}) {
    return this.getConnection('areas', 'Area', first);
  }

  async postConnection({ first = 50 }: { first?: number } = {}) {
    return this.getConnection('posts', 'Post', first);
  }

  async tripPlanConnection({ first = 50 }: { first?: number } = {}) {
    return this.getConnection('trip-plans', 'TripPlan', first);
  }

  async tripReportConnection({ first = 50 }: { first?: number } = {}) {
    return this.getConnection('trip-reports', 'TripReport', first);
  }

  async pageConnection({ first = 50 }: { first?: number } = {}) {
    return this.getConnection('pages', 'Page', first);
  }

  async post({ relativePath }: { relativePath: string }) {
    return this.getSingle('posts', 'post', relativePath);
  }

  async tripPlan({ relativePath }: { relativePath: string }) {
    return this.getSingle('trip-plans', 'tripPlan', relativePath);
  }

  async tripReport({ relativePath }: { relativePath: string }) {
    return this.getSingle('trip-reports', 'tripReport', relativePath);
  }

  async page({ relativePath }: { relativePath: string }) {
    return this.getSingle('pages', 'page', relativePath);
  }

  private getSingle(contentType: string, dataKey: string, relativePath: string) {
    // Decode URL-encoded path
    const decodedPath = decodeURIComponent(relativePath);
    const filePath = path.join(contentDir, contentType, decodedPath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`${contentType} not found: ${relativePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    return {
      data: {
        [dataKey]: {
          id: decodedPath,
          ...parsed.data,
          _sys: {
            relativePath: decodedPath,
            filename: path.basename(decodedPath, '.mdx'),
            breadcrumbs: decodedPath.replace('.mdx', '').split('/'),
          },
          body: parsed.content
        }
      }
    };
  }

  private getConnection(contentType: string, typename: string, first: number) {
    const contentTypeDir = path.join(contentDir, contentType);
    
    // Map content types to their connection names
    const connectionNameMap: Record<string, string> = {
      'areas': 'areaConnection',
      'posts': 'postConnection',
      'routes': 'routeConnection',
      'trip-plans': 'tripPlanConnection',
      'trip-reports': 'tripReportConnection',
      'pages': 'pageConnection'
    };
    
    const connectionName = connectionNameMap[contentType] || `${contentType}Connection`;
    
    if (!fs.existsSync(contentTypeDir)) {
      return {
        data: {
          [connectionName]: {
            edges: [],
            totalCount: 0,
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: false,
              startCursor: '',
              endCursor: ''
            }
          }
        }
      };
    }

    const files = this.getAllMdxFiles(contentTypeDir);
    const items = files.slice(0, first).map(file => {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const parsed = matter(content);
      
      return {
        cursor: file.relativePath,
        node: {
          __typename: typename,
          id: file.relativePath,
          ...parsed.data,
          _sys: {
            relativePath: file.relativePath,
            filename: file.filename,
            breadcrumbs: file.relativePath.replace('.mdx', '').split('/'),
          },
          body: parsed.content
        }
      };
    });

    return {
      data: {
        [connectionName]: {
          edges: items,
          totalCount: files.length,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: files.length > first,
            startCursor: items[0]?.cursor || '',
            endCursor: items[items.length - 1]?.cursor || ''
          }
        }
      }
    };
  }

  private getAllMdxFiles(dir: string): Array<{ fullPath: string; relativePath: string; filename: string }> {
    const files: Array<{ fullPath: string; relativePath: string; filename: string }> = [];
    
    const readDir = (currentDir: string, relativePath = '') => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          readDir(fullPath, path.join(relativePath, item));
        } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
          const relPath = path.join(relativePath, item);
          files.push({
            fullPath,
            relativePath: relPath,
            filename: path.basename(item, path.extname(item))
          });
        }
      }
    };
    
    readDir(dir);
    return files;
  }
}

// Create a client that uses filesystem or regular TinaCMS client based on environment
const createClient = () => {
  if (process.env.TINA_SKIP_BUILD === 'true' || process.env.NODE_ENV === 'production') {
    console.log('Using static TinaCMS client for production build');
    return { queries: new StaticTinaClient() };
  } else {
    // Use regular TinaCMS client
    try {
      const client = require('@/tina/__generated__/client').default;
      return client;
    } catch (error) {
      console.warn('TinaCMS client not available, falling back to static client');
      return { queries: new StaticTinaClient() };
    }
  }
};

export default createClient();