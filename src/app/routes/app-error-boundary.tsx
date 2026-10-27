import { Component, type ReactNode } from "react";
import { RouteErrorFallback } from "./route-error-fallback";

interface State {
  error: Error | null;
}

/**
 * Last line of defense around everything outside the router (providers, the connection banner,
 * notifications). The router's own errorComponent covers pages; a crash out here used to leave a
 * blank white screen instead of the same "Something went wrong" recovery screen.
 */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <RouteErrorFallback
          error={this.state.error}
          reset={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
