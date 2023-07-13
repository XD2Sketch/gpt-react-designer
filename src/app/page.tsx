'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';

const App = () => {
  const [code, setCode] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? 'Something went wrong');
  };

  useEffect(() => {
    fetch('/input.tsx')
      .then((response) => response.text())
      .then((data) => {
        setCode(data);
      });
  }, []);

  const handleRun = () => {
    try {
      const transformed = transform(code, { presets: ['react'] }).code;
      setPreview(transformed);
    } catch (err) {
      setPreview(`Error: ${err}`);
    }
  };

  return (
    <div className="App flex h-screen bg-gray-200">
      <div className="editor w-1/2 max-h-screen h-full flex flex-col">
        <div className="flex-grow p-4 bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" onClick={handleRun}>Run Code</button>
      </div>
      <div className="preview w-1/2">
        <Preview code={preview} />
      </div>
    </div>
  );
}

const Preview: FC<{ code: string | null }> = ({ code }) => {
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframe.current) return;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
          <style>body { background: #fff; margin: 0; overflow: hidden; }</style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/javascript">${code || ''}</script>
          <script type="text/javascript">ReactDOM.render(React.createElement(Hello), document.getElementById('root'));</script>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    iframe.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    }
  }, [code]);

  return (
    <iframe
      title="preview"
      ref={iframe}
      sandbox="allow-scripts"
      width="100%"
      height="100%"
    />
  );
}


export default App;
