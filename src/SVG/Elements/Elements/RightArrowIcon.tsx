import * as React from 'react';

function RightArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={5} fill="none" {...props}>
      <path
        d="M10.608 2.052C10.2 1.58 9.775.896 9.332 0h.772c.908 1.042 1.873 1.813 2.896 2.313v.374c-1.023.5-1.988 1.271-2.896 2.313h-.772c.443-.896.868-1.58 1.276-2.052H0v-.896h10.608z"
        fill="#81818A"
      />
    </svg>
  );
}

const MemoRightArrowIcon = React.memo(RightArrowIcon);
export default MemoRightArrowIcon;
