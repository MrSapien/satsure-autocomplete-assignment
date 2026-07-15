export type MatchMode = 'prefix' | 'anywhere';

export function matchingSuggestions(
  input: string,
  suggestions: string[],
  mode: MatchMode = 'prefix'
): string[] {
  const normalizedInput = input.trim().toLocaleLowerCase('en-IN');

  if (!normalizedInput) {
    return suggestions;
  }

  return suggestions.filter(suggestion => {
    const normalizedSuggestion = suggestion.toLocaleLowerCase('en-IN');
    return mode === 'anywhere'
      ? normalizedSuggestion.includes(normalizedInput)
      : normalizedSuggestion.startsWith(normalizedInput);
  });
}

export function parseSuggestionList(value: string): string[] {
  if (!value.trim()) {
    return [];
  }
  return value.split(',').map(item => item.trim()).filter(Boolean);
}
