import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp'
const PC_PATH = import.meta.dirname + '/../polishedcrystal/';
const DATA_PATH = import.meta.dirname + '/../data/';
const GFX_PATH = import.meta.dirname + '/../gfx/';

//Parses a file and splits it into two files:
//one containing the Polished data and the other containing the Faithful data.
//The data is stored as an array of strings, with each string being a line in the file.
//All other build options, like HGSS/Monochrome/Noir/NoRTC palettes are set to false.
//It also performs some string replacements, and removes comments, empty lines and macro definitions.
export async function splitRead(path: string): Promise<Split<string>> {
  const files: Split<string> = { polished: [], faithful: [] };
  const raw = readFile(PC_PATH + path, 'utf-8');

  const contents_with_macros: string[] = (await raw)
    .split('\n')
    .map((line) =>
      line
        //String replacements
        .replaceAll('#', 'Poké')
        .replaceAll('Poke', 'Poké')
        .replaceAll('@', '')
        .replaceAll('¯', ' ')
        .replaceAll('PSYCHIC_M', 'PSYCHIC')
        //Removes comments
        .split(';')
        .at(0)!
        .trim()
    )
    //Removes empty lines
    .filter((line) => line != '');

  //Remove macros
  const contents: string[] = []
  for (let i = 0; i < contents_with_macros.length; i++) {
    if (contents_with_macros[i].startsWith('MACRO')) {
      while (!contents_with_macros[i].startsWith('ENDM')) i++;
      continue
    }
    contents.push(contents_with_macros[i])
  }

  //This is where the split happens
  function addLines(faithful: boolean) {
    const data: string[] = []
    //We handle conditional nesting similarly to a C Compiler, via a stack.
    const stack: { including: boolean, done: boolean }[] = []
    const including = () => stack.length === 0 || stack[stack.length - 1].including
    for (const line of contents) {
      if (line.startsWith('if ')) {
        const result = including() && evaluateCondition(line, faithful)
        stack.push({ including: result, done: result })
        continue
      }
      if (line.startsWith('elif ')) {
        const top = stack[stack.length - 1]
        const result = !top.done && evaluateCondition(line, faithful)
        top.including = result
        top.done = top.done || result
        continue
      }
      if (line === 'else') {
        const top = stack[stack.length - 1]
        top.including = !top.done
        continue
      }
      if (line === 'endc') {
        stack.pop()
        continue
      }
      if (including()) data.push(line)
    }
    return data
  }

  function evaluateCondition(line: string, faithful: boolean): boolean {
    const negated = line.includes('!')
    const value = line.includes('FAITHFUL') ? faithful : false
    return negated ? !value : value
  }

  files.polished = addLines(false)
  files.faithful = addLines(true)

  return files;
}

//Consolidates arrays of objects by index. This allows for easier testing of the extraction
//of each individual index-based file.
export function consolidate<T extends Base>(
  //Every array of objects must have the "index" property, and be subsets of the generic type.
  ...dataArrays: (Partial<T> & Pick<Base, "index">)[][]
): T[] {
  const map = new Map<T["index"], T>();
  for (const array of dataArrays) {
    for (const item of array) {
      const existing = map.get(item.index);
      map.set(item.index, existing ? { ...existing, ...item } : item as T);
    }
  }
  return Array.from(map.values());
}

//For writing smaller data files
export async function writeJSON(name: string, obj: object): Promise<void> {
  writeFile(DATA_PATH + `${name}.json`, JSON.stringify(obj, null, 2));
}

//Used when splitting data into individual files
export async function writeSplitJSON<T extends Base>(folder: string, data: Split<T>): Promise<void> {
  //Create folder
  await mkdir(DATA_PATH + folder, { recursive: true })
  for (const entry of data.polished) {
    const faithful_entry: T = data.faithful.find(e => e.index === entry.index)!
    const combined_entry = {
      polished: entry,
      faithful: faithful_entry
    }
    writeJSON(`${folder}/${entry.index}`, combined_entry)
  }
}

//Used for writing manifests. keys is an array that contains every key that should be retained for the manifest.
export async function writeManifestJSON<T extends Base>(name: string, obj: Split<T>, keys: string[]): Promise<void> {
  const manifest: Split<T> = {
    polished: obj.polished.map((item) =>
      Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, (item as Record<string, unknown>)[key]])) as unknown as T
    ),
    faithful: obj.faithful.map((item) =>
      Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, (item as Record<string, unknown>)[key]])) as unknown as T
    ),
  };
  writeJSON(name, manifest);
}

//Applies palette to greyscale PNG and writes to outputPath
export async function applyPalette(sprite: SpriteData, outputPath: string): Promise<void> {
  const data = await sharp(PC_PATH + sprite.spritePath)
    .greyscale()
    .raw()
    .toBuffer();
  const metadata = await sharp(PC_PATH + sprite.spritePath).metadata();
  const levels = Array.from(new Set(data)).sort((a, b) => a - b);
  const palette = [[0, 0, 0], sprite.palette[1].map((c) => c * 8), sprite.palette[0].map((c) => c * 8), [255, 255, 255]];
  const RGBData = Buffer.alloc(data.length * 3);
  for (let i = 0; i < data.length; i++) {
    const [r, g, b] = palette[levels.indexOf(data[i])];
    RGBData[i * 3] = r;
    RGBData[i * 3 + 1] = g;
    RGBData[i * 3 + 2] = b;
  }
  sharp(RGBData, {
    raw: { width: metadata.width!, height: metadata.height!, channels: 3 }
  })
    .png()
    .toFile(GFX_PATH + outputPath + '.png');
}

//Used to applyPalette to an array of SpriteData items
export async function generateSprites(spriteData: SpriteData[], folder: string): Promise<void> {
  //Create folder
  await mkdir(GFX_PATH + folder, { recursive: true })
  for (const sprite of spriteData) {
    applyPalette(sprite, `${folder}/${sprite.index}`)
  }
}


