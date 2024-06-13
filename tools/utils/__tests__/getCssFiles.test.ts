import { expect, mock, test } from "bun:test";
import fs from 'node:fs';
import path from 'node:path';
import getCssFiles from '../getCssFiles';

const mockReaddirSync = mock(() => ['style.css', '_partial.css', 'main.css']);
const mockResolve = mock(() => '/mocked/path');

fs.readdirSync = mockReaddirSync as unknown as typeof fs.readdirSync;
path.resolve = mockResolve as unknown as typeof path.resolve;

test('getCssFiles should return an array of CSS files', () => {
  const result = getCssFiles();
  expect(result).toEqual(['/assets/css/common/style.css', '/assets/css/common/main.css']);
});

test('getCssFiles should handle errors gracefully', () => {
  fs.readdirSync = mock(() => { throw new Error('Test error'); });
  const consoleSpy = mock(() => {});

  console.error = consoleSpy;

  const result = getCssFiles();
  expect(result).toEqual([]);
  expect(consoleSpy).toHaveBeenCalledWith('Error reading styles directory:', expect.any(Error));
});
