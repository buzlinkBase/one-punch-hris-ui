import { Outlet } from "@tanstack/react-router";

/** Public legal pages (the Terms of Service): readable width, open to anyone, signed in or not. */
export default function LegalLayout() {
  return (
    <div className="auth-bg min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <Outlet />
      </div>
    </div>
  );
}
