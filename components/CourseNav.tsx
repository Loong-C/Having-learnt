'use client';

import Link from 'next/link';

interface Block {
  id: string;
  title: string;
  title_en: string;
  pages: string;
  topics: string[];
  status: string;
}

interface CourseNavProps {
  courseId: string;
  courseTitle: string;
  lectureId: string;
  lectureTitle: string;
  blocks: Block[];
  activeBlockId?: string;
}

export function CourseNav({ courseId, courseTitle, lectureId, lectureTitle, blocks, activeBlockId }: CourseNavProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 pr-4 overflow-y-auto max-h-[calc(100vh-6rem)] sticky top-20">
      <div className="mb-4">
        <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:text-blue-800">
          ← {courseTitle}
        </Link>
      </div>
      <h3 className="font-semibold text-sm text-gray-900 mb-2">{lectureTitle}</h3>
      <nav className="space-y-0.5">
        {blocks.map((block) => (
          <Link
            key={block.id}
            href={`/courses/${courseId}/lectures/${lectureId}?block=${block.id}`}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              activeBlockId === block.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div>{block.title}</div>
            <div className="text-xs text-gray-400">页 {block.pages}</div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
