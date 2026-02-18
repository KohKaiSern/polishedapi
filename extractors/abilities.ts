import { extractConsts, extractNames, extractDescs } from './common';
import { splitRead, consolidate } from './utils';

/*
Entry Point: constants/ability_constants
Retrieves:
Names: data/abilities/names
Descriptions: data/abilities/descriptions
*/

const abilities: Split<Ability> = {
  polished: [],
  faithful: []
}

const files = await Promise.all(
  [
    'constants/ability_constants.asm',
    'data/abilities/names.asm',
    'data/abilities/descriptions.asm'
  ].map((path) => splitRead(path))
);

for (const PF of ['polished', 'faithful'] as const) {
  const consts = extractConsts(files[0][PF]);
  const names = extractNames(files[1][PF], 0);
  const descs = extractDescs(files[2][PF], 0);
  abilities[PF] = consolidate<Ability>(consts, names, descs)
}

export default abilities;
