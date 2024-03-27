const INNER_ITEM_MATCH_REGEX: RegExp = /%{([?.\w]*)}/g; // match = 1

export function format(str: string, params: any): string {
  let counter = 0;

  return str.replace(INNER_ITEM_MATCH_REGEX, (_, match) => {
    if (typeof match === 'string' && match.length) {
      return params[match];
    }

    return params[counter++];
  });
}
