import { writeSplitJSON, writeJSON } from "./utils";
import abilities from "./abilities";
import items from "./items"
import pokemon from "./pokemon";

writeSplitJSON('abilities', abilities)
writeSplitJSON('items', items)
writeJSON('pokemon', pokemon)

