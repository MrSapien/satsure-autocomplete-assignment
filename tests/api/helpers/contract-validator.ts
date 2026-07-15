import * as AjvNamespace from 'ajv';
import type { ErrorObject } from 'ajv';
import * as addFormatsNamespace from 'ajv-formats';
import { parse } from 'bcp-47';
import { autocompleteResponseSchema } from '../schema/autocomplete-response.schema.js';

// Ajv and ajv-formats publish CommonJS-compatible default exports. This small
// interop wrapper keeps the project executable under Node ESM and NodeNext TS.
const AjvConstructor = (AjvNamespace as unknown as { default: new (options?: object) => any }).default;
const addFormats = (addFormatsNamespace as unknown as { default: (ajv: any) => void }).default;

const ajv = new AjvConstructor({ allErrors: true, strict: false });
addFormats(ajv);

ajv.addFormat('bcp47', {
  type: 'string',
  validate: (value: string) => {
    const parsed = parse(value);
    return Boolean(parsed.language || parsed.regular || parsed.irregular);
  }
});

ajv.addFormat('ist-local-date-time', {
  type: 'string',
  validate: (value: string) => {
    const istPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?\+05:30$/;
    return istPattern.test(value) && !Number.isNaN(Date.parse(value));
  }
});

const validate = ajv.compile(autocompleteResponseSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export function validateAutocompleteResponse(payload: unknown): ValidationResult {
  const valid = validate(payload);
  return {
    valid: Boolean(valid),
    errors: [...(validate.errors ?? [])]
  };
}
