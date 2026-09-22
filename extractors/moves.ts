import { extractConsts, extractNames, extractDescs } from './common';
import { splitRead, consolidate } from './utils';

/*
Entry Point: constants/move_constants
Retrieves:
Names: data/moves/names
Descriptions: data/moves/descriptions
Attributes: data/moves/moves
*/

function extractAttrs(ATTRS: string[]): {
  index: number;
  effect: string;
  basePower: number;
  type: string;
  accuracy: number;
  powerPoints: number;
  effectChance: number;
  category: string;
}[] {
  const data = [];
  let index = 1;
  for (let lineNo = 0; lineNo < ATTRS.length; lineNo++) {
    if (!ATTRS[lineNo].startsWith('move')) continue;
    const match = ATTRS[lineNo].match(/move (\w+),\s+(\w+),\s+(\d+),\s+(\w+),\s+(-?\d+),\s+(\d+).\s+(\d+),\s+(\w+)/)!;
    const effect: string = match[2];
    const basePower: number = parseInt(match[3]);
    const type: string = match[4];
    const accuracy: number = parseInt(match[5]);
    const powerPoints: number = parseInt(match[6]);
    const effectChance: number = parseInt(match[7]);
    const category: string = match[8];
    data.push({
      index,
      effect,
      basePower,
      type,
      accuracy,
      powerPoints,
      effectChance,
      category
    });
    index++;
  }
  return data;
}

const moves: Split<Move> = {
  polished: [],
  faithful: []
}

const files = await Promise.all(
  [
    'constants/move_constants.asm',
    'data/moves/names.asm',
    'data/moves/descriptions.asm',
    'data/moves/moves.asm'
  ].map((path) => splitRead(path))
);

for (const PF of ['polished', 'faithful'] as const) {
  const consts = extractConsts(files[0][PF]);
  const names = extractNames(files[1][PF], 1);
  const descs = extractDescs(files[2][PF], 1);
  const attrs = extractAttrs(files[3][PF]);
  moves[PF] = consolidate<Move>(consts, names, descs, attrs)
}

export default moves;
