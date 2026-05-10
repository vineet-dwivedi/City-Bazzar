import '@testing-library/jest-dom/vitest';

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:test-preview';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => {};
}
