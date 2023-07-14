'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import { Preview } from '@/components/Preview';
import { useChat } from 'ai/react';

const createPrompt = () => {
  return `Can you please provide me with a React function component? It is also important that you don't import anything. This is because "React" is globally registered in the environment. The component should be named 'Hello'. What this component should do is: "". Remember, I'm specifically interested in the actual code implementation (a React function component), no description. Your output should ONLY be the code, nothing else.`;
};

const removeCodeBlockMarkers = (code: string): string => {
  const markerStart = '```jsx';
  const markerEnd = '```';

  return code.replace(markerStart, '').replace(markerEnd, '').trim();
}

const App = () => {
  const [code, setCode] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat();

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? 'Something went wrong');
  };

  useEffect(() => {
    setInput(createPrompt())
  }, [setInput]);

  useEffect(() => {
    const lastBotResponse = messages.filter((message) => message.role === 'assistant').pop();
    if (!lastBotResponse) return;
    setCode(removeCodeBlockMarkers(lastBotResponse.content));
  }, [messages]);

  const handleRun = () => {
    try {
      const transformed = transform(code, { presets: ['react'] }).code;
      setPreview(transformed);
    } catch (err) {
      setPreview(`Error: ${err}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="w-1/2 max-h-screen h-full flex flex-col">
        <form className="bg-white flex w-full flex-shrink-0" onSubmit={handleSubmit}>
          <textarea
            rows={8}
            className="flex-grow p-4 text-gray-900"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something..."
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 py-2 px-4">
            Ask GTP-3
          </button>
        </form>
        <div className="flex-grow p-4 bg-[#1e1e1e] overflow-auto">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 flex-shrink-0"
                onClick={handleRun}>Run Code
        </button>
      </div>
      <div className="w-1/2">
        <Preview code={preview}/>
      </div>
    </div>
  );
};

export default App;
