import { useCallback, useRef } from "react";
import { Modal } from "antd";
import { useBlocker } from "@tanstack/react-router";

/**
 * Warns before leaving a form with unsaved edits: in-app navigation gets a confirm dialog and a
 * tab close/reload gets the browser prompt. Pass React Hook Form's `formState.isDirty`.
 *
 * Call the returned `allowNavigation()` right before navigating away after a successful save --
 * the form is still dirty at that moment, so without it the guard would prompt on the redirect.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const allowed = useRef(false);

  useBlocker({
    disabled: !isDirty,
    enableBeforeUnload: () => isDirty && !allowed.current,
    shouldBlockFn: () => {
      if (allowed.current) return false;
      return new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: "Discard unsaved changes?",
          content: "You have edits that haven't been saved.",
          okText: "Discard",
          okButtonProps: { danger: true },
          cancelText: "Keep editing",
          onOk: () => resolve(false),
          onCancel: () => resolve(true),
        });
      });
    },
  });

  return {
    allowNavigation: useCallback(() => {
      allowed.current = true;
    }, []),
  };
}
