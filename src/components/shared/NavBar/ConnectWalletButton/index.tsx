import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@ds/Button";
import { useNavCopy } from "../hooks";

const formatAddress = (address: string) => address.replace(/•+/g, "...");

const ConnectWalletButton: React.FC = () => {
  const { connect } = useNavCopy();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal, mounted, account }) => {
        return (
          <Button
            label={mounted && account ? formatAddress(account?.displayName as string) : connect}
            onClick={account ? openAccountModal : openConnectModal}
            variant="transparent"
          />
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
