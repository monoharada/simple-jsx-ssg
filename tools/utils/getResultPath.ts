import path from 'node:path';

export function getResultPath(currentFilePath: string): string {
  if (typeof currentFilePath !== 'string') {
    throw new TypeError('currentFilePath must be of type string');
  }

  // ディレクトリ名を取得
  const directoryName = path.dirname(currentFilePath);

  // ファイル名（拡張子なし）を取得
  const fileNameWithoutExtension = path.basename(currentFilePath, path.extname(currentFilePath));

  // パスを分割
  const pathParts = directoryName.split(path.sep);

  // 'pages' の後の部分だけを抽出
  const pageIndex = pathParts.indexOf('pages');
  const relevantParts = pathParts.slice(pageIndex + 1);

  // 抽出した部分にファイル名を追加
  return path.join(...relevantParts, fileNameWithoutExtension);
}