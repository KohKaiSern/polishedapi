import { extractNames } from './common';
import { splitRead, consolidate, splitReadFolder } from './utils'

/*
Entry Point: constants/pokemon_constants
Retrieves:
Names: data/pokemon/names,
Base Data: data/pokemon/base_stats -> data/pokemon/base_stats/[pokemon]
*/

//Global Variables: These are important for distinguishing between:
//Pokemon Species, Functional Forms & Cosmetic Forms.
//They also provide form numbers.
const globals: Record<string, number> = {};

function extractConsts(CONSTS: string[]): Base[] {
  const data = [];
  let lineNo = 0;
  while (!CONSTS[lineNo].includes('const_def')) lineNo++;
  let index = parseInt(CONSTS[lineNo].match(/\d+/)!.at(0)!);
  for (; lineNo < CONSTS.length; lineNo++) {

    //Global Variable Updates
    if (CONSTS[lineNo].startsWith('DEF NUM_SPECIES')) {
      globals.NUM_SPECIES = index - 1;
    }
    else if (CONSTS[lineNo].startsWith('DEF NUM_COSMETIC_FORMS')) {
      globals.NUM_COSMETIC_FORMS = index - globals.NUM_SPECIES! - 1;
    }

    if (/const(_skip)?(?!_)/.test(CONSTS[lineNo])) {
      data.push({
        id: CONSTS[lineNo].startsWith('const_skip')
          ? null
          : CONSTS[lineNo].match(/[A-Z][A-Z_\d]+/)!.at(0)!,
        index
      });
      index++;
    }
  }
  return data
}

const pokemon: Split<Pokemon> = {
  polished: [],
  faithful: []
}

const files = await Promise.all(
  [
    'constants/pokemon_constants.asm',
    'data/pokemon/names.asm',
    'data/pokemon/base_stats.asm'
  ].map((path) => splitRead(path))
);

for (const PF of ['polished', 'faithful'] as const) {
  const consts = extractConsts(files[0][PF]);
  const names = extractNames(files[1][PF], 0);
  pokemon[PF] = consolidate<Pokemon>(consts, names)
}

export default pokemon;
