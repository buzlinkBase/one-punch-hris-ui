import { Children, isValidElement, type ReactNode } from "react";
import { Typography } from "antd";
import Markdown, { type Components } from "react-markdown";
import { termsSectionId } from "../../utils/terms-section.util";

const { Title, Paragraph } = Typography;

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : "",
    )
    .join("");
}

// The Terms are written in the Platform Admin Console as Markdown. Raw HTML is never rendered
// (react-markdown's default), and numbered "## N." headings get stable anchors (#section-N).
const COMPONENTS: Components = {
  h1: ({ children }) => <Title level={2}>{children}</Title>,
  h2: ({ children }) => (
    <Title
      level={4}
      id={termsSectionId(textOf(children))}
      className="mt-8! scroll-mt-20"
    >
      {children}
    </Title>
  ),
  h3: ({ children }) => (
    <Title level={5} className="mt-4!">
      {children}
    </Title>
  ),
  p: ({ children }) => (
    <Paragraph className="leading-relaxed whitespace-pre-line">
      {children}
    </Paragraph>
  ),
  ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
  li: ({ children }) => <li className="mb-1 leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

interface LegalDocumentProps {
  markdown: string;
}

/** A legal document (the Terms of Service) rendered from its published Markdown. */
export function LegalDocument({ markdown }: LegalDocumentProps) {
  return (
    <div className="legal-document">
      <Markdown components={COMPONENTS}>{markdown}</Markdown>
    </div>
  );
}
