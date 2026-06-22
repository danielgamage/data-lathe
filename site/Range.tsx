import { useId } from "react";

export const Range = ({
  label, value, onChange, defaultValue, min = 0, max = 1, ticks, step = 0.005,
}) => {
  const id = useId();

  return (
    <fieldset className="Range">
      <label
        className="name"
        htmlFor={id}
        onDoubleClick={(e) => onChange(defaultValue)}
      >
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        list={`${id}-ticks`}
        onChange={(e) => {
          onChange(parseFloat(e.target.value));
        }} />
      <output className="value">{value.toFixed(2)}</output>
      {ticks && (
        <datalist id={`${id}-ticks`}>
          {ticks.map((tick) => (
            <option key={tick} value={tick} />
          ))}
        </datalist>
      )}
    </fieldset>
  );
};
