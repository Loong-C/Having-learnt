import Link from 'next/link';
import { getAllCourses, getAllBlocks } from '@/lib/content';

export default function HomePage() {
  const courses = getAllCourses();
  const blocks = getAllBlocks();
  
  return (
    <div>
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          AI Study Vault
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          将论文、讲义、课件与 AI 逐段讲解整理成结构化学习资料库。
          原文在左，解释在右，可搜索，可追问，可长期复习。
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            浏览课程
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            搜索知识
          </Link>
        </div>
      </section>

      {/* Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 课程</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500">{course.title_en}</p>
              <p className="text-sm text-gray-400 mt-2">{course.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span>{course.lectures?.length || 0} 讲</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Blocks */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 最近学习</h2>
        <div className="space-y-3">
          {blocks.slice(0, 10).map((block) => (
            <Link
              key={block.id}
              href={`/courses/${block.course}/lectures/${block.lecture}?block=${block.id}`}
              className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{block.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{block.title_en}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  页 {block.pages}
                </span>
              </div>
              {block.topics && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {block.topics.map((t: string) => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
