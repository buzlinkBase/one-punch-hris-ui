import { useState } from "react";
import { Card, Empty, Input, Tabs, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "@tanstack/react-router";
import { HelpArticleView } from "../../components/help-article-view/help-article-view";
import { useHelpArticles } from "../../hooks/use-help-articles";
import type {
  HelpArticle,
  HelpAudience,
} from "../../models/help-article.model";
import {
  HELP_AUDIENCES,
  chaptersFor,
  searchArticles,
} from "../../services/help-registry";

const { Title, Text } = Typography;

const DEFAULT_ARTICLE_ID = "welcome";

/**
 * The user manual: guides by audience (Getting Started, Owner & Admin, HR & Payroll,
 * Approvers, Employees), searchable, showing only what the reader's role can use.
 */
export default function HelpCenter() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { articleId?: string };
  const articles = useHelpArticles();
  const [query, setQuery] = useState("");

  const current =
    articles.find((a) => a.id === params.articleId) ??
    articles.find((a) => a.id === DEFAULT_ARTICLE_ID) ??
    articles[0];
  const [tab, setTab] = useState<HelpAudience>(current?.audience ?? "start");

  const openArticle = (id: string) => {
    setQuery("");
    const next = articles.find((a) => a.id === id);
    if (next) setTab(next.audience);
    navigate({ to: `/help/${id}` });
  };

  const tabs = HELP_AUDIENCES.filter((audience) =>
    articles.some((a) => a.audience === audience.key),
  );
  const related = (article: HelpArticle) =>
    (article.related ?? [])
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is HelpArticle => !!a);

  const articleLink = (article: HelpArticle) => (
    <li key={article.id}>
      <Typography.Link
        onClick={() => openArticle(article.id)}
        className={
          article.id === current?.id
            ? "font-semibold"
            : "text-(--ant-color-text)!"
        }
      >
        {article.title}
      </Typography.Link>
    </li>
  );

  const results = query.trim() ? searchArticles(articles, query) : null;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Help Center
            </Title>
            <p className="page-toolbar-subtitle">
              Step-by-step guides for everything you can do in One Punch HRIS.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card size="small" className="h-fit">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search the guides…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-3"
          />
          {results ? (
            results.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {results.map(articleLink)}
              </ul>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No guides match your search"
              />
            )
          ) : (
            <Tabs
              size="small"
              activeKey={tab}
              onChange={(key) => setTab(key as HelpAudience)}
              items={tabs.map((audience) => ({
                key: audience.key,
                label: audience.label,
                children: (
                  <div className="flex flex-col gap-3">
                    {chaptersFor(articles, audience.key).map(
                      ({ chapter, articles: list }) => (
                        <div key={chapter}>
                          <Text
                            type="secondary"
                            className="text-xs font-semibold uppercase"
                          >
                            {chapter}
                          </Text>
                          <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
                            {list.map(articleLink)}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                ),
              }))}
            />
          )}
        </Card>

        <Card>
          {current ? (
            <HelpArticleView
              article={current}
              related={related(current)}
              onOpenArticle={openArticle}
            />
          ) : (
            <Empty description="No guides available for your role yet" />
          )}
        </Card>
      </div>
    </div>
  );
}
