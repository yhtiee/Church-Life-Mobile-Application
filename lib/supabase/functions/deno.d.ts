declare module "https://*" {
  const content: any;
  export default content;
  export const createClient: any;
}

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};
