import { ConnectKitButton } from "connectkit";
import { Button } from "@ds/Button";

const formatAddress = (address: string) => address.replace(/•+/g, "...");

const ConnectWalletButton: React.FC = () => {
  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected, truncatedAddress }) => {
        return (
          <Button
            label={isConnected ? formatAddress(truncatedAddress as string) : "Connect"}
            onClick={show}
            variant="transparent"
          />
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default ConnectWalletButton;
