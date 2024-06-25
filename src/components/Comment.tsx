type p = PropsWithChildren<{ text: string; ssi?: never } | { ssi: string; text?: never }>;

const Comment = ({ text, ssi }: p) => {
  if (ssi) {
    return `<!--#include virtual="${ssi}" -->`;
  }
  return `<!-- ${text} -->`;
};

export default Comment;
