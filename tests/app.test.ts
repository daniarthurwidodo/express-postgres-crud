jest.config.js
{
  "testEnvironment": "node",
  "verbose": true
}

tests/app.test.ts
test('hello world!', () => {
  expect(1 + 1).toBe(2);
});