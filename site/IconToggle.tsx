import SVG from "react-inlinesvg";
import classnames from "classnames";

export const IconToggle = ({
  checked, onChange, label, icon, size, highlighted = true,
}) => {
  return (
    <label className={classnames("IconToggle", { highlighted }, size, icon, { checked })}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        aria-label={label} />
      <SVG src={`/icons/${icon}.svg`} />
    </label>
  );
};
