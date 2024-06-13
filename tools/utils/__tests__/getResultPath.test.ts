import { expect, test } from "bun:test";
import { getResultPath } from '../getResultPath';

test('getResultPath should return the correct path', () => {
  const inputPath = '/project/src/pages/about/index.tsx';
  const expectedOutput = 'about/index';
  const result = getResultPath(inputPath);
  expect(result).toBe(expectedOutput);
});

test('getResultPath should handle nested directories correctly', () => {
  const inputPath = '/project/src/pages/blog/posts/2023/first-post.tsx';
  const expectedOutput = 'blog/posts/2023/first-post';
  const result = getResultPath(inputPath);
  expect(result).toBe(expectedOutput);
});

test('getResultPath should throw a TypeError if input is not a string', () => {
  expect(() => getResultPath((123 as unknown) as string)).toThrow(TypeError);
  expect(() => getResultPath((null as unknown) as string)).toThrow(TypeError);
  expect(() => getResultPath((undefined as unknown) as string)).toThrow(TypeError);
});
test('getResultPath should return an empty string if "pages" is not in the path', () => {
  const inputPath = '/project/src/components/button.tsx';
  const expectedOutput = '';
  const result = getResultPath(inputPath);
  expect(result).toBe(expectedOutput);
});
