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
  return []
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
  const attrs = extractAttrs(files[3][PF])
  moves[PF] = consolidate<Move>(consts, names, descs, attrs)
}

export default moves;
