import { FunctionComponent } from "react";

interface Props {
  to?: string;
}

const ExternalLink: FunctionComponent<Props> = ({ to, children }) =>
  to ? (
    <a href={to} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <>{children}</>
  );

export default ExternalLink;
