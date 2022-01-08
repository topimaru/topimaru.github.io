import { FunctionComponent } from "react";
import { Link as RouterLink } from "react-router-dom";

interface Props {
  to?: string;
}

const Link: FunctionComponent<Props> = ({ to, children }) =>
  to ? <RouterLink to={to}>{children}</RouterLink> : <>{children}</>;

export default Link;
