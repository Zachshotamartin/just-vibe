// Minimal JSON Schema subset used by MCP tool input schemas.
export function validateSchema(value, shape, path = 'arguments') {
  if (shape.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw Error(`${path} must be an object.`);
    if (
      shape.additionalProperties === false &&
      Object.keys(value).some((k) => !Object.hasOwn(shape.properties, k))
    )
      throw Error(`Unknown ${path} field.`);
    for (const key of shape.required || [])
      if (!Object.hasOwn(value, key)) throw Error(`Missing ${path}.${key}.`);
    for (const [key, entry] of Object.entries(value))
      if (shape.properties?.[key]) validateSchema(entry, shape.properties[key], `${path}.${key}`);
  } else if (shape.type === 'string') {
    if (
      typeof value !== 'string' ||
      value.length < (shape.minLength || 0) ||
      value.length > (shape.maxLength || 20000)
    )
      throw Error(`Invalid ${path}.`);
  } else if (shape.type === 'integer') {
    if (
      !Number.isSafeInteger(value) ||
      value < (shape.minimum ?? -Infinity) ||
      value > (shape.maximum ?? Infinity)
    )
      throw Error(`Invalid ${path}.`);
  } else if (shape.type === 'array') {
    if (
      !Array.isArray(value) ||
      value.length > (shape.maxItems || 100) ||
      value.length < (shape.minItems || 0)
    )
      throw Error(`Invalid ${path}.`);
    value.forEach((v) => validateSchema(v, shape.items, path));
  } else if (shape.type === 'boolean' && typeof value !== 'boolean') {
    throw Error(`Invalid ${path}.`);
  }
  if (shape.enum && !shape.enum.includes(value)) throw Error(`Unsupported ${path}.`);
}
