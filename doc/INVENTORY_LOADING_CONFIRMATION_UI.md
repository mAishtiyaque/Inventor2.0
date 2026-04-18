# UI Conventions: Spinner + Confirmation Popup

Use the existing spinner and confirmation popup patterns consistently across the app. Do not introduce new spinner styles or third-party confirm dialogs.

## Spinner (Loading)

Use this exact markup for inline and page loading states:

```tsx
<div className="py-24 text-center">
  <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
</div>
```

Notes:
- Keep the size `w-4 h-4`, border style, and `animate-spin` class intact.
- Centering is done with `mx-auto` and the parent `text-center`.
- This same spinner is used in `src/components/ProductList.tsx` and `src/components/BrokerList.tsx`.

## Confirmation Popup (Modal)

Use the shared confirm hook and provider:

- Provider is already wired in `src/App.tsx`.
- Hook lives in `src/hooks/useConfirm.tsx`.

Example usage:

```tsx
import { useConfirm } from '../hooks/useConfirm';

const { confirm } = useConfirm();

const confirmed = await confirm({
  title: 'Delete Product',
  message: 'Are you sure you want to delete "Sample"? This action cannot be undone.',
  confirmText: 'Delete Product',
  cancelText: 'Cancel',
  variant: 'danger'
});

if (!confirmed) return;
// proceed with destructive action
```

Variants supported:
- `danger` (default)
- `warning`
- `info`

Do not build custom confirm modals in components. Always use `useConfirm()` so the look and behavior stays consistent.

