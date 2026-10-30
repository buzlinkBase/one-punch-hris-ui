import { useMemo } from "react";
import { Alert, Card, Result, Skeleton, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { toPh } from "@/shared/utils/ph-time.util";
import { LegalDocument } from "../../components/legal-document";
import { TERMS_LABEL } from "../../constants/label.const";
import { usePublishedTerms } from "../../hooks/use-terms-queries";
import { termsSections } from "../../utils/terms-section.util";

const { Text } = Typography;

function versionFromUrl(): number | undefined {
  const value = Number(new URLSearchParams(window.location.search).get("v"));
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

/** The public Terms of Service page (/terms, or /terms?v=N for an older version). */
export default function TermsPage() {
  const requested = useMemo(() => versionFromUrl(), []);
  const { data: terms, isLoading } = usePublishedTerms(requested);
  const { data: current } = usePublishedTerms();
  const sections = useMemo(
    () => (terms ? termsSections(terms.renderedMarkdown) : []),
    [terms],
  );
  const isOlder = !!terms && !!current && terms.version < current.version;

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 12 }} />
      </Card>
    );
  }

  if (!terms) {
    return (
      <Card>
        <Result
          icon={<FileTextOutlined />}
          title={TERMS_LABEL.PAGE_TITLE}
          subTitle={TERMS_LABEL.NOT_PUBLISHED}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Text type="secondary">
          {TERMS_LABEL.VERSION} {terms.version}
        </Text>
        {terms.effectiveAtUtc && (
          <Text type="secondary">
            {TERMS_LABEL.EFFECTIVE}{" "}
            {toPh(terms.effectiveAtUtc).format("MMMM D, YYYY")}
          </Text>
        )}
      </div>
      {isOlder && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message={TERMS_LABEL.OLDER_VERSION_NOTICE}
          action={<a href="/terms">{TERMS_LABEL.VIEW_CURRENT}</a>}
        />
      )}
      {sections.length > 0 && (
        <nav className="mb-6">
          <Text strong>{TERMS_LABEL.CONTENTS}</Text>
          <ol className="mt-2 columns-1 pl-0 sm:columns-2">
            {sections.map((section) => (
              <li key={section.id} className="mb-1 list-none">
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <LegalDocument markdown={terms.renderedMarkdown} />
    </Card>
  );
}
