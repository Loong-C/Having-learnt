import Link from 'next/link';
import { getAllCourses } from '@/lib/content';

export default function CoursesPage() {
  const courses = getAllCourses();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 全部课程</h1>
      <p className="text-gray-500 mb-8">浏览所有已整理的学习课程</p>
      
      {courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无课程</p>
          <p className="text-sm mt-2">将材料放入 inbox/ 目录并运行导入脚本即可生成课程</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
