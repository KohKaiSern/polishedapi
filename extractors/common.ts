//This file contains shared extractors. Note that they are all index-based.
//The capitalized arguments are the file text outputs from splitRead.
//Every shared extractor must have an optional start and end parameter.
//They allow you to parse a file between two specific lines if you so choose.
//This is useful for files with multiple sets of constants, like items and key_items.

export function extractConsts(
  CONSTS: string[],
  start?: string,
  end?: string
): Base[] {
  const data = [];
  let lineNo = 0;
  if (start) while (!CONSTS[lineNo].includes(start)) lineNo++;
  //Find starting index
  while (!CONSTS[lineNo].includes('const_def')) lineNo++;
  const match = CONSTS[lineNo].match(/const_def (\d+)/);
  let index = match ? parseInt(match[1]) : 0;
  lineNo++;
  for (; lineNo < CONSTS.length; lineNo++) {
    if (end) if (CONSTS[lineNo].includes(end)) break;
    if (CONSTS[lineNo].startsWith('const')) {
      data.push({
        id: CONSTS[lineNo].startsWith('const_skip') ? null : CONSTS[lineNo].match(/[A-Z_\d]+/)!.at(0)!,
        index
      });
      index++;
    }
  }
  return data;
}

export function extractNames(
  NAMES: string[],
  initial: number,
  start?: string,
  end?: string
): {
  index: number;
  name: string;
}[] {
  const data = [];
  let lineNo = 0;
  if (start) while (!NAMES[lineNo].includes(start)) lineNo++;
  let index = initial;
  for (; lineNo < NAMES.length; lineNo++) {
    if (end) if (NAMES[lineNo].includes(end)) break;
    if (!NAMES[lineNo].includes('"')) continue;
    data.push({
      index,
      name: NAMES[lineNo].split('"').at(1)!
    })
    index++;
  }
  return data;
}

export function extractDescs(
  DESCS: string[],
  initial: number,
  start?: string,
  end?: string
): {
  index: number;
  description: string;
}[] {
  const data = [];
  let lineNo = 0;
  if (start) while (!DESCS[lineNo].includes(start)) lineNo++;
  let index = initial;
  for (; lineNo < DESCS.length; lineNo++) {
    if (end) if (DESCS[lineNo].includes(end)) break;
    if (!DESCS[lineNo].startsWith('dw')) continue;
    const pointer = DESCS[lineNo].slice(3) + ':';
    let descIndex = DESCS.findIndex((l) => l.startsWith(pointer))!;
    while (!DESCS[descIndex].includes('"')) descIndex++;
    let description = '';
    while (DESCS[descIndex].includes('"')) {
      description += DESCS[descIndex].split('"').at(1)!;
      if (description.at(-1)! === '-') {
        description = description.slice(0, -1);
      } else {
        description += ' ';
      }
      descIndex++;
    }
    data.push({
      index,
      description: description.slice(0, -1)
    })
    index++;
  }
  return data;
}

export function extractPals(
  PALS: string[],
  initial: number,
  start?: string,
  end?: string
): {
  index: number,
  palette: [[number, number, number], [number, number, number]]
}[] {
  const data = [];
  let lineNo = 0;
  if (start) while (!PALS[lineNo].includes(start)) lineNo++;
  let index = initial;
  for (; lineNo < PALS.length; lineNo++) {
    if (end) if (PALS[lineNo].includes(end)) break;
    if (!PALS[lineNo].startsWith('RGB')) continue;
    const palette: [[number, number, number], [number, number, number]] = [
      PALS[lineNo].match(/\d+/g)!.slice(0, 3).map(Number) as [number, number, number],
      PALS[lineNo + 1].match(/\d+/g)!.slice(0, 3).map(Number) as [number, number, number],
    ];
    lineNo++;
    data.push({
      index,
      palette,
    })
    index++;
  }
  return data;
}
