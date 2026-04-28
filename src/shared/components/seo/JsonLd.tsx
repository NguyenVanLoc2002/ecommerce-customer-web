import { Helmet } from 'react-helmet-async';

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export const JsonLd = ({ data }: JsonLdProps) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

