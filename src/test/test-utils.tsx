import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// A fresh QueryClient per render — retry disabled so a component under test that hits a
// failing/mocked query fails fast instead of retrying for real (React Query defaults to 3
// retries with backoff, which would otherwise make failure-path tests slow or flaky).
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

// Drop-in replacement for @testing-library/react's render — wraps every component under test
// with the same QueryClientProvider the real app provides, since hooks like usePayrolls/
// useApproveBatch throw without one. Add a Router wrapper here too if/when a test needs
// TanStack Router context (useNavigate, route params).
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
