import { FC, useEffect, useRef } from 'react';

export const Preview: FC<{ code: string | null }> = ({ code }) => {
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframe.current) return;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { background: #fff; margin: 0; overflow: hidden; }</style>
        </head>
        <body style="background-color:#222222">
          <div id="root" style="padding: 16px;"></div>
          <script type="text/javascript">${code || ''}</script>
          <script type="text/javascript">
          ReactDOM.render(React.createElement(MyComponent), document.getElementById('root'));
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    iframe.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [code]);

  return (
    <div className="w-1/2 rounded-xl overflow-hidden border bg-[#222222]">
      <h2 className="text-white text-lg p-4 border-b border-gray-700">Live editor</h2>
      <iframe
        title="preview"
        ref={iframe}
        sandbox="allow-scripts"
        width="100%"
        height="100%"
      />
    </div>
  );
};
