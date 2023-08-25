import { FC } from 'react';
import { Editor } from '@monaco-editor/react';

type EditorSectionProps = {
  code: string;
  onChange: (code: string | undefined) => void;
}

export const EditorSection: FC<EditorSectionProps> = ({ code, onChange }) => {
  return (
    <>
      <p className="text-gray-900">Code Editor</p>
      <div className="flex-grow py-4 bg-[#1e1e1e] mt-4 rounded-xl overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code',
            lineNumbers: 'off',
          }}
          value={code}
          theme="vs-dark"
          onChange={onChange}
        />
      </div>
    </>
  );
};
