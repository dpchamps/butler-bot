declare module "extract-urls" {
  function extractUrl(
    input: string,
    lowercase: boolean = false
  ): string[] | undefined;

  export = extractUrl;
}
