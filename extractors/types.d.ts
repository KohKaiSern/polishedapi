//This basic, generic type is used to indicate when some data should be stored in two versions: Polished & Faithful.
interface Split<T> {
  polished: T[],
  faithful: T[]
}

//This forms the base of every type, since everything starts from a constants file.
interface Base {
  id: string | null
  index: number
}

//These interfaces dictate what should be fed into GFX-Generating functions.
interface SpriteData extends Base {
  spritePath: string
  palette: [[number, number, number], [number, number, number]]
}

interface GIFData extends SpriteData {
  anim: string[]
}

//The data interfaces
interface Ability extends Base {
  name: string,
  description: string
}

interface Item extends Base {
  name: string;
  description: string;
  price: number | null;
  heldEffect: string | null;
  params: string;
  category: string;
}

interface Move extends Base {
  name: string;
  description: string;
  effect: string;
  basePower: number;
  type: string;
  accuracy: number;
  powerPoints: number;
  effectChance: number;
  category: string;
}

