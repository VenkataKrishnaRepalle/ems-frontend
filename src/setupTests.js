// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// CRA (react-scripts 5) + Jest may fail to load ESM-only deps from node_modules (e.g. axios v1).
// We mock axios for unit tests; integration tests should stub API calls explicitly.
jest.mock('axios');
