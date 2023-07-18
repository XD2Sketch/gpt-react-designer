'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import { Preview } from '@/components/Preview';
import { useChat } from 'ai/react';

const createPrompt = (description: string) => {
  return `I want you to act like a code generator and only return JSX code, nothing else. Can you please provide me with a React function component? It is also very important that you don't import or export anything, otherwise the code will not work. This is because "React" is globally registered in the environment. The component should be named 'MyComponent'. What this component should do is: "${description}". Remember, I'm specifically interested in the actual code implementation (a React function component), no description. For styling you can use TailwindCSS as you can assume that the styles are present.`;
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

const removeImportExportLines = (input: string) => {
  // Split the code into lines
  let lines = input.split('\n');

  // Filter out lines that start with "import" or "export"
  lines = lines.filter(line => !line.trim().startsWith('import') && !line.trim().startsWith('export'));

  return lines.join('\n');
}

const formatResponse = (input: string) => {
  return extractJSXContent(
    removeImportExportLines(input)
  );
}

const App = () => {
  const [code, setCode] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const { messages, handleSubmit, setInput, isLoading } = useChat();
  const [simpleInput, setSimpleInput] = useState('');
  const [codeFinished, setCodeFinished] = useState(false);

  useEffect(() => {
    setInput(createPrompt(simpleInput));
  }, [setInput, simpleInput])

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? 'Something went wrong');
  };

  const handleRun = () => {
    try {
      const transformed = transform(code, { presets: ['react'] }).code;
      setPreview(transformed);
    } catch (err) {
      setPreview(`Error: ${err}`);
    }
  };

  useEffect(() => {
    setCodeFinished(false);
    const lastBotResponse = messages.filter((message) => message.role === 'assistant').pop();
    if (!lastBotResponse) return;
    setCode(formatResponse(lastBotResponse.content));
  }, [messages]);

  useEffect(() => {
    if (!codeFinished && !isLoading) {
      setCodeFinished(true);
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="w-1/2 max-h-screen h-full flex flex-col">
        <form className="bg-white flex w-full flex-shrink-0" onSubmit={handleSubmit}>
          <input
            className="flex-grow p-4 text-gray-900"
            value={simpleInput}
            onChange={(e) => setSimpleInput(e.target.value)}
            placeholder="A component that renders a button with the text 'Click me'"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 py-2 px-4">
            Generate
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
