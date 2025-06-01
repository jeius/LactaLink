import { TemplateProcessorOptions } from '../types';

/**
 * TemplateProcessor is a utility class for processing template strings by replacing
 * variables with their corresponding values.
 *
 * It supports custom delimiters, HTML escaping, and handling of missing variables.
 *
 * @example
 * const processor = new TemplateProcessor({ escapeHtml: true });
 * const template = "Hello, {{name}}!";
 * const variables = { name: "<script>alert('XSS');</script>" };
 * const result = processor.process(template, variables);
 *
 * // result will be "Hello, &lt;script&gt;alert('XSS');&lt;/script&gt;!"
 *
 **/
export class TemplateProcessor {
  constructor(private options: TemplateProcessorOptions = {}) {}

  /**
   * Processes a template string by replacing variables with their values.
   * @param template The template string containing variables in the format {{variableName}}.
   * @param variables An object containing variable names as keys and their corresponding values.
   * @returns The processed string with variables replaced by their values.
   */
  process(template: string, variables?: Record<string, unknown>): string {
    if (!variables) return template;

    const { open = '{{', close = '}}' } = this.options.customDelimiters || {};
    const regex = new RegExp(`${this.escapeRegex(open)}(\\w+)${this.escapeRegex(close)}`, 'g');

    return template.replace(regex, (match, key) => {
      if (!(key in variables)) {
        return this.options.allowMissingVariables ? '' : match;
      }

      const value = String(variables[key]);
      return this.options.escapeHtml ? this.escapeHtml(value) : value;
    });
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m] || m);
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
