declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: React.ReactElement | null;
    }
  }

  export type PropsWithChildren<
    CustomProps extends Record<string, unknown> = Record<string, unknown>,
  > = CustomProps & {
    children?: (Promise<string | string[]> | undefined)[];
  };
}

export type {};
