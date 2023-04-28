import { Button, ButtonGroup } from "@chakra-ui/react";

interface ToggleProps {
  labels: [string, string];
  activeLabel: string;
  onChange: (label: string) => void;
}

function hideConnnectedBorder(index: number, side: "right" | "left") {
  if (index === 0 && side === "right") {
    return "none";
  }
  if (index === 1 && side === "left") {
    return "none";
  }
}

const Toggle: React.FC<ToggleProps> = ({ labels, activeLabel, onChange }) => {
  const handleToggle = (label: string) => {
    if (label !== activeLabel) {
      onChange(label);
    }
  };

  return (
    <ButtonGroup isAttached display="flex" flex={1} height="35px">
      {labels.map((label, index) => (
        <Button
          key={label}
          width="100%"
          variant={label === activeLabel ? "toggleActive" : "toggleInactive"}
          onClick={() => handleToggle(label)}
          borderLeft={hideConnnectedBorder(index, "left")}
          borderRight={hideConnnectedBorder(index, "right")}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default Toggle;
