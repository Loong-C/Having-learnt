import { notFound } from 'next/navigation';
import { getCourse, getLecture, getBlock, getBlockExplanation } from '@/lib/content';
import { CourseNav } from '@/components/CourseNav';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Callout } from '@/components/Callout';
import { Theorem, Proof } from '@/components/Theorem';
import Link from 'next/link';

interface Props {
  params: { courseId: string; lectureId: string };
  searchParams: { block?: string };
}

const components = {
  Callout,
  Theorem,
  Proof,
};

export default function LecturePage({ params, searchParams }: Props) {
  const course = getCourse(params.courseId);
  const lecture = getLecture(params.courseId, params.lectureId);
  
  if (!course || !lecture) {
    notFound();
  }

  // Get all blocks for this lecture
  const blocks = (lecture.blocks || []).map((blockId: string) => {
    const block = getBlock(params.courseId, params.lectureId, blockId);
    return block;
  }).filter(Boolean);

  const activeBlockId = searchParams.block || (blocks.length > 0 ? blocks[0]!.id : null);
  
  // Get the active block
  const activeBlock = activeBlockId 
    ? blocks.find(b => b!.id === activeBlockId)
    : null;

  const mdxSource = activeBlockId
    ? getBlockExplanation(params.courseId, params.lectureId, activeBlockId)
    : '';

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <CourseNav
        courseId={course.id}
        courseTitle={course.title}
        lectureId={lecture.id}
        lectureTitle={lecture.title}
        blocks={blocks.filter(Boolean) as any}
        activeBlockId={activeBlockId || undefined}
      />

      {/* Main Content - Block Reader */}
      <div className="flex-1 min-w-0">
        {/* Lecture Header */}
        <div className="mb-6">
          <Link href={`/courses/${params.courseId}`} className="text-sm text-blue-600 hover:text-blue-800">
            ← {course.title}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{lecture.title}</h1>
          <p className="text-gray-500">{lecture.title_en}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span>{lecture.pages} 页</span>
            <span>•</span>
            <span>{blocks.length} 个知识点块</span>
          </div>
        </div>

        {activeBlock ? (
          <div className="block-reader">
            {/* Left: Source / Original */}
            <div className="block-reader-left">
              <div className="sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    讲义原文
                  </span>
                  <span className="text-xs text-gray-400">第 {activeBlock.pages} 页</span>
                </div>
                
                {/* Source placeholder - in real version, this would show the PDF page image */}
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-sm text-gray-500 font-medium">{activeBlock.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{activeBlock.title_en}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    讲义原始页面将在此显示（需运行 PDF 渲染脚本）
                  </p>
                </div>

                {/* Topics */}
                {activeBlock.topics && activeBlock.topics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">涵盖知识点</h4>
                    <div className="flex flex-wrap gap-1">
                      {activeBlock.topics.map((topic: string) => (
                        <span key={topic} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Explanation */}
            <div className="block-reader-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                  AI 讲解
                </span>
              </div>
              
              <div className="prose prose-gray max-w-none">
                {mdxSource ? (
                  <MDXRemote source={mdxSource} components={components} />
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <p>该知识块暂无 AI 讲解内容</p>
                  </div>
                )}
              </div>

              {/* Block navigation */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                {(() => {
                  const currentIndex = blocks.findIndex(b => b!.id === activeBlock.id);
                  const prev = currentIndex > 0 ? blocks[currentIndex - 1] : null;
                  const next = currentIndex < blocks.length - 1 ? blocks[currentIndex + 1] : null;
                  return (
                    <>
                      {prev ? (
                        <Link
                          href={`/courses/${params.courseId}/lectures/${params.lectureId}?block=${prev!.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          ← {prev!.title}
                        </Link>
                      ) : <div />}
                      {next ? (
                        <Link
                          href={`/courses/${params.courseId}/lectures/${params.lectureId}?block=${next!.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {next!.title} →
                        </Link>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">此讲义暂无知识点块</p>
            <p className="text-sm mt-2">运行 segment 脚本来自动切分讲义为知识点块</p>
          </div>
        )}
      </div>
    </div>
  );
}
