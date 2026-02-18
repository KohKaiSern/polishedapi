import { writeSplitJSON } from "./utils";
import abilities from "./abilities";
import items from "./items"
import moves from "./moves";

writeSplitJSON('abilities', abilities)
writeSplitJSON('items', items)
writeSplitJSON('moves', moves)

