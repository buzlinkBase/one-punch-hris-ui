import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { HELP_ARTICLES } from "../content";
import type { HelpArticle } from "../models/help-article.model";
import { visibleArticles } from "../services/help-registry";

/** The guides the signed-in user may see -- re-filtered when their roles change. */
export function useHelpArticles(): HelpArticle[] {
  useAuthUser(); // re-renders on a roles-changed token refresh
  return visibleArticles(HELP_ARTICLES, (...codes) =>
    authStorage.hasAnyPermission(...codes),
  );
}
