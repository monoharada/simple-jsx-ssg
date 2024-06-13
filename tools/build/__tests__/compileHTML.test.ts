import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import fsPromises from "node:fs/promises";
import { resolve } from "node:path";
import { compileHTML } from "../build"; // ここでモジュールへのパスを指定してください

// モック関数の設定
const mockExecSync = mock(execSync);
const mockExistsSync = mock(existsSync);
const mockMkdirSync = mock(mkdirSync);
const mockWriteFile = mock(fsPromises.writeFile);
const mockResolve = mock(resolve);

// ダミーのディレクトリ存在チェック関数
const mockEnsureDirectoryExistence = mock(() => {});

beforeEach(() => {
  // すべてのモックをリセット
  mockExecSync.mockReset();
  mockExistsSync.mockReset();
  mockMkdirSync.mockReset();
  mockWriteFile.mockReset();
  mockResolve.mockReset();
  mockEnsureDirectoryExistence.mockReset();
});

// test("compileHTML creates necessary directories and builds HTML", async () => {
//   const changedFile = "./src/pages/testPage.tsx";
//   mockExistsSync.mockImplementation((path) => {
//     console.log(`Checking existence of: ${path}`);
//     if (path === "dist" || path === "dist/js" || path === "dist/www") {
//       return false;
//     }
//     return true;
//   });

//   // execSyncのモックを設定
//   mockExecSync.mockImplementation(() => {});

//   // writeFileのモックを設定
//   mockWriteFile.mockImplementation(() => Promise.resolve());

//   await compileHTML(changedFile);

//   console.log(`mockMkdirSync calls: ${mockMkdirSync.mock.calls.length}`);
//   mockMkdirSync.mock.calls.forEach((call, index) => {
//     console.log(`Call ${index + 1}: ${call}`);
//   });

//   // expect(mockMkdirSync).toHaveBeenCalledTimes(3);
//   // expect(mockMkdirSync).toHaveBeenCalledWith("dist");
//   // expect(mockMkdirSync).toHaveBeenCalledWith("dist/js");
//   // expect(mockMkdirSync).toHaveBeenCalledWith("dist/www");

//   // expect(mockExecSync).toHaveBeenCalledWith(`bun build ${changedFile} --outdir dist/js/testPage --target=bun`);

//   const outputHtmlPath = "./dist/www/testPage.html";
//   // ファイルの中身をlogで確認
//   console.log('file is !!',mockWriteFile.mock.calls);
// //   expect(mockWriteFile).toHaveBeenCalledWith(outputHtmlPath, "<!DOCTYPE html>\n<div>Hello World</div>", "utf8");
// });

test("compileHTML handles errors gracefully", async () => {
  const consoleErrorMock = mock(console.error);
  console.error = consoleErrorMock;

  const changedFile = "./src/pages/errorPage.tsx";
  mockExistsSync.mockImplementation(() => { throw new Error("Test error"); });

  await expect(compileHTML(changedFile)).resolves.toBeUndefined();

  expect(consoleErrorMock).toHaveBeenCalledWith("Error during HTML compilation:", expect.any(Error));
  consoleErrorMock.mockReset();
});

test("compileHTML does nothing if no .tsx files are present", async () => {
  const changedFile = "./src/pages/testPage.js";
  mockExistsSync.mockReturnValue(true);

  await compileHTML(changedFile);

  expect(mockExecSync).not.toHaveBeenCalled();
  expect(mockWriteFile).not.toHaveBeenCalled();
});
