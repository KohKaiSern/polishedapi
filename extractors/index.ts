import { writeSplitJSON, writeJSON } from "./utils";
import abilities from "./abilities";
import items from "./items"

writeSplitJSON('abilities', abilities)
writeSplitJSON('items', items)

