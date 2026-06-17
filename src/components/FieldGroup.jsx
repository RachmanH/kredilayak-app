export default function FieldGroup({ title, children }) {
  return (
    <fieldset className="field-group">
      <legend className="field-group__legend">{title}</legend>
      <div className="field-group__body">{children}</div>
    </fieldset>
  );
}
