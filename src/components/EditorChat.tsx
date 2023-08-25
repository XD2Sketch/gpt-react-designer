import { FC, useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { EditorSection } from '@/components/EditorSection';
import { useSearchParams } from 'next/navigation';
import { getChatMessages, storeChatMessages } from '@/actions/chat';
import { SendIcon } from '@/components/icons/SendIcon';

const basePrompt = 'I want you to act like a code generator and only return JSX code, nothing else. Can you please provide me with a React function component? It is also very important that you do not import or export anything, otherwise the code will not work. For hooks, please use React.[hook name], since React is a global in our desired context. The component should be named "MyComponent".Remember, I am specifically interested in the actual code implementation (a React function component), no description (this also applies for any improving of the component). For styling you can use TailwindCSS as you can assume that the styles are present.\n\n\`\`\`jsx\n\n\`\`\`\n\n';

const disallowed = [
  '```',
  '```jsx',
  '```js',
  'import',
  'export',
];

const removeDisallowedLines = (input: string) => {
  return input
    .split('\n')
    .filter(line => !disallowed.some(disallowedLine => line.trim().startsWith(disallowedLine)))
    .join('\n');
};

const formatResponse = (input: string) => {
  return removeDisallowedLines(input);
};

type EditorChatProps = {
  setCode: (code: string | undefined) => void;
  code: string;
};

const initialMessages = [
  { id: 'code', role: 'system' as const, content: basePrompt }
];

export const EditorChat: FC<EditorChatProps> = ({ code, setCode }) => {
  const { messages, setMessages, handleSubmit, setInput, input, isLoading } = useChat({ initialMessages });

  const [codeFinished, setCodeFinished] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentProject = searchParams.get('project');

  const fetchAndSetChatHistory = async (projectId: string) => {
    const storedMessages = (await getChatMessages(projectId))
      .map((message) => ({ id: message.id, content: message.content, role: message.role as any }));

    setMessages([...initialMessages, ...storedMessages]);
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!currentProject) return;
    fetchAndSetChatHistory(currentProject);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  useEffect(() => {
    if (codeFinished && currentProject) {
      const messagesToStore = messages.filter((message) => message.role !== 'system' && !!message.id);
      storeChatMessages(currentProject, messagesToStore);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, codeFinished]);

  useEffect(() => {
    setCodeFinished(false);
    const lastBotResponse = messages.filter((message) => message.role === 'assistant').pop();
    setCode(formatResponse(lastBotResponse?.content ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (!codeFinished && !isLoading) {
      setCodeFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div
      className="w-1/2 max-h-screen h-full flex flex-col rounded-xl overflow-hidden border bg-gray-50">
      <div className="p-4 border-b border-b-gray-300">
        <h1 className="text-gray-900 text-lg">GPT React Designer</h1>
      </div>
      <div className="h-1/2 flex flex-col bg-gray-200 p-4">
        <EditorSection code={code} onChange={setCode}/>
      </div>
      <div className="p-4 max-h-[50%] h-full flex flex-col justify-between">
        <div className="flex flex-col max-h-[calc(100%-80px)] mb-4 overflow-y-auto">
          <p className="text-gray-900 mb-2">Chat History</p>
          <div className="overflow-y-auto overflow-x-hidden" ref={chatHistoryRef}>
            {messages.filter((message) => message.role === 'user').map((message) => (
              <div
                className="flex flex-col mb-2 bg-teal-900 p-2 rounded-xl rounded-tl-none"
                key={message.id}
              >
                <p className="text-white">{message.content}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="flex w-full relative" onSubmit={handleSubmit}>
          <input
            className="flex-grow p-4 pr-10 text-gray-900 rounded-xl border shadow-lg transition-colors shadow-gray-100 focus:ring-0 focus:outline-none focus:border-gray-600"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="A component that renders a button with click me text."
          />
          <button
            type="submit"
            className={`translate-y-[-50%] absolute right-4 top-1/2 ${isLoading && 'opacity-20 cursor-not-allowed'}`}
            onClick={(e) => {
              if (isLoading) e.preventDefault();
            }}>
            <SendIcon/>
          </button>
        </form>
      </div>
    </div>
  );
};
