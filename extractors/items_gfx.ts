import { extractConsts, extractPals } from './common';
import { splitRead, consolidate } from './utils';

/*
Entry Point: constants/item_constants
Retrieves:
Sprite Paths: data/items/icon_pointers -> gfx/items
Palettes: gfx/items/items
*/

function extractSprites(POINTERS: string[], PATHS: string[]): {
  index: number;
  spritePath: string;
}[] {
  let index = 0;
  const data = [];
  for (let lineNo = 0; lineNo < POINTERS.length; lineNo++) {
    if (POINTERS[lineNo].includes('NUM_ITEMS')) break;
    if (!POINTERS[lineNo].startsWith('dba ')) continue;
    const pointer = POINTERS[lineNo].replace('dba ', '') + '::'
    let pathIndex = PATHS.findIndex(l => l.startsWith(pointer))
    while (!PATHS[pathIndex].includes('"')) pathIndex++;
    const spritePath = PATHS[pathIndex].split('"').at(1)!.replace('2bpp.lz', 'png')
    data.push({
      index,
      spritePath
    })
    index++;
  }
  return data
}

let items: SpriteData[] = [];

const files: string[][] = (await Promise.all(
  [
    'constants/item_constants.asm',
    'data/items/icon_pointers.asm',
    'gfx/items.asm',
    'gfx/items/items.pal'
  ].map((path) => splitRead(path))
)).map(
  file => file.polished
)

const consts = extractConsts(files[0], undefined, 'NUM_ITEMS');
const sprites = extractSprites(files[1], files[2])
const palettes = extractPals(files[3], 0)
items = consolidate<SpriteData>(consts, sprites, palettes)

export default items
