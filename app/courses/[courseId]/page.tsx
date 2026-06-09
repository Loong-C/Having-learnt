import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/content';

interface Props {
  params: { courseId: string };
}

export default function CoursePage({ params }: Props) {
  const course = getCourse(params.courseId);
  
  if (!course) {
    notFound();
  }

  return (
    <div>
      <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← 全部课程
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-lg text-gray-500">{course.title_en}</p>
        <p className="text-gray-400 mt-2">{course.description}</p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">📖 讲义列表</h2>
      
      {!course.lectures || course.lectures.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>暂无讲义</p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.lectures.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/courses/${course.id}/lectures/${lecture.id}`}
              className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{lecture.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{lecture.title_en}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-1 rounded">{lecture.pages} 页</span>
                  <span>{lecture.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
