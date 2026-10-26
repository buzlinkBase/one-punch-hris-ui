import { Fragment } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Crumb } from "./build-breadcrumbs";

interface HeaderBreadcrumbsProps {
  crumbs: Crumb[];
}

/** Header trail: ancestors that are pages are links, the current page is plain text. */
export function HeaderBreadcrumbs({ crumbs }: HeaderBreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <nav aria-label="Breadcrumb" className="header-context-trail">
      <ol className="m-0 flex list-none items-center gap-1.5 p-0">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${index}-${crumb.label}`}>
              <li aria-current={isLast ? "page" : undefined}>
                {crumb.path && !isLast ? (
                  <button
                    type="button"
                    className="header-crumb-link"
                    onClick={() => navigate({ to: crumb.path })}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  crumb.label
                )}
              </li>
              {!isLast && <li aria-hidden="true">/</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
