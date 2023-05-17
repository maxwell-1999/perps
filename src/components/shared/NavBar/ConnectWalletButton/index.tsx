import { ConnectKitButton } from "connectkit";
import { Button } from "@ds/Button";
import { useIntl } from "react-intl";
import { getNavCopy } from "../copy";

const formatAddress = (address: string) => address.replace(/•+/g, "...");

const ConnectWalletButton: React.FC = () => {
  const intl = useIntl();
  const { connect } = getNavCopy(intl);

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected, truncatedAddress }) => {
        return (
          <Button
            label={isConnected ? formatAddress(truncatedAddress as string) : connect}
            onClick={show}
            variant="transparent"
          />
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default ConnectWalletButton;
