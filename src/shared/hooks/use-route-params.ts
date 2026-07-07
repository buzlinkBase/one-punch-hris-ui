import { useRouterState } from "@tanstack/react-router";

export function useRouteParams<
  TParams extends Record<string, string | undefined>,
>() {
  const params = useRouterState({
    select: (state) =>
      Object.assign({}, ...state.matches.map((match) => match.params)),
  });

  return params as unknown as TParams;
}
