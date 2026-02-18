import { extractConsts, extractNames, extractDescs } from './common';
import { splitRead, consolidate } from './utils';

/*
Entry Point: constants/item_constants
Retrieves:
Names: data/items/names
Descriptions: data/items/descriptions
Attributes (Price, Held Effect, Params, Category): data/items/attributes
*/

function extractAttrs(ATTRS: string[]): {
  index: number;
  price: number | null;
  heldEffect: string | null;
  params: string;
  category: string;
}[] {
  const data = [];
  let index = 1;
  for (let lineNo = 0; lineNo < ATTRS.length; lineNo++) {
    if (ATTRS[lineNo].includes('NUM_ITEMS')) break;
    if (!ATTRS[lineNo].startsWith('item_attribute')) continue;
    const match = ATTRS[lineNo].match(/item_attribute (\d+), (.+?), (.+?), (.+?),/)!;
    //Convert zero price -> null and zero held effect -> null.
    const price: number | null = match[1] === '0' ? null : parseInt(match[1]);
    const heldEffect: string | null = match[2] === '0' ? null : match[2];
    data.push({
      index,
      price,
      heldEffect,
      params: match[3],
      category: match[4]
    });
    index++;
  }
  return data;
}

const items: Split<Item> = {
  polished: [],
  faithful: []
}

const files = await Promise.all(
  [
    'constants/item_constants.asm',
    'data/items/names.asm',
    'data/items/descriptions.asm',
    'data/items/attributes.asm'
  ].map((path) => splitRead(path))
);

for (const PF of ['polished', 'faithful'] as const) {
  const consts = extractConsts(files[0][PF], undefined, 'NUM_ITEMS');
  const names = extractNames(files[1][PF], 0);
  const descs = extractDescs(files[2][PF], 0, undefined, 'NUM_ITEMS');
  const attrs = extractAttrs(files[3][PF]);
  items[PF] = consolidate<Item>(consts, names, descs, attrs)
}

export default items;
