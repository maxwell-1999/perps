import { ConnectKitButton } from "connectkit";
import { Button } from "@ds/Button";
import { useNavCopy } from "../hooks";

const formatAddress = (address: string) => address.replace(/•+/g, "...");

const ConnectWalletButton: React.FC = () => {
  const { connect } = useNavCopy();

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
