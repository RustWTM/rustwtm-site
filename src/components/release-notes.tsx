import Markdown, { defaultUrlTransform } from "react-markdown";
import { docs } from "@/lib/product";
export function ReleaseNotes({ body }: { body: string }) {
  return (
    <div className="release-markdown">
      <Markdown
        skipHtml
        allowedElements={[
          "h1",
          "h2",
          "h3",
          "h4",
          "p",
          "a",
          "ul",
          "ol",
          "li",
          "code",
          "pre",
          "strong",
          "em",
          "blockquote",
          "hr",
          "br",
          "del",
        ]}
        components={{
          h1: (props) => <h3>{props.children}</h3>,
          h2: (props) => <h3>{props.children}</h3>,
        }}
        urlTransform={(value) => {
          const safe = defaultUrlTransform(value);
          if (!safe) return "";
          return /^(https?:|mailto:)/i.test(safe) ? safe : new URL(safe, docs("CHANGELOG.md")).href;
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
