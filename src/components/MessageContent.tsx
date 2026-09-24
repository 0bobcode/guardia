import React from "react";

// Renders a captured message's text with light markdown support instead of
// a raw escaped blob — AI replies are almost always markdown-formatted
// (images, links, fenced code/HTML), and a parent reading a transcript
// should see what the child actually saw, not literal "![a](b)" syntax.
//
// Safety: nothing here ever uses dangerouslySetInnerHTML. Every href/src is
// validated to be a plain http(s) URL (blocks javascript:/data: injection).
// An HTML code block is only ever shown inside an iframe with an empty
// sandbox attribute — no allow-scripts, no allow-same-origin — so it can
// render markup but cannot execute script or reach the parent page.

type Segment = { type: "text"; content: string } | { type: "code"; lang: string; code: string };

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    segments.push({ type: "code", lang: match[1] || "", code: match[2] });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ type: "text", content: text.slice(lastIndex) });
  return segments;
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)(\?\S*)?$/i;
// Matches, in priority order: markdown image, markdown link, bare URL, **bold**
const INLINE_REGEX = /!\[([^\]]*)\]\((\S+?)\)|\[([^\]]+)\]\((\S+?)\)|(https?:\/\/\S+)|\*\*([^*]+)\*\*/g;

function renderInlineText(line: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE_REGEX.lastIndex = 0;
  while ((match = INLINE_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
    const [whole, imgAlt, imgUrl, linkText, linkUrl, bareUrl, bold] = match;
    if (imgUrl !== undefined) {
      nodes.push(
        isSafeHttpUrl(imgUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${keyPrefix}-${i++}`} src={imgUrl} alt={imgAlt} className="max-w-full rounded-lg border border-app-border my-1" />
        ) : (
          whole
        )
      );
    } else if (linkUrl !== undefined) {
      nodes.push(
        isSafeHttpUrl(linkUrl) ? (
          <a key={`${keyPrefix}-${i++}`} href={linkUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
            {linkText}
          </a>
        ) : (
          whole
        )
      );
    } else if (bareUrl !== undefined) {
      if (isSafeHttpUrl(bareUrl) && IMAGE_EXT.test(bareUrl)) {
        // eslint-disable-next-line @next/next/no-img-element
        nodes.push(<img key={`${keyPrefix}-${i++}`} src={bareUrl} alt="" className="max-w-full rounded-lg border border-app-border my-1" />);
      } else if (isSafeHttpUrl(bareUrl)) {
        nodes.push(
          <a key={`${keyPrefix}-${i++}`} href={bareUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted break-all">
            {bareUrl}
          </a>
        );
      } else {
        nodes.push(bareUrl);
      }
    } else if (bold !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{bold}</strong>);
    }
    lastIndex = INLINE_REGEX.lastIndex;
  }
  if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
  return nodes;
}

function TextSegment({ content, segKey }: { content: string; segKey: number }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {renderInlineText(line, `${segKey}-${li}`)}
          {li < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

export function MessageContent({ content }: { content: string }) {
  const segments = parseSegments(content);
  return (
    <div className="space-y-2">
      {segments.map((seg, idx) => {
        if (seg.type === "code") {
          if (seg.lang.toLowerCase() === "html") {
            return (
              <div key={idx} className="rounded-lg overflow-hidden border border-app-border">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-app-faint bg-app-surface-2">
                  HTML artifact preview
                </div>
                <iframe
                  srcDoc={seg.code}
                  sandbox=""
                  title={`html-artifact-${idx}`}
                  className="w-full bg-white"
                  style={{ height: 220 }}
                />
              </div>
            );
          }
          return (
            <pre key={idx} className="bg-app-surface-2 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
              <code>{seg.code}</code>
            </pre>
          );
        }
        return <TextSegment key={idx} content={seg.content} segKey={idx} />;
      })}
    </div>
  );
}
