import { notFound } from 'next/navigation';
import { getCourse, getLecture, getBlock, getBlockExplanation } from '@/lib/content';
import { CourseNav } from '@/components/CourseNav';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Callout } from '@/components/Callout';
import { Theorem, Proof } from '@/components/Theorem';
import Link from 'next/link';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  params: { courseId: string; lectureId: string };
  searchParams: { block?: string };
}

const components = {
  Callout,
  Theorem,
  Proof,
};

/** Parse "2-6" or "7" into an array of page numbers */
function parsePagesRange(pages: string): number[] {
  if (!pages) return [];
  const trimmed = pages.trim();
  if (trimmed.includes('-')) {
    const [start, end] = trimmed.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  const num = Number(trimmed);
  return isNaN(num) ? [] : [num];
}

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
      <div
        className="flex-1 min-w-0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 4rem)',
          overflow: 'hidden',
          alignSelf: 'flex-start',
        }}
      >
        {/* Lecture Header */}
        <div className="mb-6" style={{ flexShrink: 0 }}>
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
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
            }}
          >
            {/* Left: Source / Original */}
            <div
              style={{
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: '1rem',
                borderRight: '1px solid #e2e4e9',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded">
                  讲义原文
                </span>
                <span className="text-xs text-gray-400">第 {activeBlock.pages} 页</span>
              </div>
                
                {/* PDF Page Images */}
                <div className="space-y-4">
                  {(() => {
                    const pageNums = parsePagesRange(activeBlock.pages);
                    return pageNums.map((pageNum) => {
                      const pageStr = String(pageNum).padStart(2, '0');
                      const imgSrc = `/pages/${params.lectureId}/page-${pageStr}.png`;
                      return (
                        <div key={pageNum} className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgSrc}
                            alt={`讲义第 ${pageNum} 页`}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                            第 {pageNum} 页
                          </div>
                        </div>
                      );
                    });
                  })()}
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

            {/* Right: AI Explanation */}
            <div style={{ minHeight: 0, overflowY: 'auto' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                  AI 讲解
                </span>
              </div>
              
              <div className="prose prose-gray max-w-none">
                {mdxSource ? (
                  <MDXRemote
                    source={mdxSource}
                    components={components}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkMath],
                        rehypePlugins: [rehypeKatex],
                      },
                    }}
                  />
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
