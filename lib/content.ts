import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface Course {
  id: string;
  title: string;
  title_en: string;
  description: string;
  lectures?: { id: string; title: string; title_en: string; pages: number; date: string }[];
}

export interface Lecture {
  id: string;
  course: string;
  title: string;
  title_en: string;
  pages: number;
  source_file: string;
  blocks: string[];
}

export interface Block {
  id: string;
  course: string;
  lecture: string;
  title: string;
  title_en: string;
  pages: string;
  topics: string[];
  status: string;
  explanationPath?: string;
  blockDir?: string;
}

function readYaml(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content);
  } catch (e) {
    console.error(`[readYaml] Failed to parse ${filePath}:`, e);
    return null;
  }
}

function readMdx(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export function getAllCourses(): Course[] {
  const courses: Course[] = [];
  const coursesDir = path.join(CONTENT_DIR, 'courses');
  
  if (!fs.existsSync(coursesDir)) return courses;
  
  const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const dir of courseDirs) {
    const courseYml = path.join(coursesDir, dir.name, 'course.yml');
    const data = readYaml(courseYml);
    if (data) {
      courses.push({ id: dir.name, ...data });
    }
  }
  
  return courses;
}

export function getCourse(courseId: string): Course | null {
  const courseYml = path.join(CONTENT_DIR, 'courses', courseId, 'course.yml');
  const data = readYaml(courseYml);
  if (!data) return null;
  
  // Also get lecture list
  const lecturesDir = path.join(CONTENT_DIR, 'courses', courseId, 'lectures');
  const lectures: Course['lectures'] = [];
  
  if (fs.existsSync(lecturesDir)) {
    const lecDirs = fs.readdirSync(lecturesDir, { withFileTypes: true })
      .filter(d => d.isDirectory());
    
    for (const lecDir of lecDirs) {
      const sourceYml = path.join(lecturesDir, lecDir.name, 'source.yml');
      const lecData = readYaml(sourceYml);
      if (lecData) {
        lectures.push({
          id: lecDir.name,
          title: lecData.title,
          title_en: lecData.title_en,
          pages: lecData.pages,
          date: lecData.date instanceof Date
            ? lecData.date.toISOString().slice(0, 10)
            : String(lecData.date ?? ''),
        });
      }
    }
  }
  
  return { id: courseId, ...data, lectures };
}

export function getLecture(courseId: string, lectureId: string): Lecture | null {
  const sourceYml = path.join(CONTENT_DIR, 'courses', courseId, 'lectures', lectureId, 'source.yml');
  const data = readYaml(sourceYml);
  if (!data) return null;
  return { id: lectureId, course: courseId, ...data };
}

export function getBlock(courseId: string, lectureId: string, blockId: string): Block | null {
  const blockDir = path.join(CONTENT_DIR, 'courses', courseId, 'lectures', lectureId, 'blocks', blockId);
  const blockYml = path.join(blockDir, 'block.yml');
  const data = readYaml(blockYml);
  if (!data) return null;
  
  const explanationPath = path.join(blockDir, 'explanation.mdx');
  const hasExplanation = fs.existsSync(explanationPath);
  
  return {
    id: blockId,
    course: courseId,
    lecture: lectureId,
    ...data,
    explanationPath: hasExplanation ? explanationPath : undefined,
    blockDir,
  };
}

export function getBlockExplanation(courseId: string, lectureId: string, blockId: string): string {
  const mdxPath = path.join(
    CONTENT_DIR, 'courses', courseId, 'lectures', lectureId, 'blocks', blockId, 'explanation.mdx'
  );
  return readMdx(mdxPath);
}

export function getAllBlocks(): Block[] {
  const blocks: Block[] = [];
  const coursesDir = path.join(CONTENT_DIR, 'courses');
  
  if (!fs.existsSync(coursesDir)) return blocks;
  
  const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const cDir of courseDirs) {
    const lecturesDir = path.join(coursesDir, cDir.name, 'lectures');
    if (!fs.existsSync(lecturesDir)) continue;
    
    const lecDirs = fs.readdirSync(lecturesDir, { withFileTypes: true })
      .filter(d => d.isDirectory());
    
    for (const lDir of lecDirs) {
      const blocksDir = path.join(lecturesDir, lDir.name, 'blocks');
      if (!fs.existsSync(blocksDir)) continue;
      
      const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
        .filter(d => d.isDirectory());
      
      for (const bDir of blockDirs) {
        const block = getBlock(cDir.name, lDir.name, bDir.name);
        if (block) blocks.push(block);
      }
    }
  }
  
  return blocks;
}

export function searchBlocks(query: string): Block[] {
  const allBlocks = getAllBlocks();
  const lowerQuery = query.toLowerCase();
  
  return allBlocks.filter(b => {
    const searchText = [
      b.title,
      b.title_en,
      ...(b.topics || []),
    ].join(' ').toLowerCase();
    
    return searchText.includes(lowerQuery);
  });
}
