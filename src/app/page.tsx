'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import { Preview } from '@/components/Preview';
import { useChat } from 'ai/react';

const createPrompt = (description: string) => {
  return `Can you please provide me with a React function component? It is also very important that you don't import or export anything, otherwise the code will not work. This is because "React" is globally registered in the environment. The component should be named 'Hello'. What this component should do is: "${description}". Remember, I'm specifically interested in the actual code implementation (a React function component), no description. Your output should ONLY be the code, nothing else. For styling you can use TailwindCSS as you can assume that the styles are present.`;
};

const extractJSXContent = (input: string) => {
  const startTag = '```jsx';
  const endTag = '```';

  const startIndex = input.indexOf(startTag);
  const endIndex = input.indexOf(endTag, startIndex + startTag.length);

  if (startIndex === -1 || endIndex === -1) {
    return input;
  }

  const contentStartIndex = startIndex + startTag.length;
  const extractedContent = input.substring(contentStartIndex, endIndex);

  return extractedContent.trim();
}

const App = () => {
  const [code, setCode] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const { messages, handleSubmit, setInput } = useChat();
  const [simpleInput, setSimpleInput] = useState('');

  useEffect(() => {
    setInput(createPrompt(simpleInput));
  }, [setInput, simpleInput])

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? 'Something went wrong');
  };

  useEffect(() => {
    const lastBotResponse = messages.filter((message) => message.role === 'assistant').pop();
    if (!lastBotResponse) return;
    setCode(extractJSXContent(lastBotResponse.content));
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
          <input
            className="flex-grow p-4 text-gray-900"
            value={simpleInput}
            onChange={(e) => setSimpleInput(e.target.value)}
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
