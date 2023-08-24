'use client';

import { useEffect, useState } from 'react';
import { Preview } from '@/components/Preview';
import { EditorChat } from '@/components/EditorChat';
import { Project, Sidebar } from '@/components/Sidebar';
import { transform } from '@babel/standalone';
import { useRouter, useSearchParams } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';

const App = () => {
  const [code, setCode] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [projects] = useLocalStorage<Project[]>('projects', []);
  const searchParams = useSearchParams();
  const project = searchParams.get('project');
  const router = useRouter();

  const runCode = (code: string | undefined) => {
    if (!code) return;
    setCode(code);

    try {
      const transformed = transform(code, { presets: ['react'] }).code;
      setPreview(transformed);
    } catch (err) {
      setPreview(`Error: ${err}`);
    }
  };

  useEffect(() => {
    if (!project && projects?.length) {
      router.push(`?project=${projects[0].id}`)
    }
  }, [projects, project, router]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="px-4 py-2 flex w-full gap-2">
        {project && (
          <>
            <EditorChat code={code} setCode={runCode}  />
            <Preview code={preview} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
