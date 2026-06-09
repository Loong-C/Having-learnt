'use client';

import { useState } from 'react';
import Link from 'next/link';

// Client-side search using Fuse.js
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.blocks || []);
    } catch {
      // Fallback: client-side search hint
      setResults([]);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 搜索知识</h1>
      <p className="text-gray-500 mb-8">在全部学习笔记中搜索知识点</p>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索知识点、定理、概念..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          搜索
        </button>
      </div>

      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">未找到相关结果</p>
              <p className="text-sm mt-2">尝试其他关键词</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">找到 {results.length} 个结果</p>
              {results.map((block: any) => (
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
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
