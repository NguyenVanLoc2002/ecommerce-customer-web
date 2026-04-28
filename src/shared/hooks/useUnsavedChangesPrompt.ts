import { unstable_usePrompt as usePrompt, useBeforeUnload } from 'react-router-dom';

export const useUnsavedChangesPrompt = (
  when: boolean,
  message = 'You have unsaved changes. Leave this page without saving them?',
) => {
  usePrompt({ when, message });
  useBeforeUnload(
    (event) => {
      if (!when) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true },
  );
};
