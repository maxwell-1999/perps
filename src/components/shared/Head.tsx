import NextHead from "next/head";

interface HeadProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function Head({ title, children, description }: HeadProps) {
  const pageDescription = description
    ? description
    : "Perennial is the defi-native derivatives platform for traders and developers.";
  return (
    <NextHead>
      <title>{`Perennial - ${title}`}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/logo.svg" />
      {children}
    </NextHead>
  );
}
