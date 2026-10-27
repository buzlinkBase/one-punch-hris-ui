import { Alert, Button, Table, Tag, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { HelpArticle } from "../../models/help-article.model";
import { HELP_AUDIENCES } from "../../services/help-registry";

const { Title, Paragraph, Text } = Typography;

interface Props {
  article: HelpArticle;
  /** Guides the reader may open next (already filtered to what they can see). */
  related: HelpArticle[];
  onOpenArticle: (id: string) => void;
  /** Called before following a "go to screen" link, e.g. to close the drawer. */
  onNavigate?: () => void;
}

/** One guide: its sections as numbered steps, tips and warnings, with links to the screens. */
export function HelpArticleView({
  article,
  related,
  onOpenArticle,
  onNavigate,
}: Props) {
  const navigate = useNavigate();
  const audience = HELP_AUDIENCES.find((a) => a.key === article.audience);

  const goTo = (to: string) => {
    onNavigate?.();
    navigate({ to });
  };

  return (
    <article className="flex flex-col gap-4">
      <header>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {audience && <Tag color="green">{audience.label}</Tag>}
          <Text type="secondary" className="text-xs">
            {article.chapter}
          </Text>
        </div>
        <Title level={4} className="mb-1!">
          {article.title}
        </Title>
        <Paragraph type="secondary" className="mb-0!">
          {article.summary}
        </Paragraph>
      </header>

      {article.purpose && article.purpose.length > 0 && (
        <Alert
          type="info"
          showIcon
          message="What it's for"
          description={
            <div className="flex flex-col gap-1">
              {article.purpose.map((text, i) => (
                <span key={i}>{text}</span>
              ))}
            </div>
          }
        />
      )}

      {article.sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="flex flex-col gap-2">
          <Title level={5} className="mb-0!">
            {section.heading}
          </Title>
          {section.body?.map((text, i) => (
            <Paragraph key={i} className="mb-0!">
              {text}
            </Paragraph>
          ))}
          {section.steps && (
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
              {section.steps.map((step, i) => (
                <li key={i}>
                  <span>{step.text}</span>
                  {step.link && (
                    <Button
                      type="link"
                      size="small"
                      className="px-1!"
                      onClick={() => goTo(step.link!.to)}
                    >
                      Go to {step.link.label} <ArrowRightOutlined />
                    </Button>
                  )}
                </li>
              ))}
            </ol>
          )}
          {section.tips && section.tips.length > 0 && (
            <Alert
              type="info"
              showIcon
              message="Tips"
              description={
                <ul className="m-0 flex list-disc flex-col gap-1 pl-4">
                  {section.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              }
            />
          )}
          {section.example && (
            <Alert
              type="success"
              message={`Example: ${section.example.title}`}
              description={
                <div className="flex flex-col gap-2">
                  {section.example.note && <span>{section.example.note}</span>}
                  {section.example.lines && (
                    <ul className="m-0 flex list-disc flex-col gap-1 pl-4">
                      {section.example.lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {section.example.table && (
                    <Table
                      size="small"
                      pagination={false}
                      bordered
                      scroll={{ x: "max-content" }}
                      columns={section.example.table.columns.map(
                        (title, col) => ({
                          title,
                          dataIndex: col,
                          key: col,
                        }),
                      )}
                      dataSource={section.example.table.rows.map(
                        (row, rowIndex) => ({ key: rowIndex, ...row }),
                      )}
                    />
                  )}
                </div>
              }
            />
          )}
          {section.warning && (
            <Alert type="warning" showIcon message={section.warning} />
          )}
        </section>
      ))}

      {related.length > 0 && (
        <footer className="border-t border-(--ant-color-border-secondary) pt-3">
          <Text strong>Read next</Text>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
            {related.map((next) => (
              <li key={next.id}>
                <Typography.Link onClick={() => onOpenArticle(next.id)}>
                  {next.title}
                </Typography.Link>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
