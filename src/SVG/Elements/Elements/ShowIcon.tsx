export const ShowIcon = ({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: (a: any) => void;
}) => (
  <div
    role="button"
    title={
      !show
        ? 'Click to view the Trade in Chart'
        : 'Click to hide the Trade from Chart'
    }
    onClick={() => onToggle((t) => !t)}
  >
    {!show ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={17}
        height={17}
        fill="none"
      >
        <rect width={17} height={17} fill="#282B39" rx={2} />
        <path
          fill="#C3C2D4"
          fillRule="evenodd"
          d="M12.586 8.782c-.326.194-.615.369-.914.549.076.17.163.35.24.53.125.295 0 .582-.3.684-.293.102-.582-.01-.734-.296-.092-.175-.136-.428-.288-.496-.152-.068-.408.049-.62.083-.114.02-.229.034-.375.058-.017.233-.011.471-.05.71-.037.233-.212.369-.478.393-.267.024-.495-.097-.582-.311a.702.702 0 0 1-.033-.238c-.005-.175 0-.355 0-.54-.359-.062-.701-.126-1.066-.189-.081.17-.157.34-.244.51-.153.302-.44.423-.745.321-.31-.107-.425-.394-.289-.71.071-.164.147-.33.229-.504-.294-.175-.588-.35-.909-.545-.146.136-.288.282-.446.413-.255.214-.576.224-.805.03-.239-.205-.239-.496.017-.734.147-.14.315-.262.478-.398-.087-.107-.152-.185-.212-.263-.212-.272-.18-.558.076-.733.25-.175.572-.117.816.121.316.306.615.646.985.894 1.958 1.326 4.726.967 6.222-.772.109-.127.26-.258.424-.316a.518.518 0 0 1 .598.18.441.441 0 0 1 .022.549c-.065.102-.158.199-.31.36.168.12.348.227.5.363.261.234.272.53.05.734-.235.219-.566.209-.844-.03-.141-.13-.266-.266-.413-.407Z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={17}
        height={17}
        fill="none"
      >
        <rect width={17} height={17} fill="#282B39" rx={2} />
        <path
          fill="#C3C2D4"
          fillRule="evenodd"
          d="M8.217 4.69a6.287 6.287 0 0 1 3.04.82 7.452 7.452 0 0 1 1.512 1.128c.473.45.867.95 1.229 1.497a.394.394 0 0 1 0 .451 8.384 8.384 0 0 1-1.764 1.98c-.82.644-1.717 1.095-2.726 1.32-.362.081-.74.13-1.118.13a6.134 6.134 0 0 1-2.284-.37 6.733 6.733 0 0 1-1.67-.903 8.24 8.24 0 0 1-1.859-1.932c-.063-.08-.11-.16-.173-.257a.372.372 0 0 1 0-.403C3.08 7.09 3.948 6.203 5.019 5.575a6.197 6.197 0 0 1 2.473-.837c.252-.016.488-.032.725-.049Zm-.063 6.585c.346 0 .63-.016.913-.065a5.645 5.645 0 0 0 2.237-.885 7.389 7.389 0 0 0 1.938-1.916c.031-.032.031-.065 0-.097a9.22 9.22 0 0 0-.882-1.062c-.536-.532-1.134-.983-1.828-1.289a5.502 5.502 0 0 0-3.087-.466 5.402 5.402 0 0 0-2.332.901A7.51 7.51 0 0 0 3.16 8.328c-.016.033-.016.049 0 .08.268.387.567.742.898 1.08a6.333 6.333 0 0 0 1.638 1.191c.804.387 1.638.596 2.458.596Z"
          clipRule="evenodd"
        />
        <path
          fill="#C3C2D4"
          fillRule="evenodd"
          d="M8.402 10.21a1.951 1.951 0 0 1-1.954-1.97 1.98 1.98 0 0 1 1.924-1.938c1.099-.015 2 .885 1.984 1.984a1.961 1.961 0 0 1-1.954 1.924Zm1.252-1.954c0-.687-.565-1.252-1.252-1.252-.717 0-1.267.595-1.267 1.267a1.26 1.26 0 0 0 2.519-.015Z"
          clipRule="evenodd"
        />
        <circle cx={8.402} cy={8.256} r={1.466} fill="#C3C2D4" />
      </svg>
    )}
  </div>
);
