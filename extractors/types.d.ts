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

interface Ability extends Base {
  name: string,
  description: string
}

interface Item extends Base {
  name: string;
  description: string;
  price: number | null;
  heldEffect: string | null;
  category: string;
}

interface SpriteData extends Base {
  spritePath: string
  palette: [[number, number, number], [number, number, number]]
}

interface GIFData extends SpriteData {
  anim: string[]
}
