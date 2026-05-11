export const appendIf = (
  form: FormData,
  key: string,
  value: string | number | boolean | undefined | null,
) => {
  if (value === undefined || value === null || value === "") return;
  form.append(key, String(value));
};

export const appendDateIf = (form: FormData, key: string, value: string | undefined) => {
  if (!value) return;
  form.append(key, new Date(value).toISOString());
};
