import { LuxuryNavigation } from "@/components/customer/LuxuryNavigation";

type Props = {
  actions?: React.ReactNode;
};

/** @deprecated Use LuxuryNavigation — kept for existing imports */
export function TopBar(props: Props) {
  return <LuxuryNavigation {...props} />;
}
