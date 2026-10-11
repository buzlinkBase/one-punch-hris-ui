import { useState } from "react";
import { Button, Drawer } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { HelpArticleView } from "../help-article-view/help-article-view";
import { useHelpArticles } from "../../hooks/use-help-articles";
import type { HelpArticle } from "../../models/help-article.model";
import { articleForPath } from "../../services/help-registry";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * The header ? button's drawer: the guide for the screen you're on (or the welcome guide when
 * there isn't one), with a way into the full Help Center.
 */
export function ContextHelpDrawer({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const articles = useHelpArticles();
  // A guide opened from "Read next" replaces the screen's own until the drawer closes.
  const [openedId, setOpenedId] = useState<string | null>(null);

  const forScreen =
    articleForPath(articles, pathname) ??
    articles.find((a) => a.id === "welcome");
  const article =
    (openedId && articles.find((a) => a.id === openedId)) || forScreen;
  const related = (article?.related ?? [])
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is HelpArticle => !!a);

  const close = () => {
    setOpenedId(null);
    onClose();
  };

  return (
    <Drawer
      title="Help"
      open={open}
      onClose={close}
      width="min(560px, 100vw)"
      extra={
        <Button
          icon={<BookOutlined />}
          onClick={() => {
            close();
            navigate({ to: article ? `/help/${article.id}` : "/help" });
          }}
        >
          Open Help Center
        </Button>
      }
    >
      {article && (
        <HelpArticleView
          article={article}
          related={related}
          onOpenArticle={setOpenedId}
          onNavigate={close}
        />
      )}
    </Drawer>
  );
}
