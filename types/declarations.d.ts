declare module "*.svg" {
  import { ReactElement, SVGProps } from "react";
  const content: (props: SVGProps<SVGSVGElement>) => ReactElement;
  const src: string;
  export default src;
}

declare module "*.png" {
  const value: any;
  export = value;
}
